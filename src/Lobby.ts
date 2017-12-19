import { Loiterer } from './Loiterer'
import { Broadcaster } from './Broadcaster'
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

	addLoiterer(loiterer: Loiterer) {
		this.loiterers.push(loiterer);
		Broadcaster.updateTeams(this.loiterers, gu.getSloitererRoster(gu.getSloitererTeams(this.loiterers)));
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