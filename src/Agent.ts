import { Player } from "./Player";
import { Team, Turn } from "./constants/Constants";

import ws = require('ws')

export class Agent extends Player {
  team: Team;
  role: Turn;
  
  constructor(id: string, name: string, socket: ws, team: Team, role: Turn) {
		super(id, name, socket);
		this.team = team;
    this.role = role;
  }

  toJSON() {
    return { id: this.id, name: this.name, team: this.team, role: this.role };
  }
}
