import { PlayerLocation } from './constants/Constants'

export class PlayerState {
	private gid: string;
	private loc: PlayerLocation;

	constructor() {
		this.loc = PlayerLocation.loner;
	}

	getGid() { return this.gid; }

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