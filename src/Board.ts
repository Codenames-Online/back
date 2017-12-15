import { shuffle, sampleSize } from 'lodash'
import { Card } from "./Card";
import { Team } from "./constants/Constants";
import { words } from "./constants/wordlist";

export class Board {
  cards: Card[];
  colors: number[];
  startTeam: Team;
  constructor(startTeam) {
    this.startTeam = startTeam;
    this.cards = this.generateCards();
    this.colors = this.generateColors();
  }
  
  // blue = 0, red = 1, neutral = 2, assassin = 3

  generateCards(): Card[] {
    return sampleSize(words, 25).map((word) => {
      return new Card(word);
    });
  }

  generateColors(): number[] {
    return shuffle([0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,3,this.startTeam.valueOf()]);
  }
}
