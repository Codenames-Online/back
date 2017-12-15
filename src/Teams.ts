import { SPlayer } from './SPlayer'
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
  readonly red: SPlayer[];
  readonly blue: SPlayer[];

  constructor(red: SPlayer[], blue: SPlayer[]) {
		this.red = red;
		this.blue = blue;
  }
}
