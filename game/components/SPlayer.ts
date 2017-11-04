import { Team } from "../constants/Constants";
import WebSocket = require('ws')

export abstract class SPlayer {
  name: string;
  id: number;
  team: Team;
  ws: WebSocket;

  constructor(name, id, team, ws) {
    if (new.target === SPlayer) {
      throw new TypeError("SPlayer is an abstract class.");
    }

    this.name = name;
    this.id = id;
    this.team = team;
    this.ws = ws;
  }
}
