import { Card } from './Card'
import { Clue } from './Clue'
import { Team, Role } from './constants/Constants'
import { Board } from './Board'
import { Agent } from './Agent'
import { Loiterer } from './Loiterer'
import { Spymaster } from './Spymaster'
import { Player } from './Player';

export module Broadcaster {
  function broadcastToPlayers(players: Player[], message: Object) {
    players.forEach(player => sendToPlayer(player, message));
  }

  function sendToPlayer(player: Player, message: Object) {
    player.socket.send(JSON.stringify(message));
  }

  export function switchTurn(agents: Agent[], team: Team, turn: Role) {
    broadcastToPlayers(agents, { action: "switchTurn", team: team, turn: turn });
  }

  export function switchActiveTeam(agents: Agent[], team: Team, turn: Role) {
    broadcastToPlayers(agents, { action: "switchActiveTeam", team: team, turn: turn });
  }

  export function postClue(agents: Agent[], clue: Clue, team: Team) {
    broadcastToPlayers(agents, { action: "postClue", clue: clue, team: team });
  }

  export function generateCards(agents: Agent[], board: Board) {
    broadcastToPlayers(agents, { action: "generateCards", board: Board });
  }

  export function updateTeams(loiterers: Loiterer[], roster: [string[], string[]]) {
    broadcastToPlayers(loiterers, { 
      action: "updateTeams",
      teams: { blue: roster[Team.blue], red: roster[Team.red] },
    });
  }

  export function toggleStartButton(loiterers: Loiterer[], canEnable: boolean) {
    broadcastToPlayers(loiterers, { action: "toggleStartButton", enable: canEnable });
  }

  export function updateBoard(agents: Agent[], board: [number, Card][]) {
    broadcastToPlayers(agents, { action: "updateBoard", board: board });
  }

  export function updateScore(agents: Agent[], score: number[]) {
    broadcastToPlayers(agents, { action: "updateScore", score: score });
  }

  export function sendMessage(agents: Agent[], chat: string, player) {
    broadcastToPlayers(agents, {
      action: "sendMessage",
      text: chat,
      playerTeam: player.team,
      playerName: player.name
    });
  }

  export function startGame(agents: Agent[], startTeam: Team, startingRoster) {
    broadcastToPlayers(agents, { 
      action: "gameStarted", startTeam: startTeam, roster: startingRoster
    });
  }

  export function endGame(agents: Agent[], team: Team) {
    broadcastToPlayers(agents, { action: "endGame", team: team });
  }

  // PRIVATE

  export function allowGuess(agents: Agent[], bool: boolean) {
    broadcastToPlayers(agents, { action: "allowGuess", bool: bool });
  }

  export function updateLoner(loner: Player) {
    sendToPlayer(loner, { action: "updateLoner", person: loner });
  }

  export function updateLoiterer(loiterer: Loiterer, gid: string) {
    sendToPlayer(loiterer, { action: "updateLoiterer", person: loiterer, gid: gid });
  }

  export function updateLoitererToAgent(loiterer: Loiterer, agent: Agent) {
    sendToPlayer(loiterer, { action: "updateLoitererToPlayer", player: agent });
  }

  export function promptForClue(spymaster: Spymaster) {
    sendToPlayer(spymaster, { action: "promptForClue" });
  }
}