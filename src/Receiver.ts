import ws = require('ws')
import url = require('url')

import { Card } from './Card'
import { Game } from './Game'
import { Agent } from './Agent'
import { Operative } from './Operative'
import { Broadcaster } from './Broadcaster';
import { RuleEnforcer as re } from './RuleEnforcer';
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
					if (re.isValidName(message.name)) {
						this.game.registerLoiterer(message.name, socket);
					}
					break;

				case "switchTeam":
					this.game.switchLoitererTeam(message.id);
					console.log('Case switchTeam reached');
					break;

				case "startGame":
					console.log('Case startGame reached');
					if(re.canStartGame(gu.getSloitererTeams(this.game.loiterers))) {
						this.game.startGame();
					};
					break;

				case "sendClue":
					console.log('Case sendClue reached');
					if(re.isLegalClue(message.clue, this.game.board.cards)
					&& re.isPlayerTurn(this.game.currTeam, this.game.turn, this.game.getPlayerById(message.id))) {
						this.game.initializeClue(message.clue);
					} else {
						if(!re.isValidWord(message.clue.word)) {
							socket.send(JSON.stringify({ action: "invalidClueWord", reason: "notWord"}));
						} else if(re.isWordOnBoard(message.clue.word, this.game.board.cards)) {
							socket.send(JSON.stringify({ action: "invalidClueWord", reason: "wordOnBoard"}));							
						} else if(!re.isValidNumGuesses(message.clue.num)) {
							socket.send(JSON.stringify({ action: "invalidClueNum", }));
						}
					}
					break;

				case "toggleCard": {
					console.log('Case toggleCard reached');
					let sop: Operative = this.game.getPlayerById(message.id) as Operative;
					if(re.isCardSelectable(this.game.board.cards, message.cardIndex)
						&& re.isPlayerTurn(this.game.currTeam, this.game.turn, sop)
						&& !re.isPlayerSpy(sop)) {
						let previousSelection = this.game.board.cards.findIndex((card: Card) => {
							return card.votes.indexOf(sop.name) !== -1;
						});

						if(previousSelection !== -1) {
							console.log('first');
							this.game.toggleCard(sop, previousSelection);
						}

						if (Number(previousSelection) !== Number(message.cardIndex)) {
							console.log('second');
							this.game.toggleCard(sop, message.cardIndex);
						}
					}

					let canGuess= re.canSubmitGuess(this.game.findOperatives(), this.game.currTeam);
					if(canGuess
						&& !re.isPlayerSpy(sop)
						&& re.isPlayerTurn(this.game.currTeam, this.game.turn, sop)) {
						this.game.guessAllowed();
					}

					break;
				}

				case "submitGuess":
					console.log('Case submitGuess reached');
					let sop: Operative = this.game.getPlayerById(message.id) as Operative;
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
					if(!re.isPlayerSpy(player)) {
						Broadcaster.sendMessage(this.game.players, message.text, player)
					}
					break;

				case "endTurn":
					console.log('Case endTurn reached');

					let sp: Agent = this.game.getPlayerById(message.id) as Agent;
					if(re.isPlayerTurn(this.game.currTeam, this.game.turn, sp)) {
						this.game.switchActiveTeam();
					}

					break;
				default:
					console.log(`Whoops don't know what ${message} is`);
			}
		}
	}
}
