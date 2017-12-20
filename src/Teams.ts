import { TeamPlayer } from './TeamPlayer';

export class Teams<T extends TeamPlayer> {
  readonly red: T[];
  readonly blue: T[];

  constructor(red: T[], blue: T[]) {
		this.red = red;
		this.blue = blue;
  }
}