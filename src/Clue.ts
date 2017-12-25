export class Clue {
  word: string;
  num: number;
  guesses: number;

  constructor(word: string, num: number) {
    this.word = word;
    this.num = num;
  }
}