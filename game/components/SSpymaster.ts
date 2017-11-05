import { SPlayer } from "./SPlayer";
import { Turn } from '../constants/Constants';

export class SSpymaster extends SPlayer {
  role: Turn
  
  constructor(name, id, team, socket, role) {
    super(name, id, team, socket);
    this.role = role;
  }
}
