import { Card } from './Card'
import { Clue } from './Clue'
import { Team, Turn } from './constants/Constants'
import { Board } from './Board'
import { Agent } from './Agent'
import { Loiterer } from './Loiterer'
import { Spymaster } from './Spymaster'
import { Player } from './Player';

export module Broadcaster {
	function broadcastToPlayers(players: Player[], message: Object) {
		for(let player of players) { sendToPlayer(player, message); }
	}

	function sendToPlayer(player: Player, message: Object) {
		player.socket.send(JSON.stringify(message));
	}

	function broadcastToSloiterers(sloiterers: Loiterer[], message: Object) {
		for(let sloiterer of sloiterers) { sendToSloiterer(sloiterer, message); }
	}

	function sendToSloiterer(sloiterer: Loiterer, message: Object) {
		sloiterer.socket.send(JSON.stringify(message));
	}

	export function switchTurn(players: Agent[], team: Team, turn: Turn) {
		broadcastToPlayers(players, { action: "switchTurn", team: team, turn: turn });
	}

	export function switchActiveTeam(players: Agent[], team: Team, turn: Turn) {
		broadcastToPlayers(players, { action: "switchActiveTeam", team: team, turn: turn });
	}

	export function postClue(players: Agent[], clue: Clue, team: Team) {
		broadcastToPlayers(players, { action: "postClue", clue: clue, team: team });
	}

	export function generateCards(players: Agent[], board: Board) {
		broadcastToPlayers(players, { action: "generateCards", board: Board });
	}

	export function updateTeams(sloiterers: Loiterer[], roster: [string[], string[]]) {
		broadcastToSloiterers(sloiterers, { 
			action: "updateTeams",
			teams: { blue: roster[Team.blue], red: roster[Team.red] },
		});
	}

	export function toggleStartButton(sloiterers: Loiterer[], canEnable: boolean) {
		broadcastToSloiterers(sloiterers, { action: "toggleStartButton", enable: canEnable });
	}

export function updateBoard(splayers: Agent[], board: [number, Card][]) {
		broadcastToPlayers(splayers, { action: "updateBoard", board: board });
	}

	export function updateScore(splayers: Agent[], score: number[]) {
		broadcastToPlayers(splayers, { action: "updateScore", score: score });
	}

	export function sendMessage(players: Agent[], chat: string, player) {
		broadcastToPlayers(players, {
			action: "sendMessage",
			text: chat,
			playerTeam: player.team,
			playerName: player.name
		});
	}

	export function startGame(splayers: Agent[], startTeam: Team, startingRoster) {
		broadcastToPlayers(splayers, { 
			action: "gameStarted", startTeam: startTeam, roster: startingRoster
		});
	}

	export function endGame(splayers: Agent[], team: Team) {
		broadcastToPlayers(splayers, { action: "endGame", team: team });
	}

	// PRIVATE

	export function allowGuess(players: Agent[], bool: boolean) {
		broadcastToPlayers(players, { action: "allowGuess", bool: bool });
	}

	export function updateLoner(loner: Player) {
		sendToPlayer(loner, { action: "updateLoner", person: loner });
	}

	export function updateLoiterer(sloiterer: Loiterer, gid: string) {
		sendToSloiterer(sloiterer, { action: "updateLoiterer", person: sloiterer, gid: gid });
	}

	export function updateLoitererToAgent(sloiterer: Loiterer, splayer: Agent) {
		sendToSloiterer(sloiterer, { action: "updateLoitererToPlayer", player: splayer });
	}

	export function promptForClue(spymaster: Spymaster) {
		sendToPlayer(spymaster, { action: "promptForClue" });
	}
}