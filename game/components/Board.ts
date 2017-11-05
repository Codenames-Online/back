import { Card } from "./Card";
import { Team } from "../constants/Constants";
import { words } from "../constants/wordlist";
var shuffle = require('shuffle-array');

export class Board {
  cards: Card[];
  colors: number[];
  startTeam: Team;
  constructor(startTeam) {
    this.startTeam = startTeam;
    this.cards = this.generateWords();
    this.colors = this.generateColors();
  }

  // blue = 0, red = 1, neutral = 2, assassin = 3

  generateWords() {
    var cardsArray : Card[] = [];
    var cardWords = shuffle.pick(words, { pick : 25 });
    for (var i = 0; i < 25; i++) {
      var card = new Card(cardWords[i]);
      cardsArray.push(card);
    }
    return cardsArray
  }

  generateColors() {
    var cardColors = shuffle([0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,3, this.startTeam.valueOf]);
    return cardColors
  }

  findCard(word) {

  }
}
