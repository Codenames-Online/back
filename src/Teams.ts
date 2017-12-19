import { Agent } from './Agent'
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
  readonly red: Agent[];
  readonly blue: Agent[];

  constructor(red: Agent[], blue: Agent[]) {
		this.red = red;
		this.blue = blue;
  }
}
