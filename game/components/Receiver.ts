import url = require('url')
import WebSocket = require('ws')
// import Game

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
		this.wss.on('connection', (ws, req) => {
			ws.on('message', (message) => {
				let data = JSON.parse(message.toString());
				console.log(data);

				this.handleMessage(data);

				this.wss.clients.forEach((client) => {
					if(client.readyState === WebSocket.OPEN) {
						client.send(message);
					}
				})
			});

			ws.on('close', (ws, req) => {
				console.log('Closed connection');
			});

			ws.send('Hi there socket!');
		});
	}

	handleMessage(message) {
		if(message.hasOwnProperty('action')) {
			let action: string = message.action;
			console.log("action: " + action)
	
			switch(action) {
				case "setName":
					console.log('Case setName reached');
					
					break;
				case "switchTeam":
					console.log('Case switchTeam reached');
		
					break;
				case "startGame":
					console.log('Case startGame reached');
		
					break;
				case "selectCard":
					console.log('Case selectCard reached');
		
					break;
				case "deselectCard":
					console.log('Case deselectCard reached');
		
					break;
				case "submitGuess":
					console.log('Case submitGuess reached');
		
					break;
				case "endTurn":
					console.log('Case endTurn reached');
		
					break;
				case "sendMessage":
					console.log('Case sendMessage reached');	

					break;
				case "sendClue":
					console.log('Case sendClue reached');

					break;
				default:
					console.log(`Whoops don't know what ${message} is`);
			}
		}
	}
}