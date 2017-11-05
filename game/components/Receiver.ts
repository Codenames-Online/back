import ws = require('ws')
import url = require('url')

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
					if(RuleEnforcer.canStartGame(gu.getSloitererRoster(this.game.loiterers))) {
						this.game.startGame();
					};
					console.log('Case startGame reached');
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

				case "selectCard":
					let player1: SOperative = this.game.getPlayerById(message.id) as SOperative;
					if(RuleEnforcer.isSelectableCard(this.game, message.cardIndex) && !RuleEnforcer.isPlayerSpy(this.game, player1)) {
						this.game.selectCard(player1, message.cardIndex);
					}
					console.log('Case selectCard reached');
					break;

				case "deselectCard":
					let player2: SOperative = this.game.getPlayerById(message.id) as SOperative;
					if(RuleEnforcer.isSelectableCard(this.game, message.cardIndex) && !RuleEnforcer.isPlayerSpy(this.game, player2)) {
						this.game.deselectCard(player2, message.cardIndex);
					}
					console.log('Case deselectCard reached');
					break;

				case "submitGuess":
					console.log('Case submitGuess reached');
					
					const submittingPlayer = this.game.getPlayerById(message.id);
					let [ canGuess, index ] = RuleEnforcer.canSubmitGuess(this.game);
					
					if(canGuess
						&& !RuleEnforcer.isPlayerSpy(this.game, submittingPlayer)
						&& RuleEnforcer.isPlayerTurn(this.game, submittingPlayer)) {
						// if made it inside we know index is valid
						this.game.checkGuess(index as number);
					}
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

				default:
					console.log(`Whoops don't know what ${message} is`);
			}
		}
	}
}
