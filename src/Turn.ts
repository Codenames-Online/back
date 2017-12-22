import { Agent } from "./Agent";
import { Spymaster } from "./Spymaster";
import { Broadcaster } from "./Broadcaster";
import { GameUtility as gu } from './GameUtility';
import { Team, Role } from "./constants/Constants";

export class Turn {
	private role: Role;
	private team: Team;
	private started: Boolean;

	constructor(startTeam: Team) {
		this.team = startTeam;
		this.role = Role.spy;
	}

	getRole(): Role { return this.role; }
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
		if(this.role === Role.op)
			this.team = gu.getOtherTeam(this.team);
		
		this.role = this.role === Role.op ? Role.spy : Role.op;
	}

	private sendMessages(agents: Agent[]): void {
		if(this.role === Role.spy) {
			let spyArr: Spymaster[] = gu.getByTeam(gu.getSpymasters(agents), this.team);
			
			Broadcaster.promptForClue(spyArr.pop() as Spymaster);
			Broadcaster.switchActiveTeam(agents, this.team, this.role);
		} else {
			Broadcaster.switchTurn(agents, this.team, this.role);
		}
	}
}