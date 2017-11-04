import { SPlayer } from "./SPlayer";
import { Card } from "./Card";

export class SOperative extends SPlayer {
  selected? = Card;

  constructor(name, id, team, socket) {
    super(name, id, team, socket);
  }

  set selectedCard(card) {
    this.selected = card;
  }

}
