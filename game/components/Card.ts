export class Card {
  word: string;
  votes: number[];
  revealed: boolean;

  constructor(word) {
    this.votes = [];
    this.revealed = false;
    this.word = word;
  }
}
