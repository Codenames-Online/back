import { Card } from "./Card";
import { SPlayer } from "./SPlayer";
import { Team } from "./constants/Constants";

import WebSocket = require('ws')

export class SOperative extends SPlayer {
  selected?: Card;

  constructor(name: string, id: string, team: Team, socket: WebSocket, role: number) {
    super(name, id, team, socket, role);
  }

  selectCard(card: Card) { this.selected = card; }
  deselectCard() { this.selected = undefined; }
}
