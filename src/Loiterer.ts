import { Player } from './Player'
import { TeamPlayer } from './TeamPlayer';
import { Team } from "./constants/Constants";

import ws = require('ws')

export class Loiterer extends TeamPlayer {
  static loitererFromPlayer(player: Player, team: Team): Loiterer {
    return new Loiterer(player.id, player.name, player.socket, team);
  }
}
