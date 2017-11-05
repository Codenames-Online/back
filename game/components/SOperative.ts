import { SPlayer } from "./SPlayer";
import { Card } from "./Card";


export class SOperative extends SPlayer {
  selected?: Card;

  constructor(name, id, team, socket, role) {
    super(name, id, team, socket, role);
  }

  selectCard(card) {
    this.selected = card;
  }

  deselectCard(card) {
    this.selected = undefined;
  }

}
