import { PlayerLocation } from './constants/Constants'

export class PlayerState {
	private gid: string | undefined;
	private pid: string;
	private loc: PlayerLocation;

	constructor(pid: string) {
		this.pid = pid;
		this.loc = PlayerLocation.loner;
	}

	getPid(): string { return this.pid; }
	getGid(): string {
		if(!this.gid)
			throw new Error('Attempted to access gid of player not yet in lobby or game');
		
		return this.gid;
	}
	getLoc(): PlayerLocation { return this.loc; }

	placeInLobby(gid: string) {
		if(this.loc !== PlayerLocation.loner)
			throw new Error("Player must be loner to place in lobby");
		
		this.loc = PlayerLocation.lobby;
		this.gid = gid;
	}

	placeInGame() {
		if(this.loc !== PlayerLocation.lobby)
			throw new Error("Player must be in lobby to place in game");
	
		this.loc = PlayerLocation.game;
	}
}