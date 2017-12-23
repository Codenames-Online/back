import { Card } from "./Card";
import { Team, Color } from "./constants/Constants";
import { words } from "./constants/Wordlist";

import { shuffle, sampleSize } from 'lodash'

export class Board {
  cards: Card[];
  colors: number[];
  startTeam: Team;

  constructor(startTeam: Team) {
    this.startTeam = startTeam;
    this.cards = this.generateCards();
    this.colors = this.generateColors();
  }

  private generateCards(): Card[] {
    return sampleSize(words, 25).map(word => new Card(word));
  }

  private generateColors(): number[] {
    return shuffle([Color.assassin, this.startTeam.valueOf(),
      ...Array(8).fill(Color.blue), ...Array(8).fill(Color.red),
      ...Array(7).fill(Color.neutral)]);
  }
}