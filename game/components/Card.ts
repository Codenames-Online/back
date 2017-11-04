import { Color } from "../constants/Constants";

export class Card {
  word: string;
  votes: number;
  revealed: boolean;
  color: Color;

  constructor(word, color) {
    this.votes = 0;
    this.revealed = false;
    this.word = word;
    this.color = color;
  }
}
