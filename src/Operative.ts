import { Card } from './Card';
import { Player } from './Player';
import { Team, Turn } from './constants/Constants';

import WebSocket = require('ws')

export class Operative extends Player {
  private selected?: Card;

  constructor(name: string, id: string, team: Team, socket: WebSocket) {
    super(name, id, team, socket, Turn.op);
  }
  
  deselectCard() { this.selected = undefined; }
  selectCard(card: Card) { this.selected = card; }
  getSelected(): Card | undefined { return this.selected; }
}
