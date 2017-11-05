import url = require('url')
import WebSocket = require('ws')
import { Game } from './Game'
import { RuleEnforcer } from './RuleEnforcer';
import { Broadcaster } from './Broadcaster';

export class Receiver {
	wss: WebSocket.Server;
	game: Game;

	// make game instance of Game class
	constructor(ws: WebSocket.Server, game: Game) {
		this.wss = ws;
		this.game = game;

		this.setupSocketServer();
	}

	setupSocketServer() {
		this.wss.on('connection', (socket, req) => {
			socket.on('message', (message) => {
				this.handleMessage(JSON.parse(message.toString()), socket);
			});

			socket.on('close', (ws, req) => {
				this.game.removePerson(socket);
				console.log('Closed connection');
			});

			// socket.send('Hi there socket!');
		});
	}

	handleMessage(message: any, socket: WebSocket) {
		console.log(message)
		console.log(typeof message);

		if(message.hasOwnProperty('action')) {
			let action: string = message.action;

			switch(action) {
				case "setName":
					console.log('Case setName reached');
					this.game.registerLoiterer(message.name, socket);
					break;

				case "switchTeam":
					this.game.switchLoitererTeam(message.id);
					console.log('Case switchTeam reached');
					break;

				case "startGame":
					if(RuleEnforcer.canStartGame(this.game.getRoster(this.game.loiterers))) {
						this.game.startGame();
					};
					console.log('Case startGame reached');
					break;

				case "sendClue":
					console.log('Case sendClue reached');
					if(RuleEnforcer.isLegalClue(message.clue) && RuleEnforcer.isPlayerTurn(this.game, this.game.getPlayerById(message.id))) {
						this.game.initializeClue(message.clue);
					}
					else {
						const promptAgain = {
							action: "invalidClue",
						}
						socket.send(JSON.stringify(promptAgain));
					}
					break;

				case "selectCard":
					const player1 = this.game.getPlayerById(message.id);
					if(RuleEnforcer.isSelectableCard(this.game, message.cardIndex) && !RuleEnforcer.isPlayerSpy(this.game, player1)) {
						this.game.selectCard(player1, message.cardIndex);
					}
					console.log('Case selectCard reached');
					break;

				case "deselectCard":
					const player2 = this.game.getPlayerById(message.id);
					if(RuleEnforcer.isSelectableCard(this.game, message.cardIndex) && !RuleEnforcer.isPlayerSpy(this.game, player2)) {
						this.game.deselectCard(player2, message.cardIndex);
					}
					console.log('Case deselectCard reached');
					break;

				case "submitGuess":
					const submittingPlayer = this.game.getPlayerById(message.id);
					const submitGuess = RuleEnforcer.canSubmitGuess(this.game);
					if(!RuleEnforcer.isPlayerSpy(this.game, submittingPlayer) &&
						!RuleEnforcer.isPlayerTurn(this.game, submittingPlayer) &&
						submitGuess[0]) {
						this.game.checkGuess(submitGuess[1]);
					}
					console.log('Case submitGuess reached');
					break;

				case "endGame":

					console.log('Case endTurn reached');
					break;

				case "sendMessage":
					const player = this.game.getPlayerById(message.id);
					if(!RuleEnforcer.isPlayerSpy(this.game, player)) {
						Broadcaster.sendMessage(this.game.players, message.chat, player)
					}
					console.log('Case sendMessage reached');
					break;

				default:
					console.log(`Whoops don't know what ${message} is`);
			}
		}
	}

	genericBounceBack() {

	}
}
