import { SPlayer } from "./SPlayer";
import { Card } from "./Card";

class SOperative extends SPlayer {
  constructor(name, id, team) {
    super(name, id, team);
    this.selected = null;
  }

  set selectedCard(card) {
    this.selected = card;
  }

}

export default SOperative;
