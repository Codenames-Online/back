import * as _ from 'lodash'
import { GameUtility as gu } from './GameUtility'
import * as c from '../constants/Constants'

import { Clue } from './Clue';
import { Card } from './Card'
import { Board } from './Board';
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

	boardToColorsAndCards(toSpymasters): [number, Card][] {
		return this.board.cards.map((card: Card, index) => {
			let color = (toSpymasters || card.revealed) ? this.board.colors[index] : 4;
			return [color, card] as [number, Card];
		});
	}

	broadcastUpdatedBoard() {
		var spymasters = this.findSpymasters();
    var operatives = this.findOperatives();

		Broadcaster.updateBoard(operatives, this.boardToColorsAndCards(false));
		Broadcaster.updateBoard(spymasters, this.boardToColorsAndCards(true));
	}

	// adds new loiterer to play class
	// TODO: Weird typing issue between here and Receiver
  registerLoiterer(name: string, socket) {
		let sloitererTeams: [SLoiterer[], SLoiterer[]] = gu.getSloitererTeams(this.loiterers);
		let team: Team = sloitererTeams[Team.blue].length <= sloitererTeams[Team.red].length ? Team.blue : Team.red;
		let id = Date.now().toString(36);

    let newLoiterer = new SLoiterer(name, id, team, socket);
    this.loiterers.push(newLoiterer);
    let sloitererRoster = gu.getSloitererRoster(this.loiterers);

		Broadcaster.updateLoiterer(newLoiterer);
		Broadcaster.updateTeams(this.loiterers, sloitererRoster);
		
		if (RuleEnforcer.canStartGame(sloitererRoster)) {
			Broadcaster.toggleStartButton(this.loiterers, true);
		}
  }

	// switches loiterer team
	switchLoitererTeam(id: string) {
		for (var i = 0; i < this.loiterers.length; i++) {
			if (this.loiterers[i].id === id) {
				var team = this.loiterers[i].team
				team = gu.getOtherTeam(team);
				this.loiterers[i].team = team;
			}
    }

		let sloitererRoster = gu.getSloitererRoster(this.loiterers);

		Broadcaster.updateTeams(this.loiterers, sloitererRoster);
		if (RuleEnforcer.canStartGame(sloitererRoster)) {
			Broadcaster.toggleStartButton(this.loiterers, true);
		}
    else {
      Broadcaster.toggleStartButton(this.loiterers, false);
    }
	}

	// on socket close, remove person
	// TODO: Weird typing between here and receiver
	removePerson(socket) {
		var index = -1
		let roster: [string[], string[]];

		if (this.players.length == 0) {
			for (var i = 0; i < this.loiterers.length; i++) {
				if (_.isEqual(this.loiterers[i].socket, socket)) { index = i; }
			}
			if (index > -1) { this.loiterers.splice(index, 1); }
			
			roster = gu.getSloitererRoster(this.loiterers);
			Broadcaster.updateTeams(this.loiterers, roster);
		}
		else {
			for (var i = 0; i < this.players.length; i++) {
				if (_.isEqual(this.players[i].socket, socket)) { index = i; }
			}
			if (index > -1) { this.players.splice(index, 1); }

			roster = gu.getPlayerRoster(this.players);
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
		
		let startingRoster = this.players.map((player) => {
			return { name: player.name, role: player.role, team: player.team }
		});
		
		this.broadcastUpdatedBoard();
		Broadcaster.updateScore(this.players, this.score);
		Broadcaster.startGame(this.players, this.currTeam, startingRoster);

		
		let spyMaster = this.findSpymasters()[this.startTeam];

		console.log(JSON.stringify(spyMaster));
		console.log("Starting team " + this.startTeam)
		console.log("Curr team " + this.currTeam)

		Broadcaster.promptForClue(spyMaster);
  }

	// turn loiterers into players
	setPlayerRoles(): void {
		let foundSpy: [boolean, boolean] = [false, false];
		let haveTeamSpy: boolean;
		for (let loit of this.loiterers) {
			haveTeamSpy = foundSpy[loit.team];
			let player = haveTeamSpy
				? new SOperative(loit.name, loit.id, loit.team, loit.socket, Turn.op)
				: new SSpymaster(loit.name, loit.id, loit.team, loit.socket, Turn.spy);

			if(!haveTeamSpy) { foundSpy[loit.team] = true; }
			
			this.players.push(player);
			Broadcaster.updateLoitererToPlayer(loit, player);
		}
		
		this.loiterers = [];
  }

	findSpymasters(): SSpymaster[] {		
		return this.players.filter(player => player.role === Turn.spy).sort((p1, p2) => {
			return p1.team < p2.team ? -1 : 1;
		});
	}

	findOperatives(): SOperative[] {
    return this.players.filter(player => player.role === Turn.op) as SOperative[];
	}

	getPlayerById(id: string): SPlayer {
    // TODO: REALLLLLLLLY SHOULDNT CAST LIKE THIS
    return this.players.find((player) => { return player.id === id; }) as SPlayer;
	}

  setStartTeam(): void {
  	this.startTeam = Math.round(Math.random()) ? Team.red : Team.blue ;
  }

  // set the clue and the initial number of guesses for operatives, switch turn to operatives
  initializeClue(clue: Clue): void {
		this.clue = clue;
		this.clue.num = Number(clue.num) + 1;
		console.log("Clue num after: " + this.clue.num);
		this.turn = Turn.op;
		this.numGuesses = clue.num;

		Broadcaster.switchTurn(this.players, this.currTeam, this.turn);
		Broadcaster.postClue(this.players, this.clue, this.currTeam);
  }

	selectCard(player: SOperative, cardIndex: number): void {
		player.selectCard(this.board.cards[cardIndex]);
		this.board.cards[cardIndex].votes.push(player.name);
		this.broadcastUpdatedBoard();
	}

	deselectCard(player: SOperative, cardIndex: number): void {
		Broadcaster.allowGuess(gu.getPlayerTeams(this.players)[this.currTeam], false);

		var playerIndex = this.board.cards[cardIndex].votes.indexOf(player.name);
		this.board.cards[cardIndex].votes.splice(playerIndex, 1);
		this.broadcastUpdatedBoard();
	}

  // decrease number of guesses
  decrementGuesses(): void {
    this.numGuesses--;
		if (this.numGuesses == 0) { this.switchActiveTeam(); }

		(this.clue as Clue).num--;
		Broadcaster.postClue(this.players, this.clue as Clue, this.currTeam);
  }

	guessAllowed(): void {
		Broadcaster.allowGuess(gu.getPlayerTeams(this.players)[this.currTeam], true);
	}

	checkGuess(guessIndex: number): void {
		this.revealCard(guessIndex);

		switch(this.board.colors[guessIndex]) {
			case this.currTeam:
				this.decrementGuesses();
				this.updateScore(this.currTeam);
				break;
			case c.ASSASSIN:
				this.endGame(gu.getOtherTeam(this.currTeam));
				break;
			case gu.getOtherTeam(this.currTeam):
				this.updateScore(gu.getOtherTeam(this.currTeam));
				// fall through
			case c.NEUTRAL:
				this.switchActiveTeam()
				break;
			default:
				throw new Error(`There shouldn't be an extra card type: ${this.board.colors[guessIndex]}`);
		}

		this.broadcastUpdatedBoard();
	}

	switchActiveTeam(): void {
    this.currTeam = this.currTeam === Team.red ? Team.blue : Team.red;
		this.turn = Turn.spy;
		var spymasters = this.findSpymasters();
		Broadcaster.promptForClue(spymasters[this.currTeam]);
		Broadcaster.switchActiveTeam(this.players, this.currTeam, this.turn);
	}

  // update this.score
  updateScore(team: Team): void {
		this.score[team]--;
		if (this.score[team] == 0) {
			this.endGame(team);
		}
		Broadcaster.updateScore(this.players, this.score);
  }

	revealCard(guessIndex: number): void {
		this.board.cards[guessIndex].revealed = true;
		this.broadcastUpdatedBoard();
	}

	endGame(team: Team): void {
		Broadcaster.endGame(this.players, team);
	}
}
