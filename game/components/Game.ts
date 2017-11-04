var crypto =  require('crypto');
import { Board } from './Board';
import { SPlayer } from './SPlayer';
import { SOperative } from './SOperative';
import { SSpymaster } from './SSpymaster';
import { SLoiterer } from './SLoiterer';
import { Team, Turn } from '../constants/Constants';

export class Game {
	private score: number;
	private clue: string;
	private numGuesses: number;
	private turn: Turn;
	private board: Board;
	private players: SPlayer[];
	private startTeam?: Team;

  constructor() {
    this.numGuesses = 0;
    // needs to change from being hardcoded
  }

  // set the clue word and the initial number of guesses for operatives
  // string, int ->
  initializeClue(word, num) {
    this.clue = word;
    this.numGuesses = num + 1;
  }

  // decrease number of guesses
  // -> int
  decrementGuesses() {
    return this.numGuesses--;
  }

  // adds new loiterer to play class
  // string ->
  registerPlayer(name, socket) {
    let team = this.whichTeam();
    const hash = crypto.createHash('md5');
    const id = hash.update(Date.now()).digest('hex');
    let newLoiterer = new SLoiterer(name, id, team, socket);
    this.players.push(newLoiterer);
  }

  // identify which team has fewer players
  // -> Enum Team
  whichTeam() {
    if(this.getLengthOfTeam(Team.red) >= this.getLengthOfTeam(Team.blue)) {
      return Team.blue;
    }
    return Team.red;
  }

  // needs testing
  // find length of team
  // Enum Team -> int
  getLengthOfTeam(team) {
    let count = 0;
    for(var player of this.players) {
      if(player.team === team) {
        count++;
      }
    }
    return count;
  }

  startGame() {
  	this.setPlayerRoles();
  	this.setStartTeam();
    this.board = new Board(this.startTeam);
  	this.turn = Turn.spy;
  }

  setPlayerRoles() {
    const redTeam : SPlayer[] = [];
    const blueTeam : SPlayer[] = [];
    for(let player of this.players) {
      if(player.team === Team.blue) {
        blueTeam.push(player);
      }
      else {
        redTeam.push(player);
      }
    }

    if(redTeam.length < 2 || blueTeam.length < 2) {
      throw new Error("Not enough players");
    }

		//type checker stupid
    const redPlayer = redTeam.pop() as SPlayer;
    const bluePlayer = blueTeam.pop() as SPlayer;
    let i = 0;
    this.players[i] = new SSpymaster(redPlayer.name, redPlayer.id, redPlayer.team, redPlayer.socket);
    i++;

    while(redTeam.length > 0) {
      const redPlayer = redTeam.pop() as SPlayer;
      this.players[i] = new SOperative(redPlayer.name, redPlayer.id, redPlayer.team, redPlayer.socket)
      i++;
    }

    this.players[i] = new SSpymaster(bluePlayer.name, bluePlayer.id, bluePlayer.team, bluePlayer.socket);
		i++;

    while(blueTeam.length > 0) {
      const bluePlayer = blueTeam.pop() as SPlayer;
      this.players[i] = new SOperative(bluePlayer.name, bluePlayer.id, bluePlayer.team, bluePlayer.socket)
      i++;
    }

  }

  setStartTeam() {
  	this.startTeam = Math.round(Math.random()) ? Team.red : Team.blue ;
  }

  // update this.score
  updateScore(team) {

  }
}
