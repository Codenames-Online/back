import { Team } from "../constants";

export class SLoiterer {
  name: string;
  id: number;
  team: Team;

  constructor(name, id, team) {
    this.name = name;
    this.id = id;
    this.team = team;
  }
}
