import { Card } from './Card';
import { Agent } from './Agent';
import { Loiterer } from './Loiterer';
import { Team, Turn } from './constants/Constants';

import ws = require('ws')


export class Operative extends Agent {
  private selected?: Card;

  constructor(id: string, name: string, socket: ws, team: Team) {
    super(id, name, socket, team, Turn.op);
  }

  static loitererToOperative(loiterer: Loiterer): Operative {
    return new Operative(loiterer.id, loiterer.name, loiterer.socket, loiterer.team);
  }
  
  deselectCard() { this.selected = undefined; }
  selectCard(card: Card) { this.selected = card; }
  getSelected(): Card | undefined { return this.selected; }
}
