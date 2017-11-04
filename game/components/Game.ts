var crypto =  require('crypto');
import { Board } from './Board';
import { SPlayer } from './SPlayer';
import { SOperative } from './SOperative';
import { SSpymaster } from './SSpymaster';
import { SLoiterer } from './SLoiterer';
import { Broadcaster } from './Broadcaster';
import { Team, Turn } from '../constants/Constants';

export class Game {
	score: number[];
	clue: string;
	numGuesses: number;
	turn: Turn;
	board: Board;
	players: SPlayer[];
	startTeam?: Team;
	currTeam?: Team;

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
    this.numGuesses--;
		if (this.numGuesses == 0) {
			this.switchActiveTeam();
		}
  }

	checkGuess(guessIndex) {
		this.revealCard(guessIndex);
		if (this.board.cards[guessIndex].color === this.currTeam) { //correct guess
			this.decrementGuesses();
			this.updateScore(this.currTeam);
		}
		else if (this.board.cards[guessIndex].color == 3) { //assassin
			this.endGame(((this.currTeam as Team) + 1) % 2);
		}
		else if (this.board.cards[guessIndex].color == 2) { //neutral
			this.switchActiveTeam();
		}
		else { // opposite team card
			this.switchActiveTeam();
			this.updateScore(((this.currTeam as Team) + 1) % 2);
		}
	}

	switchActiveTeam() {
		if (this.currTeam == Team.red) {
			this.currTeam = Team.blue;
		}
		else {
			this.currTeam = Team.red;
		}
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
		this.currTeam = this.startTeam;
  	this.turn = Turn.spy;
  }

  setPlayerRoles() {
    const redTeam = this.players.filter(player => player.team === Team.red)
    const blueTeam = this.players.filter(player => player.team === Team.blue)

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
		this.score[team]--;
		if (this.score[team] == 0) {
			this.endGame(team);
		}
  }

	revealCard(guessIndex) {
		this.board.cards[guessIndex].revealed = true;
		//Broadcaster.revealCard(this.board.cards[guessIndex].color);
	}

	endGame(team) {
		//Broadcaster.endGame(team);
	}
}
