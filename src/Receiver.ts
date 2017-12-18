import ws = require('ws')
import { Manager } from './Manager'

export class Receiver {
	wss: ws.Server;
	manager: Manager;

	// make game instance of Game class
	constructor(socketServer: ws.Server) {
		this.wss = socketServer;
		this.setupSocketServer();
		this.manager = new Manager();
	}

	setupSocketServer() {
		this.wss.on('connection', (socket: ws, req) => {
			socket.on('message', (message) => {
				this.manager.handleMessage(JSON.parse(message.toString()), socket);
			});

			socket.on('close', (req) => {
				this.manager.handleClose(socket);
			});
		});
	}
}
