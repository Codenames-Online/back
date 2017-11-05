import { Card } from './Card'
import { Clue } from './Clue'
import { Team, Turn } from '../constants/Constants'
import { Board } from './Board'
import { SPlayer } from './SPlayer'
import { SLoiterer } from './SLoiterer'
import { SSpymaster } from './SSpymaster'

export module Broadcaster {
	function broadcastToPlayers(players: SPlayer[], message: Object) {
		for(let player of players) {
			sendToPlayer(player, message);
		}
	}

	function sendToPlayer(player: SPlayer, message: Object) {
		player.socket.send(JSON.stringify(message));
	}

	export function switchTurn(players: SPlayer[], team: Team, turn: Turn) {
		broadcastToPlayers(players, {
			action: "switchTurn",
			team: team,
			turn: turn,
		});
	}

	export function switchActiveTeam(players: SPlayer[], team: Team, turn: Turn) {
		broadcastToPlayers(players, {
			action: "switchActiveTeam",
			team: team,
			turn: turn,
		});
	}

	export function postClue(players: SPlayer[], clue: Clue, team: Team) {
		broadcastToPlayers(players, {
			action: "postClue",
			clue: clue,
			team: team
		});
	}

	export function generateCards(players: SPlayer[], board: Board) {
		broadcastToPlayers(players, { action: "generateCards", board: Board });
	}

	export function updateTeams(players, roster) {
		broadcastToPlayers(players, {
			action: "updateTeams",
			teams: {
				blue: roster[0],
				red: roster[1],
			},
		});
	}

	export function toggleStartButton(players, canEnable: boolean) {
		broadcastToPlayers(players, {
			action: "toggleStartButton",
			enable: canEnable,
		});
	}

	export function updateBoard(splayers: SPlayer[], board) {
		broadcastToPlayers(splayers, {
			action: "updateBoard",
			board: board,
		});
	}

	export function updateScore(splayers: SPlayer[], score: number[]) {
		broadcastToPlayers(splayers, {
			action: "updateBoard",
			score: score,
		});
	}

	export function sendMessage(players: SPlayer[], chat: string, player) {
		broadcastToPlayers(players, {
			action: "sendMessage",
			chat: chat,
			playerTeam: player.team,
			playerName: player.name
		});
	}

	export function updateNumGuesses(splayers: SPlayer[], guesses: number) {
		broadcastToPlayers(splayers, {
			action: "updateBoard",
			guesses: guesses,
		});
	}


	// PRIVATE

	export function updateLoiterer(sloiterer) {
		sendToPlayer(sloiterer, {
			action: "updateLoiterer",
			person: sloiterer,
		});
	}

	export function updateLoiterToPlayer(sloiterer, splayer) {
		sendToPlayer(sloiterer, {
			action: "updateLoitererToPlayer",
			player: splayer,
		});
	}

	export function promptForClue(spymaster: SSpymaster) {
		sendToPlayer(spymaster, {
			action: "promptForClue",
		});
	}

	function broadcastToSloiterers(sloiterers: SLoiterer[], message: Object) {
		for(let sloiterer of sloiterers) {
			sendToSloiterer(sloiterer, message);
		}
	}

	function sendToSloiterer(sloiterer: SLoiterer, message: Object) {
		sloiterer.socket.send(JSON.stringify(message));
	}

	export function nameSet(sloiterer: SLoiterer, id: number, name: string) {
		sendToSloiterer(sloiterer, { action: "nameSet", id: id, name: name});
	}
}
