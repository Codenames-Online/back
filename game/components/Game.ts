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
	startTeam: Team;
	currTeam?: Team;
	chat: string[];

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

	// identify which team has fewer players
	whichTeam() {
		if(this.getLengthOfTeam(Team.red) >= this.getLengthOfTeam(Team.blue)) {
			return Team.blue;
		}
		return Team.red;
	}

	// needs testing
	// find length of team
	getLengthOfTeam(team) {
		let count = 0;
		for(var player of this.players) {
			if(player.team === team) {
				count++;
			}
		}
		return count;
	}

	// switches loiterer team
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

	// on socket close, remove person
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

	// start button clicked -- set up game!
	startGame() {
  	this.setPlayerRoles();
  	this.setStartTeam();
    this.board = new Board(this.startTeam);
		this.currTeam = this.startTeam;
		this.score = [8,8];
		this.score[this.startTeam] = 9;
  	this.turn = Turn.spy;
		var spymasters = this.findSpymaster();
		Broadcaster.updateScore(this.players, this.score);
		Broadcaster.updateBoard(this.players, this.board);
		Broadcaster.promptForClue(spymasters[this.startTeam]);
		Broadcaster.assignColors(spymasters, this.board.colors);
  }

	// turn loiterers into players
	setPlayerRoles() {
		var foundSpy = [false, false];
		for (var loiterer of this.loiterers) {
			if (foundSpy[loiterer.team]) {
				var operative = new SOperative(loiterer.name, loiterer.id, loiterer.team, loiterer.socket, Turn.op);
				this.players.push(operative);
				Broadcaster.updateLoiterToPlayer(loiterer, operative);
			}
			else {
				var spy= new SSpymaster(loiterer.name, loiterer.id, loiterer.team, loiterer.socket, Turn.spy);
				this.players.push(spy);
				Broadcaster.updateLoiterToPlayer(loiterer, spy);
				foundSpy[loiterer.team] = true;
			}
		}
		this.loiterers = [];
  }

	findSpymaster() {
		var spymasters : SSpymaster[] = [];
		var roster = this.getRoster(this.players)
		for (var player of roster) {
			if (player.role === Turn.spy) {
				spymasters[player.team] = player;
			}
		}
		return spymasters
	}

  setStartTeam() {
  	this.startTeam = Math.round(Math.random()) ? Team.red : Team.blue ;
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
