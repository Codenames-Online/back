import { Card } from './Card'
import { Clue } from './Clue'
import { Team } from '../constants/Constants'
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

	export function toggleCard(players: SPlayer[], card: Card, id: number) {
		broadcastToPlayers(players, { action: "toggleCard", card: card, id: id });
	}

	export function revealCard(players: SPlayer[], card: Card) {
		broadcastToPlayers(players, { action: "revealCard", card: card });
	}

	export function opEndTurn(players: SPlayer[]) {
		broadcastToPlayers(players, { action: "opEndTurn" });
	}

	export function spyEndTurn(players: SPlayer[]) {
		broadcastToPlayers(players, { action: "spyEndTurn" });
	}

	export function broadcastClue(players: SPlayer[], clue: Clue) {
		broadcastToPlayers(players, { action: "broadcastClue", clue: clue });
	}

	export function generateCards(players: SPlayer[], board: Board) {
		broadcastToPlayers(players, { action: "generateCards", board: Board });
	}

	export function startTeam(players: SPlayer[], team: Team) {
		broadcastToPlayers(players, { action: "startTeam", team: team });
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

	export function updateScore(splayers: SPlayer[], score) {
		broadcastToPlayers(splayers, {
			action: "updateBoard",
			score: score,
		});
	}

	export function addMessage(players: SPlayer[], message: string) {
		broadcastToPlayers(players, { action: "addMessage", message: message });
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

	export function assignColors(spymasters: SSpymaster[], boardColors: number[]) {
		broadcastToPlayers(spymasters, { action: "addMessage", boardColors: boardColors });
	}

	export function promptForClue(spymaster: SSpymaster) {
		sendToPlayer(spymaster, { action: "promptForClue" });
	}

	function broadcastToSloiterers(sloiterers: SLoiterer[], message: Object) {
		for(let sloiterer of sloiterers) {
			sendToPlayer(sloiterer, message);
		}
	}

	function sendToSloiterer(sloiterer: SLoiterer, message: Object) {
		sloiterer.socket.send(JSON.stringify(message));
	}

	export function nameSet(sloiterer: SLoiterer, id: number, name: string) {
		sendToSloiterer(sloiterer, { action: "nameSet", id: id, name: name});
	}
}
