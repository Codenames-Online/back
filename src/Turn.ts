import { Agent } from "./Agent";
import { Spymaster } from "./Spymaster";
import { Broadcaster } from "./Broadcaster";
import { GameUtility as gu } from "./GameUtility";
import { Team, Turn } from "./constants/Constants";

export class GameTurn {
	private role: Turn;
	private team: Team;
	private started: Boolean;

	constructor(startTeam: Team) {
		this.team = startTeam;
		this.role = Turn.spy;
		this.started = false;
	}

	getRole(): Turn { return this.role; }
	getTeam(): Team { return this.team; }

	// fill in after writing tests
	advance(agents: Agent[]) {
		if(!this.started) { throw new Error("Can't advance without starting"); }

		this.advanceState();
		this.sendMessages(agents);
	}

	start(agents: Agent[]) {
		if(this.started) { throw new Error("Can't start game twice"); }

		this.started = true;
		let spyArr = gu.getByTeam(gu.getSpymasters(agents), this.team);

		Broadcaster.startGame(agents, this.team, gu.getStartingRoster(agents));
		Broadcaster.promptForClue(spyArr.pop() as Spymaster)
	}

	private advanceState(): void {
		if(this.role === Turn.op)
			this.team = gu.getOtherTeam(this.team);
		
		this.role = this.role === Turn.op ? Turn.spy : Turn.op;
	}

	private sendMessages(agents: Agent[]): void {
		if(this.role === Turn.spy) {
			let spyArr: Spymaster[] = gu.getByTeam(gu.getSpymasters(agents), this.team);
			
			Broadcaster.promptForClue(spyArr.pop() as Spymaster);
			Broadcaster.switchActiveTeam(agents, this.team, this.role);
		} else {
			Broadcaster.switchTurn(agents, this.team, this.role);
		}
	}
}