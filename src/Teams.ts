import { Player } from './Player'
import { Loiterer } from './Loiterer'

export class SLoitererTeams {
  readonly red: Loiterer[];
  readonly blue: Loiterer[];

  constructor(red: Loiterer[], blue: Loiterer[]) {
		this.red = red;
		this.blue = blue;
  }
}

export class SPlayerTeams {
  readonly red: Player[];
  readonly blue: Player[];

  constructor(red: Player[], blue: Player[]) {
		this.red = red;
		this.blue = blue;
  }
}
