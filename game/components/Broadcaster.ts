import { SPlayer } from './SPlayer'

export module Receiver {
	function broadcast(players: SPlayer[], message: Object) {
		for(let player of players) {
			player.ws.send(JSON.stringify(message));
		}
	}

	export function toggleCard(players: SPlayer[]) {
		
	}
}