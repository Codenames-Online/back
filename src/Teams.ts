import { Player } from './Player'
import { SLoiterer } from './SLoiterer'

export class SLoitererTeams {
  readonly red: SLoiterer[];
  readonly blue: SLoiterer[];

  constructor(red: SLoiterer[], blue: SLoiterer[]) {
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
