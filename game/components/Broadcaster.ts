import { SPlayer } from './SPlayer'

export module Broadcaster {
	function broadcast(players: SPlayer[], message: Object) {
		for(let player of players) {
			player.socket.send(JSON.stringify(message));
		}
	}

	export function toggleCard(players: SPlayer[]) {

	}
}
