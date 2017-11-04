import { Card } from "./Card";
import { Team } from "../constants/Constants";
import { words } from "../constants/wordlist";
var shuffle = require('shuffle-array');

export class Board {
  cards: Card[];
  startTeam: Team;
  constructor(startTeam) {
    this.startTeam = startTeam;
    this.cards = this.generateCards();
  }

  generateCards() {
    var cardsArray : Card[] = [];
    var cardColors = shuffle([0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,3, Math.round(Math.random())]);
    var cardWords = shuffle.pick(words, { pick : 25 });
    for (var i = 0; i < 25; i++) {
      var card = new Card(cardWords[i], cardColors[i]);
      cardsArray.push(card);
    }
    return cardsArray
  }
}
