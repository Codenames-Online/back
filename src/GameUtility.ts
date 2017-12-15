import { Team } from './constants/Constants'
import { SPlayer } from './SPlayer'
import { SLoiterer } from './SLoiterer'
import { SPlayerTeams, SLoitererTeams } from './Teams'

export module GameUtility {
	export function getSloitererTeams(loiterers: SLoiterer[]): SLoitererTeams {
		return new SLoitererTeams(
			loiterers.filter(loiterer => loiterer.team === Team.red),
			loiterers.filter(loiterer => loiterer.team === Team.blue)
		);
	}
	
	export function getPlayerTeams(players: SPlayer[]): SPlayerTeams {
		return new SPlayerTeams(
			players.filter(player => player.team === Team.red),
			players.filter(player => player.team === Team.blue)
		);
	}
	
	export function getSloitererRoster(sloiterers: SLoiterer[]): [string[], string[]] {
		let teams = this.getSloitererTeams(sloiterers);
		return [teams.blue.map(loiterer => loiterer.name), 
						teams.red.map(loiterer => loiterer.name)];
	}
	
	export function getPlayerRoster(players: SPlayer[]): [string[], string[]] {
			let teams = this.getPlayerTeams(players);
			return [teams.blue.map(player => player.name),
							teams.red.map(player => player.name)];
	}
	
	export function getOtherTeam(team: number) { return (team + 1) % 2; }	
}