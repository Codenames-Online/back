import { Player } from './Player'
import { Loiterer } from './Loiterer'
import { Broadcaster } from './Broadcaster'
import { Team } from './constants/Constants'
import { GameUtility as gu } from './GameUtility'
import { RuleEnforcer as re } from './RuleEnforcer'

import ws = require('ws')
import * as _ from 'lodash'

/**
 * Manages a single lobby before a game has been started.
 * 
 * Provides methods for adding and removing players along with switching players
 * from team to team.
 */
export class Lobby {
	readonly id: string;
	private loiterers: Loiterer[];

	constructor(gid: string) {
		this.id = gid;
		this.loiterers = [];
	}

	empty(): boolean {
		return this.loiterers.length === 0;
	}

	addPlayer(player: Player) {
		let teams = gu.getTeams(this.loiterers);
		let team: Team = teams.blue.length <= teams.red.length ? Team.blue : Team.red;

		let loiterer = Loiterer.loitererFromPlayer(player, team);
		this.loiterers.push(loiterer);

		Broadcaster.updateLoiterer(loiterer, this.id);
		Broadcaster.updateTeams(this.loiterers, gu.getRoster(gu.getTeams(this.loiterers)));
		if (re.canStartGame(gu.getTeams(this.loiterers)))
			Broadcaster.toggleStartButton(this.loiterers, true);
	}

	removeLoiterer(socket: ws) {
		let index = this.loiterers.findIndex(loiterer => _.isEqual(loiterer.socket, socket));
		if (index > -1) { this.loiterers.splice(index, 1) }

		let teams = gu.getTeams(this.loiterers);
		let roster = gu.getRoster(teams);
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

		let sloitererTeams = gu.getTeams(this.loiterers);
		Broadcaster.updateTeams(this.loiterers, gu.getRoster(sloitererTeams));
		Broadcaster.toggleStartButton(this.loiterers, re.canStartGame(sloitererTeams));
	}
}