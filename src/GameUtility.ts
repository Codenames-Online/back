import { Teams } from './Teams'
import { Operative } from './Operative';
import { TeamPlayer } from './TeamPlayer';
import { Team } from './constants/Constants'

export module GameUtility {	
	export function getTeams<T extends TeamPlayer>(teamPlayers: T[]): Teams<T> {
		return new Teams(
			teamPlayers.filter(teamPlayer => teamPlayer.team === Team.red),
			teamPlayers.filter(teamPlayer => teamPlayer.team === Team.blue)
		);
	}

	export function getRoster(teamPlayers: Teams<TeamPlayer>): [string[], string[]] {
		return [teamPlayers.blue.map(teamPlayer => teamPlayer.name), 
						teamPlayers.red.map(teamPlayer => teamPlayer.name)];
	}
	
	export function getOtherTeam(team: Team) {
		return team === Team.red ? Team.blue : Team.red;
	}

	export function getTeamOps(allOps: Operative[], team: Team): Operative[] {
		return allOps.filter(op => op.team === team);
	}
}