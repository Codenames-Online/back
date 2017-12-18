import { Card } from './Card';
import { Game } from './Game';
import { Lobby } from './Lobby';
import { Player } from './Player';
import { Loiterer } from './Loiterer';
import { Operative } from './Operative';
import { Broadcaster } from './Broadcaster';
import { GameUtility as gu } from './GameUtility';
import { RuleEnforcer as re } from './RuleEnforcer';

import ws = require('ws');

export class Manager {
	game: Game;
	loiterers: { [pid: string] : Loiterer};
	lobbies: { [gid: string] : Lobby };
	games:  { [gid: string] : Game };

	// make instance of Game class
	constructor() {
		this.game = new Game();
	}

	handleClose(socket: ws) {
		console.log('Closed connection');
		this.game.removePerson(socket);
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

				// game message
				case "endGame":
				case "endTurn":
				case "sendClue":
				case "toggleCard":
				case "submitGuess":
				case "sendMessage":
					this.game.handleMessage(message, socket);
					break;

				default:
					console.log(`Whoops don't know what ${message} is`);
			}
		}
	}
}