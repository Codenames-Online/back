import { Team } from "../constants/Constants";
import WebSocket = require('ws')

export class SLoiterer {
  name: string;
  id: number;
  team: Team;
  ws: WebSocket;

  constructor(name, id, team, ws) {
    this.name = name;
    this.id = id;
    this.team = team;
    this. ws;
  }
}
