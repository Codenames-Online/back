import { Loiterer } from './Loiterer'
import { Broadcaster } from './Broadcaster'
import { GameUtility as gu } from './GameUtility'
import { RuleEnforcer as re } from './RuleEnforcer'

import ws = require('ws')
import * as _ from 'lodash'

export class Lobby {
	private loiterers: Loiterer[];

	constructor(first: Loiterer) {
		this.loiterers = [ first ];
	}

	addLoiterer(loiterer: Loiterer) {
		this.loiterers.push(loiterer);
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
}