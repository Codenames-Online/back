import { Agent } from './Agent';
import { Teams } from './Teams';
import { Operative } from './Operative';
import { Spymaster } from './Spymaster';
import { TeamPlayer } from './TeamPlayer';
import { Team, Turn } from './constants/Constants'

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

	export function getStartingRoster(agents: Agent[]) {
		return agents.map(agent => {
			return { name: agent.name, role: agent.role, team: agent.team }});
	}
	
	export function getOtherTeam(team: Team) {
		return team === Team.red ? Team.blue : Team.red;
	}

	export function getStartTeam(): Team {
		return Math.round(Math.random()) ? Team.red : Team.blue ;
	}

	// takes an object which extends the hasRedAndBlue interface meaning it has
	// a field 'red' and a field 'blue' both of which are arrays of objects
	// which extend TeamPlayer. hasRedAndBlue needs a Type argument so we
	// pass the type of an element in the 'red' field which will be an object
	// that extends TeamPlayer. Finally we want to return an array of this type
	export function getByTeam<T extends Teams<T["red"][0]>>(teams: T, team: Team): T["red"] {
		return team === Team.red ? teams.red : teams.blue;
	}

	export function getOperatives(agents: Agent[]): Teams<Operative> {
		return getTeams(getAgentByRole(agents, Turn.op) as Operative[]);
	}

	export function getSpymasters(agents: Agent[]): Teams<Spymaster> {
		return getTeams(getAgentByRole(agents, Turn.spy) as Spymaster[]);
	}

	function getAgentByRole(agents: Agent[], role: Turn): Agent[] {
		return agents.filter(agent => agent.role === role);
	}
}