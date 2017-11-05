import url = require('url')
import WebSocket = require('ws')
import { Game } from './Game'
import { RuleEnforcer } from './RuleEnforcer';
import { Broadcaster } from './Broadcaster';

export class Receiver {
	wss: WebSocket.Server;
	game;

	// make game instance of Game class
	constructor(ws: WebSocket.Server, game) {
		this.wss = ws;
		this.game = game;

		this.setupSocketServer();
	}

	setupSocketServer() {
		this.wss.on('connection', (socket, req) => {
			socket.on('message', (message) => {
				let data = JSON.parse(message.toString());
				console.log(data);

				this.handleMessage(data, socket);
			});

			socket.on('close', (ws, req) => {
				this.game.removePerson(socket);
				console.log('Closed connection');
			});

			socket.send('Hi there socket!');
		});
	}

	handleMessage(message: any, socket: WebSocket) {
		if(message.hasOwnProperty('action')) {
			let action: string = message.action;
			console.log(message);
			
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
					const player = this.game.getPlayerById(message.id);
					if(RuleEnforcer.isSelectableCard(this.game, message.cardIndex) && !RuleEnforcer.isPlayerSpy(this.game, player)) {
						this.game.selectCard(player, message.cardIndex);
					}
					console.log('Case selectCard reached');
					break;

				case "deselectCard":
					const player = this.game.getPlayerById(message.id);
					if(RuleEnforcer.isSelectableCard(this.game, message.cardIndex) && !RuleEnforcer.isPlayerSpy(this.game, player)) {
						this.game.deselectCard(player, message.cardIndex);
					}
					console.log('Case deselectCard reached');
					break;

				case "submitGuess":
					console.log('Case submitGuess reached');
					throw new Error("Need to implement submitGuess on Game");
					// break;
				case "endTurn":
					console.log('Case endTurn reached');
					throw new Error("Need to implement selectCard on Game");
					// break;
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