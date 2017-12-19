import { Agent } from './Agent';
import { Loiterer } from './Loiterer';
import { Team, Turn } from './constants/Constants';

import ws = require('ws');

export class Spymaster extends Agent {
  constructor(id: string, name: string, socket: ws, team: Team) {
    super(id, name, socket, team, Turn.spy);
  }

  static loitererToSpymaster(loiterer: Loiterer): Spymaster {
    return new Spymaster(loiterer.id, loiterer.name, loiterer.socket, loiterer.team);
  }
}