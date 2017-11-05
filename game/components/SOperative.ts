import { SPlayer } from "./SPlayer";
import { Card } from "./Card";
import { Turn } from '../constants/Constants';


export class SOperative extends SPlayer {
  selected?: Card;
  role: Turn

  constructor(name, id, team, socket, role) {
    super(name, id, team, socket);
    this.role = role;
  }

  set selectedCard(card) {
    this.selected = card;
  }

}
