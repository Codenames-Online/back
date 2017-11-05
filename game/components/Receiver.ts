import ws = require('ws')
import url = require('url')

import { Card } from './Card'
import { Game } from './Game'
import { SPlayer } from './SPlayer'
import { SOperative } from './SOperative'
import { Broadcaster } from './Broadcaster';
import { RuleEnforcer } from './RuleEnforcer';
import { GameUtility as gu } from './GameUtility'

export class Receiver {
	wss: ws.Server;
	game: Game;

	// make game instance of Game class
	constructor(socketServer: ws.Server, game: Game) {
		this.wss = socketServer;
		this.game = game;

		this.setupSocketServer();
	}

	setupSocketServer() {
		this.wss.on('connection', (socket, req) => {
			socket.on('message', (message) => {
				this.handleMessage(JSON.parse(message.toString()), socket);
			});

			socket.on('close', (req) => {
				this.game.removePerson(socket);
				console.log('Closed connection');
			});
		});
	}

	handleMessage(message: any, socket: ws) {
		console.log(message)

		if(message.hasOwnProperty('action')) {
			let action: string = message.action;

			switch(action) {
				case "setName":
					console.log('Case setName reached');
					if (RuleEnforcer.isValidName(message.name)) {
						this.game.registerLoiterer(message.name, socket);
					}
					break;

				case "switchTeam":
					this.game.switchLoitererTeam(message.id);
					console.log('Case switchTeam reached');
					break;

				case "startGame":
					console.log('Case startGame reached');
					if(RuleEnforcer.canStartGame(gu.getSloitererRoster(this.game.loiterers))) {
						this.game.startGame();
					};
					break;

				case "sendClue":
					console.log('Case sendClue reached');
					let legalClue: boolean = RuleEnforcer.isLegalClue(message.clue);
					let theirTurn: boolean = RuleEnforcer.isPlayerTurn(this.game, this.game.getPlayerById(message.id));
					if(legalClue && theirTurn) {
						this.game.initializeClue(message.clue);
					} else {
						const promptAgain = { action: "invalidClue", }
						socket.send(JSON.stringify(promptAgain));
					}
					break;

				case "toggleCard": {
					console.log('Case toggleCard reached');
					let sop: SOperative = this.game.getPlayerById(message.id) as SOperative;
					if(RuleEnforcer.isSelectableCard(this.game, message.cardIndex)
						&& RuleEnforcer.isPlayerTurn(this.game, sop)
						&& !RuleEnforcer.isPlayerSpy(this.game, sop)) {
						let previousSelection = this.game.board.cards.findIndex((card: Card) => {
							return card.votes.indexOf(sop.name) !== -1;
						});

						console.log(previousSelection);
						console.log(message.cardIndex);
						if(previousSelection !== -1) {
							console.log('first');
							this.game.toggleCard(sop, previousSelection);
						}

						if (Number(previousSelection) !== Number(message.cardIndex)) {
							console.log('second');
							this.game.toggleCard(sop, message.cardIndex);
						}
					}

					let [ canGuess, index ] = RuleEnforcer.canSubmitGuess(this.game);
					if(canGuess
						&& !RuleEnforcer.isPlayerSpy(this.game, sop)
						&& RuleEnforcer.isPlayerTurn(this.game, sop)) {
						// if made it inside we know index is valid
						this.game.guessAllowed();
					}

					break;
				}

				case "submitGuess":
					console.log('Case submitGuess reached');
					let sop: SOperative = this.game.getPlayerById(message.id) as SOperative;
					let currSelection = this.game.board.cards.findIndex((card: Card) => {
						return card.votes.indexOf(sop.name) !== -1;
					});

					this.game.checkGuess(currSelection as number);

					this.game.findOperatives().filter(op => op.team === sop.team).forEach(
						innerOp => this.game.toggleCard(innerOp, currSelection)
					)
					break;

				case "endGame":
					console.log('Case endTurn reached');
					break;

				case "sendMessage":
					console.log('Case sendMessage reached');

					const player = this.game.getPlayerById(message.id);
					if(!RuleEnforcer.isPlayerSpy(this.game, player)) {
						Broadcaster.sendMessage(this.game.players, message.text, player)
					}
					break;

				case "endTurn":
					console.log('Case endTurn reached');

					let sp: SPlayer = this.game.getPlayerById(message.id) as SPlayer;
					if(RuleEnforcer.isPlayerTurn(this.game, sp)) {
						this.game.switchActiveTeam();
					}

					break;
				default:
					console.log(`Whoops don't know what ${message} is`);
			}
		}
	}
}
