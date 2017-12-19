import { Agent } from './Agent';
import { Player } from './Player';
import { Team, Turn } from './constants/Constants';

import ws = require('ws');

export class Spymaster extends Agent {
  constructor(id: string, name: string, socket: ws, team: Team) {
    super(id, name, socket, team, Turn.spy);
  }
}