var crypto = require('crypto');
var _ = require('lodash')
import { Board } from './Board';
import { Clue } from './Clue';
import { SPlayer } from './SPlayer';
import { SOperative } from './SOperative';
import { SSpymaster } from './SSpymaster';
import { SLoiterer } from './SLoiterer';
import { Broadcaster } from './Broadcaster';
import { Team, Turn } from '../constants/Constants';
import { RuleEnforcer } from './RuleEnforcer';

export class Game {
	score: number[];
	clue?: Clue;
	numGuesses: number;
	turn?: Turn;
	board: Board;
	players: SPlayer[];
	loiterers: SLoiterer[];
	startTeam?: Team;
	currTeam?: Team;

  constructor() {
    this.numGuesses = 0;
		this.loiterers = [];
		this.players = [];
  }

	// TODO: testing
	// create roster of blue and red teams
	getRoster(arr) {
		const redTeam = arr.filter(person => person.team === Team.red)
    const blueTeam = arr.filter(person => person.team === Team.blue)
		var roster = [blueTeam, redTeam];
		return roster
	}

	// adds new loiterer to play class
  registerLoiterer(name, socket) {
    let team = this.whichTeam();
		var hash = crypto.createHash('md5');
    const id = hash.update(Date.now()).digest('hex');
    let newLoiterer = new SLoiterer(name, id, team, socket);
    this.loiterers.push(newLoiterer);
		var roster = this.getRoster(this.loiterers);
		Broadcaster.updateTeams(this.loiterers, roster);
		Broadcaster.updateLoiterer(newLoiterer);
		if (RuleEnforcer.canStartGame(roster)) {
			Broadcaster.toggleStartButton(this.loiterers, true);
		}
  }

	// switches player team
	switchLoitererTeam(id) {
		for (var i = 0; i < this.loiterers.length; i++) {
			if (this.loiterers[i].id === id) {
				var team = this.loiterers[i].team
				team = (team + 1) % 2;
				this.loiterers[i].team = team;
			}
		}
		var roster = this.getRoster(this.loiterers);
		Broadcaster.updateTeams(this.loiterers, roster);
		if (RuleEnforcer.canStartGame(roster)) {
			Broadcaster.toggleStartButton(this.loiterers, true);
		}
	}

	// on socket close, remove loiterer or person
	removePerson(socket) {
		var index = -1
		if (this.players.length == 0) {
			for (var i = 0; i < this.loiterers.length; i++) {
				if (_.isEqual(this.loiterers[i].socket, socket)) {
					index = i;
				}
			}
			if (index > -1) {
				this.loiterers.splice(index, 1);
			}
			var roster = this.getRoster(this.loiterers);
			Broadcaster.updateTeams(this.loiterers, roster);
		}
		else {
			for (var i = 0; i < this.players.length; i++) {
				if (_.isEqual(this.players[i].socket, socket)) {
					index = i;
				}
			}
			if (index > -1) {
				this.players.splice(index, 1);
			}
			var roster = this.getRoster(this.players);
			Broadcaster.updateTeams(this.players, roster);
		}
		if (!RuleEnforcer.canStartGame(roster)) {
			Broadcaster.toggleStartButton(this.loiterers, false);
		}
	}

  // set the clue word and the initial number of guesses for operatives
  // string, int ->
	// TODO: bc string is now Clue
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
		if (this.board.colors[guessIndex] === this.currTeam) { //correct guess
			this.decrementGuesses();
			this.updateScore(this.currTeam);
		}
		else if (this.board.colors[guessIndex] == 3) { //assassin
			this.endGame(((this.currTeam as Team) + 1) % 2);
		}
		else if (this.board.colors[guessIndex] == 2) { //neutral
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
		var roster = this.getRoster(this.loiterers);
		var blueTeam = roster[0];
		var redTeam = roster[1];
		this.loiterers = [];

    if(redTeam.length < 2 || blueTeam.length < 2) {
      throw new Error("Not enough players");
    }

		//type checker stupid
    const redPlayer = redTeam.pop() as SPlayer;
    const bluePlayer = blueTeam.pop() as SPlayer;
    this.players.push(new SSpymaster(redPlayer.name, redPlayer.id, redPlayer.team, redPlayer.socket));

    while(redTeam.length > 0) {
      const redPlayer = redTeam.pop() as SPlayer;
      this.players.push(new SOperative(redPlayer.name, redPlayer.id, redPlayer.team, redPlayer.socket));
    }

    this.players.push(new SSpymaster(bluePlayer.name, bluePlayer.id, bluePlayer.team, bluePlayer.socket));

    while(blueTeam.length > 0) {
      const bluePlayer = blueTeam.pop() as SPlayer;
      this.players.push(new SOperative(bluePlayer.name, bluePlayer.id, bluePlayer.team, bluePlayer.socket));
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
		Broadcaster.revealCard(this.players, this.board.cards[guessIndex]);
	}

	endGame(team) {
		//Broadcaster.endGame(team);
	}
}
