import { Card } from './Card';
import { Game } from './Game';
import { Lobby } from './Lobby';
import { Player } from './Player';
import { Loiterer } from './Loiterer';
import { Operative } from './Operative';
import { PlayerState } from './PlayerState';
import { Broadcaster } from './Broadcaster';
import { words } from './constants/Wordlist';
import { GameUtility as gu } from './GameUtility';
import { RuleEnforcer as re } from './RuleEnforcer';
import { Team, PlayerLocation } from './constants/Constants';

import ws = require('ws');
import { shuffle } from 'lodash'

/**
 * Manages lobbies, active games and unallocated players. Recieves messages
 * from WebSocketServer and routes them on to respective Lobbies or Games, or
 * handles them directly depending on the message.
 * 
 * Also keeps track of all players in the system, triggering removal from
 * respective games, lobbies or unallocated players on a socket close.
 * 
 * Uses Game Ids (GIDs) to keep track of current lobbies and games. Players must
 * provide the GID matching their Player Id (PID) to take action in a game or
 * lobby. Currently GIDs are drawn from the wordlist, this is a temporary
 * measure that will be changed in the future.
 */
export class Manager {
	playerStates: Map<ws, PlayerState>;
	loners: Map<string, Player>;
	lobbies: Map<string, Lobby>;
	games: Map<string, Game>;
	usedGids: Set<string>;
	availableGids: string[];

	// make instance of Game class
	constructor() {
		this.playerStates = new Map();
		this.loners = new Map();
		this.lobbies = new Map();
		this.games = new Map();
		this.usedGids = new Set();
		this.availableGids = words.map(word => word.toLocaleLowerCase());
	}

	handleClose(socket: ws) {
		if(!this.playerStates.has(socket)) {
			console.log('User hadn\'t set name, no player to remove');
			return;
		}

		// player exists somewhere
		let state = this.playerStates.get(socket) as PlayerState;

		switch(state.getLoc()) {
			case PlayerLocation.loner:
				this.removeLoner(socket, state.getPid())
				console.log(`Removed player from loners with id: ${state.getPid()}`)
				break;
			case PlayerLocation.lobby:
				if(this.lobbies.has(state.getGid())) {
					let lobby = (this.lobbies.get(state.getGid()) as Lobby);
					lobby.removeLoiterer(socket);
					console.log(`Removed player from lobby ${state.getGid()} with id: ${state.getPid()}`)

					if(lobby.empty()) {
						this.lobbies.delete(state.getGid());
						console.log(`Deleted lobby ${state.getGid()}`);
					}
				}
				break;
			case PlayerLocation.game:
				if(this.games.has(state.getGid())) {
					let game = (this.games.get(state.getGid()) as Game);
					game.removeAgent(socket);
					console.log(`Removed player from game ${state.getGid()} with id: ${state.getPid()}`);

					if(game.empty()) {
						this.games.delete(state.getGid());
						console.log(`Deleted game ${state.getGid()}`);
					}
				}
				break;
			default:
				console.log('Sorry, unknown player location.')
		}
	}
	
	handleMessage(message: any, socket: ws) {
		console.log(message)

		if(message.hasOwnProperty('action')) {
			let action: string = message.action;
			
			switch(action) {
				case "setName":
					console.log('Case setName reached');
					if (re.isValidName(message.name)) {
						// this.game.registerLoiterer(message.name, socket);
						this.registerPlayer(message.name, socket);
					}
					break;

				case "createLobby":
					if(this.availableGids.length <= 0)
						throw new Error('If these are real games that\'s awesome, now add more gids')
					
					let tempGids = shuffle(this.availableGids)
					let newGid: string = tempGids.pop() as string;
					this.availableGids = tempGids;

					this.lobbies.set(newGid, new Lobby(newGid));
					this.placePlayerInLobby(message.pid, newGid, socket);
					break;

				case "joinLobby":
					let gid = message.gid.toLocaleLowerCase();
					if(this.lobbies.has(gid))
						this.placePlayerInLobby(message.pid, gid, socket);
					break;

				case "switchTeam":
					if(this.lobbies.has(message.gid))
						(this.lobbies.get(message.gid) as Lobby).switchLoitererTeam(message.pid);
					break;

				case "startGame":
					console.log('Case startGame reached');
					if(this.lobbies.has(message.gid)
					&& re.canStartGame(gu.getTeams((this.lobbies.get(message.gid) as Lobby).getLoiterers()))) {
						this.placePlayersInGame(message.gid);
					}
					break;

				// game message
				case "endGame":
				case "endTurn":
				case "sendClue":
				case "toggleCard":
				case "submitGuess":
				case "sendMessage":
					if(this.games.has(message.gid))
						(this.games.get(message.gid) as Game).handleMessage(message, socket);
					break;

				default:
					console.log(`Whoops don't know what ${message} is`);
			}
		}
	}

	removeLoner(socket: ws, pid: string): void {
		this.loners.delete(pid);
		this.playerStates.delete(socket);
	}

	// adds player to loners array of players with no lobby
  registerPlayer(name: string, socket: ws) {
		let id = Date.now().toString(36);
		let loner = new Player(id, name, socket);
		this.loners.set(id, loner);
		
		this.playerStates.set(socket, new PlayerState(id));
		Broadcaster.updateLoner(loner);
	}
	
	placePlayerInLobby(pid: string, gid: string, socket: ws): boolean {
		// confirm that both exist, use casts later since we are synchronous we know
		// they must still exist
		if(!this.loners.has(pid) || !this.lobbies.has(gid) || !this.playerStates.has(socket))
			return false;

		let loner: Player = this.loners.get(pid) as Player;
		this.loners.delete(pid);
		(this.lobbies.get(gid) as Lobby).addPlayer(loner)

		let lonerState = this.playerStates.get(socket) as PlayerState;
		lonerState.placeInLobby(gid);
		
		return true;
	}

	placePlayersInGame(gid: string) {
		let lobby: Lobby = this.lobbies.get(gid) as Lobby;
		lobby.getLoiterers().forEach(loiterer => {
			(this.playerStates.get(loiterer.socket) as PlayerState).placeInGame();
		});
		this.lobbies.delete(gid);
		this.games.set(gid, Game.gameFromLobby(lobby));		
	}
}