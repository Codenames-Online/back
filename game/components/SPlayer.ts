import { Team } from "../constants/Constants";
import WebSocket = require('ws')

export abstract class SPlayer {
  name: string;
  id: string;
  team: Team;
  socket: WebSocket;

  constructor(name, id, team, socket) {
    if (new.target === SPlayer) {
      throw new TypeError("SPlayer is an abstract class.");
    }

    this.name = name;
    this.id = id;
    this.team = team;
    this.socket = socket;
  }
}
