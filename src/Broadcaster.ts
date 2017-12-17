import { Card } from './Card'
import { Clue } from './Clue'
import { Team, Turn } from './constants/Constants'
import { Board } from './Board'
import { Player } from './Player'
import { SLoiterer } from './SLoiterer'
import { SSpymaster } from './SSpymaster'

export module Broadcaster {
	function broadcastToPlayers(players: Player[], message: Object) {
		for(let player of players) { sendToPlayer(player, message); }
	}

	function sendToPlayer(player: Player, message: Object) {
		player.socket.send(JSON.stringify(message));
	}

	function broadcastToSloiterers(sloiterers: SLoiterer[], message: Object) {
		for(let sloiterer of sloiterers) { sendToSloiterer(sloiterer, message); }
	}

	function sendToSloiterer(sloiterer: SLoiterer, message: Object) {
		sloiterer.socket.send(JSON.stringify(message));
	}

	export function switchTurn(players: Player[], team: Team, turn: Turn) {
		broadcastToPlayers(players, { action: "switchTurn", team: team, turn: turn });
	}

	export function switchActiveTeam(players: Player[], team: Team, turn: Turn) {
		broadcastToPlayers(players, { action: "switchActiveTeam", team: team, turn: turn });
	}

	export function postClue(players: Player[], clue: Clue, team: Team) {
		broadcastToPlayers(players, { action: "postClue", clue: clue, team: team });
	}

	export function generateCards(players: Player[], board: Board) {
		broadcastToPlayers(players, { action: "generateCards", board: Board });
	}

	export function updateTeams(sloiterers: SLoiterer[], roster: [string[], string[]]) {
		broadcastToSloiterers(sloiterers, { 
			action: "updateTeams",
			teams: { blue: roster[Team.blue], red: roster[Team.red] },
		});
	}

	export function toggleStartButton(sloiterers: SLoiterer[], canEnable: boolean) {
		broadcastToSloiterers(sloiterers, { action: "toggleStartButton", enable: canEnable });
	}

export function updateBoard(splayers: Player[], board: [number, Card][]) {
		broadcastToPlayers(splayers, { action: "updateBoard", board: board });
	}

	export function updateScore(splayers: Player[], score: number[]) {
		broadcastToPlayers(splayers, { action: "updateScore", score: score });
	}

	export function sendMessage(players: Player[], chat: string, player) {
		broadcastToPlayers(players, {
			action: "sendMessage",
			text: chat,
			playerTeam: player.team,
			playerName: player.name
		});
	}

	export function startGame(splayers: Player[], startTeam: Team, startingRoster) {
		broadcastToPlayers(splayers, { 
			action: "gameStarted", startTeam: startTeam, roster: startingRoster
		});
	}

	export function endGame(splayers: Player[], team: Team) {
		broadcastToPlayers(splayers, { action: "endGame", team: team });
	}

	// PRIVATE

	export function allowGuess(players: Player[], bool: boolean) {
		broadcastToPlayers(players, { action: "allowGuess", bool: bool });
	}

	export function updateLoiterer(sloiterer: SLoiterer) {
		sendToSloiterer(sloiterer, { action: "updateLoiterer", person: sloiterer });
	}

	export function updateLoitererToPlayer(sloiterer: SLoiterer, splayer: Player) {
		sendToSloiterer(sloiterer, { action: "updateLoitererToPlayer", player: splayer });
	}

	export function promptForClue(spymaster: SSpymaster) {
		sendToPlayer(spymaster, { action: "promptForClue" });
	}
}