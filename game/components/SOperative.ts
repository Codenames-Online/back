import { SPlayer } from "./SPlayer";
import { Card } from "./Card";

export class SOperative extends SPlayer {
  selected? = Card;

  constructor(name, id, team, ws) {
    super(name, id, team, ws);
  }

  set selectedCard(card) {
    this.selected = card;
  }

}
