import { Card } from "./Card";
import { SPlayer } from "./SPlayer";
import { Team } from "./constants/Constants";

import WebSocket = require('ws')

export class SOperative extends SPlayer {
  private selected?: Card;

  constructor(name: string, id: string, team: Team, socket: WebSocket, role: number) {
    super(name, id, team, socket, role);
  }
  
  deselectCard() { this.selected = undefined; }
  selectCard(card: Card) { this.selected = card; }
  getSelected(): Card | undefined { return this.selected; }
}
