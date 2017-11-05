export class Card {
  word: string;
  votes: number;
  revealed: boolean;

  constructor(word) {
    this.votes = 0;
    this.revealed = false;
    this.word = word;
  }
}
