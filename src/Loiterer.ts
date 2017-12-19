import { Player } from './Player'
import { Team } from "./constants/Constants";

import ws = require('ws')

export class Loiterer extends Player {
  team: Team;

  constructor(id: string, name: string, socket: ws, team: Team) {
    super(id, name, socket);
    this.team = team;
  }

  toJSON() { return { id: this.id, name: this.name, team: this.team }; }
}
