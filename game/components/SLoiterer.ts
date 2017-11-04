import { Team } from "../constants/Constants";
import WebSocket = require('ws')

export class SLoiterer {
  name: string;
  id: number;
  team: Team;
  socket: WebSocket;

  constructor(name, id, team, socket) {
    this.name = name;
    this.id = id;
    this.team = team;
    this.socket = socket;
  }
}
