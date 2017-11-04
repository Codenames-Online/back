class SPlayer {
  constructor(name, id, team) {
    if (new.target === SPlayer) {
      throw new TypeError("SPlayer is an abstract class.");
    }

    this.name = name;
    this.id = id;
    this.team = team;
  }
}

export default SPlayer;
