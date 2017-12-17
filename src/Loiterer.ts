import WebSocket = require('ws')
import { Team } from "./constants/Constants";

export class Loiterer {
  name: string;
  id: string;
  team: Team;
  socket: WebSocket;

  constructor(name: string, id: string, team: Team, socket: WebSocket) {
    this.name = name;
    this.id = id;
    this.team = team;
    this.socket = socket;
  }

  toJSON() { return { name: this.name, id: this.id, team: this.team }; }
}
