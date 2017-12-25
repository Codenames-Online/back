import { TeamPlayer } from "./TeamPlayer";
import { Team, Role } from "./constants/Constants";

import ws = require('ws')

export abstract class Agent extends TeamPlayer {
  role: Role;
  
  constructor(id: string, name: string, socket: ws, team: Team, role: Role) {
    super(id, name, socket, team);
    this.role = role;
  }

  toJSON() {
    return { id: this.id, name: this.name, team: this.team, role: this.role };
  }
}
