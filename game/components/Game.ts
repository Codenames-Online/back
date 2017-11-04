var crypto =  require('crypto');
import { Board } from './Board';
import { SPlayer } from './SPlayer';
import { SOperative } from './SOperative';
import { SSpymaster } from './SSpymaster';
import { SLoiterer } from './SLoiterer';
import { Team, Turn } from '../constants';

export class Game {
	private score: number;
	private clue: string;
	private numGuesses: number;
	private turn: Turn;
	private board: Board;
	private players: SPlayer[];
	private startTeam: Team;

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
  registerPlayer(name) {
    let team = this.whichTeam();
    const hash = crypto.createHash('md5');                                                                                                                                   
    const id = hash.update(Date.now()).digest('hex');   
    let newLoiterer = new SLoiterer(name, id, team);
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
    for(var player in this.players) {
      if(player.team === team) {
        count++;
      }
    }
    return count;
  }

  startGame() {
  	this.players = this.setPlayerRoles();
  	this.startTeam = this.setStartTeam();
    this.board = new Board(this.startTeam);
  	this.turn = Turn.spy;
  }

  setPlayerRoles() {
    const redTeam = [];
    const blueTeam = [];
    for(let player in this.players) {
      if(player.team === Team.blue) {
        blueTeam.push(player);
      }
      else {
        redTeam.push(player);
      }
    }
    
    if(redTeam.length < 2 || blueTeam.length < 2) {
      throw new Error("not enough players");
    }

    const redPlayer = redTeam.pop();
    const bluePlayer = blueTeam.pop();
    let i = 0;
    const newSpy = new SSpymaster(redPlayer.name, redPlayer.id, redPlayer.team, redPlayer.socket);
    this.players[i] = newSpy;
    i++;

    while(redTeam.length > 0) {
      const redPlayer = redTeam.pop();
      this.players[i] = new SOperative(redPlayer.name, redPlayer.id, redPlayer.team, redPlayer.socket)
      i++;
    }

    this.players[i] = new SSpymaster(bluePlayer.name, bluePlayer.id, bluePlayer.team, bluePlayer.socket);

    while(redTeam.length > 0) {
      const bluePlayer = blueTeam.pop();
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