import { Player } from './Player'
import { Loiterer } from './Loiterer'
import { Broadcaster } from './Broadcaster'
import { Team } from './constants/Constants'
import { GameUtility as gu } from './GameUtility'
import { RuleEnforcer as re } from './RuleEnforcer'

import ws = require('ws')
import * as _ from 'lodash'

export class Lobby {
	readonly id: string;
	private loiterers: Loiterer[];

	constructor(gid: string) {
		this.id = gid;
		this.loiterers = [];
	}

	addPlayer(player: Player) {
		let teams = gu.getSloitererTeams(this.loiterers);
		let team: Team = teams.blue.length <= teams.red.length ? Team.blue : Team.red;

		let loiterer = Loiterer.loitererFromPlayer(player, team);
		this.loiterers.push(loiterer);

		Broadcaster.updateLoiterer(loiterer, this.id);
		Broadcaster.updateTeams(this.loiterers, gu.getSloitererRoster(gu.getSloitererTeams(this.loiterers)));
		if (re.canStartGame(gu.getSloitererTeams(this.loiterers)))
			Broadcaster.toggleStartButton(this.loiterers, true);
	}

	removeLoiterer(socket: ws) {
		let index = this.loiterers.findIndex(loiterer => _.isEqual(loiterer.socket, socket));
		if (index > -1) { this.loiterers.splice(index, 1) }

		let teams = gu.getSloitererTeams(this.loiterers);
		let roster = gu.getSloitererRoster(teams);
		Broadcaster.updateTeams(this.loiterers, roster);
		
		if (!re.canStartGame(teams)) {
			Broadcaster.toggleStartButton(this.loiterers, false);
		}
	}

	getLoiterers(): Loiterer[] {
		return this.loiterers;
	}

	switchLoitererTeam(pid: string) {
		let loiterer = this.loiterers.find(loiterer => loiterer.id === pid);
		if(loiterer) {
			loiterer.team = gu.getOtherTeam(loiterer.team);
		} else {
			// handle without crashing in production
			throw new Error('Loiterer does not exist when trying to switch teams');
		}

		let sloitererTeams = gu.getSloitererTeams(this.loiterers);
		Broadcaster.updateTeams(this.loiterers, gu.getSloitererRoster(sloitererTeams));
		Broadcaster.toggleStartButton(this.loiterers, re.canStartGame(sloitererTeams));
	}
}