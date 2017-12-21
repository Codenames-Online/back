import { Agent } from "./Agent";
import { Team, Turn } from "./constants/Constants";

export class GameTurn {
	private role: Turn;
	private team: Team;

	constructor(startTeam: Team) {
		this.team = startTeam;
		this.role = Turn.spy;
	}

	getRole(): Turn { return this.role; }
	getTeam(): Team { return this.team; }

	// fill in after writing tests
	advance(agents: Agent[]) {

	}

	start(agents: Agent[]) {
		
	}
}