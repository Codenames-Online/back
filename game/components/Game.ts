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
	turn: Turn;
	board: Board;
	players: SPlayer[];
	loiterers: SLoiterer[];
	startTeam: Team;
	currTeam: Team;

  constructor() {
    this.numGuesses = 0;
		this.loiterers = [];
		this.players = [];
  }

	broadcastUpdatedBoard() {
		var spymasters = this.findSpymasters();
    var operatives = this.findOperatives();
    
		Broadcaster.updateBoard(operatives, this.board.cards.map(
			(card, index) => {
				return [card, card.revealed ? this.board.colors[index] : 4]
			}
		));
		Broadcaster.updateBoard(spymasters, this.board);
	}

	// TODO: testing
	// create roster of blue and red teams
	getRoster(players) { //: [SPlayer[], SPlayer[]] {
		const redTeam = players.filter(person => person.team === Team.red)
    const blueTeam = players.filter(person => person.team === Team.blue)
		return [blueTeam, redTeam];
	}

	// adds new loiterer to play class
  registerLoiterer(name, socket) {
		var roster = this.getRoster(this.loiterers);
    if (roster[0].length <= roster[1].length) {
			var team = Team.blue;
		}
		else {
			var team = Team.red;
		}
		var hash = crypto.createHash('md5');
    const id = hash.update(Date.now().toString()).digest('hex');
    let newLoiterer = new SLoiterer(name, id, team, socket);
    this.loiterers.push(newLoiterer);
    var roster = this.getRoster(this.loiterers);
    let temp = roster;

		Broadcaster.updateTeams(this.loiterers, temp);
		Broadcaster.updateLoiterer(newLoiterer);
		if (RuleEnforcer.canStartGame(roster)) {
			Broadcaster.toggleStartButton(this.loiterers, true);
		}
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
		Broadcaster.updateScore(this.players, this.score);
		this.broadcastUpdatedBoard();
		var spymasters = this.findSpymasters();
		Broadcaster.promptForClue(spymasters[this.startTeam]);
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

	findSpymasters(): SSpymaster[] {
		var spymasters : SSpymaster[] = [];
		var roster = this.getRoster(this.players)
		for (var player of roster) {
			if (player.role === Turn.spy) {
				spymasters[player.team] = player;
			}
    }
    
    return spymasters;
	}

	findOperatives(): SOperative[] {
    return this.players.filter((player) => { player.role === Turn.op }) as SOperative[];
	}

	getPlayerById(id) {
    return this.players.find((player) => { return player.id === id; });
	}

  setStartTeam(): void {
  	this.startTeam = Math.round(Math.random()) ? Team.red : Team.blue ;
  }

  // set the clue and the initial number of guesses for operatives, switch turn to operatives
  initializeClue(clue): void {
    this.clue = clue;
    this.numGuesses = clue.num + 1;
		Broadcaster.postClue(this.players, this.clue as Clue, this.currTeam);
		this.turn = Turn.op;
		Broadcaster.switchTurn(this.players, this.currTeam, this.turn);
  }

	selectCard(player, cardIndex): void {
		player.selectCard(this.board.cards[cardIndex]);
		this.board.cards[cardIndex].votes.push(player.id);
		this.broadcastUpdatedBoard();
	}

	deselectCard(player, cardIndex): void {
		var playerIndex = this.board.cards[cardIndex].votes.indexOf(player.id);
		this.board.cards[cardIndex].votes.splice(playerIndex, 1);
		this.broadcastUpdatedBoard();
	}

  // decrease number of guesses
  decrementGuesses(): void {
    this.numGuesses--;
		if (this.numGuesses == 0) {
			this.switchActiveTeam();
		}
		Broadcaster.updateNumGuesses(this.players, this.numGuesses);
  }

	checkGuess(guessIndex): void {
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
		Broadcaster.updateBoard(this.players, this.board);
	}

	switchActiveTeam(): void {
		if (this.currTeam == Team.red) {
			this.currTeam = Team.blue;
		}
		else {
			this.currTeam = Team.red;
		}
		this.turn = Turn.spy;
		var spymasters = this.findSpymasters();
		Broadcaster.promptForClue(spymasters[this.currTeam]);
		Broadcaster.switchActiveTeam(this.players, this.currTeam, this.turn);
	}

  // update this.score
  updateScore(team): void {
		this.score[team]--;
		if (this.score[team] == 0) {
			this.endGame(team);
		}
		Broadcaster.updateScore(this.players, this.score);
  }

	revealCard(guessIndex): void {
		this.board.cards[guessIndex].revealed = true;
		this.broadcastUpdatedBoard();
	}

	endGame(team): void {
		Broadcaster.endGame(this.players, team);
	}
}
