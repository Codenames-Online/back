import { SPlayer } from "./SPlayer";
//import { Card } from "./Card";

export class SOperative extends SPlayer {
  //selected = Card;

  constructor(name, id, team) {
    super(name, id, team);
    //this.selected = null;
  }

  set selectedCard(card) {
    //this.selected = card;
  }

}
