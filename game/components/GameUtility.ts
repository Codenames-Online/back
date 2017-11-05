import { Team } from '../constants/Constants'
import { SPlayer } from './SPlayer'
import { SLoiterer } from './SLoiterer'

export module GameUtility {
	export function getSloitererTeams(sloiterers: SLoiterer[]): [SLoiterer[], SLoiterer[]] {
		let red = sloiterers.filter((sloiterer) => sloiterer.team === Team.red);
		let blue = sloiterers.filter((sloiterer) => sloiterer.team === Team.blue);
		return [blue, red];
	}
	
	export function getPlayerTeams(players: SPlayer[]): [SPlayer[], SPlayer[]] {
		let red = players.filter((player) => player.team === Team.red);
		let blue = players.filter((player) => player.team === Team.blue);
		return [blue, red];
	}
	
	export function getSloitererRoster(sloiterers: SLoiterer[]): [string[], string[]] {
		let teams = this.getSloitererTeams(sloiterers);
		return [teams[0].map((sloiterer) => { return sloiterer.name; }), 
						teams[1].map((sloiterer) => { return sloiterer.name; })];
	}
	
	export function getPlayerRoster(players: SPlayer[]): [string[], string[]] {
			let teams = this.getPlayerTeams(players);
			return [teams[0].map((player) => { return player.name; }),
							teams[1].map((player) => { return player.name; })];
	}
	
	export function getOtherTeam(team: number) { return (team + 1) % 2; }	
}