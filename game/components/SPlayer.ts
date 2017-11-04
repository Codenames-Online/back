import { Team } from "../constants";

export class SPlayer {
  name: string;
  id: number;
  team: Team;

  constructor(name, id, team) {
    if (new.target === SPlayer) {
      throw new TypeError("SPlayer is an abstract class.");
    }

    this.name = name;
    this.id = id;
    this.team = team;
  }
}
