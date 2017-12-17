import { Card } from "./Card";
import { SPlayer } from "./SPlayer";
import { Team, Turn } from "./constants/Constants";

import WebSocket = require('ws')

export class SOperative extends SPlayer {
  private selected?: Card;

  constructor(name: string, id: string, team: Team, socket: WebSocket) {
    super(name, id, team, socket, Turn.op);
  }
  
  deselectCard() { this.selected = undefined; }
  selectCard(card: Card) { this.selected = card; }
  getSelected(): Card | undefined { return this.selected; }
}
