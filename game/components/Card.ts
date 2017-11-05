export class Card {
  word: string;
  votes: string[];
  revealed: boolean;

  constructor(word) {
    this.votes = [];
    this.revealed = false;
    this.word = word;
  }
}
