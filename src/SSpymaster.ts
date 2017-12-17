import { Player } from './Player';
import { Team, Turn } from './constants/Constants';

import WebSocket = require('ws')

export class SSpymaster extends Player {
  constructor(name: string, id: string, team: Team, socket: WebSocket) {
    super(name, id, team, socket, Turn.spy);
  }
}