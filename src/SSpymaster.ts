import { SPlayer } from "./SPlayer";
import { Team } from "./constants/Constants";

import WebSocket = require('ws')

export class SSpymaster extends SPlayer {
  constructor(name: string, id: string, team: Team, socket: WebSocket, role: number) {
    super(name, id, team, socket, role);
  }
}