import { Team, Turn } from "./constants/Constants";

import WebSocket = require('ws')

export abstract class Player {
  id: string;
  team: Team;
  name: string;
  role: Turn;
  socket: WebSocket;
  
  constructor(name: string, id: string, team: Team, socket: WebSocket, role: Turn) {
    this.name = name;
    this.id = id;
    this.team = team;
    this.socket = socket;
    this.role = role;
  }

  toJSON() {
    return { name: this.name, id: this.id, team: this.team, role: this.role };
  }
}
