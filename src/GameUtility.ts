import { Team } from './constants/Constants'
import { Player } from './Player'
import { SLoiterer } from './SLoiterer'
import { SPlayerTeams, SLoitererTeams } from './Teams'
import { SOperative } from './SOperative';

export module GameUtility {
	export function getSloitererTeams(loiterers: SLoiterer[]): SLoitererTeams {
		return new SLoitererTeams(
			loiterers.filter(loiterer => loiterer.team === Team.red),
			loiterers.filter(loiterer => loiterer.team === Team.blue)
		);
	}
	
	export function getPlayerTeams(players: Player[]): SPlayerTeams {
		return new SPlayerTeams(
			players.filter(player => player.team === Team.red),
			players.filter(player => player.team === Team.blue)
		);
	}
	
	export function getSloitererRoster(loiterers: SLoitererTeams): [string[], string[]] {
		return [loiterers.blue.map(loiterer => loiterer.name), 
						loiterers.red.map(loiterer => loiterer.name)];
	}
	
	export function getPlayerRoster(players: SPlayerTeams): [string[], string[]] {
			return [players.blue.map(player => player.name),
							players.red.map(player => player.name)];
	}
	
	export function getOtherTeam(team: Team) {
		return team === Team.red ? Team.blue : Team.red;
	}

	export function getTeamOps(allOps: SOperative[], team: Team): SOperative[] {
		return allOps.filter(op => op.team === team);
	}
}