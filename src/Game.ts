import { Clue } from './Clue';
import { Card } from './Card'
import { Board } from './Board';
import { Agent } from './Agent';
import { Operative } from './Operative';
import { Spymaster } from './Spymaster';
import { Loiterer } from './Loiterer';
import { Broadcaster } from './Broadcaster';
import { GameUtility as gu } from './GameUtility'
import { RuleEnforcer as re } from './RuleEnforcer';
import { SPlayerTeams, SLoitererTeams } from './Teams'
import { Color, Team, Turn } from './constants/Constants';

import ws = require('ws');
import * as _ from 'lodash'
import * as c from './constants/Constants'

export class Game {
	score: number[];
	clue?: Clue;
	numGuesses: number;
	turn: Turn;
	board: Board;
	players: Agent[];
	loiterers: Loiterer[];
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

	// on socket close, remove person
	// TODO: Weird typing between here and receiver
	removePerson(socket: ws) {
		var index = -1
		let roster: [string[], string[]];

		if (this.players.length == 0) {
			for (var i = 0; i < this.loiterers.length; i++) {
				if (_.isEqual(this.loiterers[i].socket, socket)) { index = i; }
			}
			if (index > -1) { this.loiterers.splice(index, 1); }

			let teams = gu.getSloitererTeams(this.loiterers);
			roster = gu.getSloitererRoster(teams);
			Broadcaster.updateTeams(this.loiterers, roster);
			
			if (!re.canStartGame(teams)) {
				Broadcaster.toggleStartButton(this.loiterers, false);
			}
		}
		else {
			for (var i = 0; i < this.players.length; i++) {
				if (_.isEqual(this.players[i].socket, socket)) { index = i; }
			}
			if (index > -1) { this.players.splice(index, 1); }

			roster = gu.getPlayerRoster(gu.getPlayerTeams(this.players));
			Broadcaster.updateTeams(this.players, roster);
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
		Broadcaster.promptForClue(spyMaster);
  }

	// turn loiterers into players
	setPlayerRoles(): void {
		let foundSpy: [boolean, boolean] = [false, false];
		let haveTeamSpy: boolean;
		for (let loit of this.loiterers) {
			haveTeamSpy = foundSpy[loit.team];
			let player = haveTeamSpy
				? new Operative(loit.id, loit.name, loit.socket, loit.team)
				: new Spymaster(loit.id, loit.name, loit.socket, loit.team);

			if(!haveTeamSpy) { foundSpy[loit.team] = true; }

			this.players.push(player);
			Broadcaster.updateLoitererToPlayer(loit, player);
		}

		this.loiterers = [];
  }

	findSpymasters(): Spymaster[] {
		return this.players.filter(player => player.role === Turn.spy).sort((p1, p2) => {
			return p1.team < p2.team ? -1 : 1;
		});
	}

	findOperatives(): Operative[] {
    return this.players.filter(player => player.role === Turn.op) as Operative[];
	}

	getPlayerById(id: string): Agent {
    // TODO: REALLLLLLLLY SHOULDNT CAST LIKE THIS
    return this.players.find((player) => { return player.id === id; }) as Agent;
	}

  setStartTeam(): void {
  	this.startTeam = Math.round(Math.random()) ? Team.red : Team.blue ;
  }

  // set the clue and the initial number of guesses for operatives, switch turn to operatives
  initializeClue(clue: Clue): void {
		this.clue = clue;
		this.clue.num = Number(clue.num);
		this.clue.guesses = Number(clue.num) + 1;
		console.log("Clue num after: " + this.clue.num);
		this.turn = Turn.op;
		this.numGuesses = clue.guesses;

		Broadcaster.switchTurn(this.players, this.currTeam, this.turn);
		Broadcaster.postClue(this.players, this.clue, this.currTeam);
  }

	// toggle card (select OR deselect)
	toggleCard(player: Operative, cardIndex: number): void {
		var playerIndex = this.board.cards[cardIndex].votes.indexOf(player.name);
		if (playerIndex !== -1) {
			player.deselectCard();
			this.board.cards[cardIndex].votes.splice(playerIndex, 1);
		}
		else {
			player.selectCard(this.board.cards[cardIndex]);
			this.board.cards[cardIndex].votes.push(player.name);
		}
		this.broadcastUpdatedBoard();
	}

  // decrease number of guesses
  decrementGuesses(): void {
    this.numGuesses--;
		(this.clue as Clue).guesses--;
		Broadcaster.postClue(this.players, this.clue as Clue, this.currTeam);

		if (this.numGuesses == 0) { this.switchActiveTeam(); }
  }

	guessAllowed(): void {
		let teams = gu.getPlayerTeams(this.players);
		Broadcaster.allowGuess(this.currTeam === Team.red ? teams.red : teams.blue, true);
	}

	checkGuess(guessIndex: number): void {
		this.revealCard(guessIndex);

		switch(this.board.colors[guessIndex]) {
			case this.currTeam:
				this.decrementGuesses();
				this.updateScore(this.currTeam);
				break;
			case Color.assassin:
				this.endGame(gu.getOtherTeam(this.currTeam));
				break;
			case gu.getOtherTeam(this.currTeam):
				this.updateScore(gu.getOtherTeam(this.currTeam));
				// fall through
			case Color.neutral:
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
		Broadcaster.switchActiveTeam(this.players, this.currTeam, this.turn);
		Broadcaster.promptForClue(spymasters[this.currTeam]);
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

	handleMessage(message: any, socket: ws) {
		switch(message.action) {
			case "sendClue":
				console.log('Case sendClue reached');
				if(re.isLegalClue(message.clue, this.board.cards)
				&& re.isPlayerTurn(this.currTeam, this.turn, this.getPlayerById(message.pid))) {
					this.initializeClue(message.clue);
				} else {
					if(!re.isValidWord(message.clue.word)) {
						socket.send(JSON.stringify({ action: "invalidClueWord", reason: "notWord"}));
					} else if(re.isWordOnBoard(message.clue.word, this.board.cards)) {
						socket.send(JSON.stringify({ action: "invalidClueWord", reason: "wordOnBoard"}));							
					} else if(!re.isValidNumGuesses(message.clue.num)) {
						socket.send(JSON.stringify({ action: "invalidClueNum", }));
					}
				}
				break;

			case "toggleCard": {
				console.log('Case toggleCard reached');
				let sop: Operative = this.getPlayerById(message.pid) as Operative;
				if(re.isCardSelectable(this.board.cards, message.cardIndex)
					&& re.isPlayerTurn(this.currTeam, this.turn, sop)
					&& !re.isPlayerSpy(sop)) {
					let previousSelection = this.board.cards.findIndex((card: Card) => {
						return card.votes.indexOf(sop.name) !== -1;
					});

					if(previousSelection !== -1) {
						console.log('first');
						this.toggleCard(sop, previousSelection);
					}

					if (Number(previousSelection) !== Number(message.cardIndex)) {
						console.log('second');
						this.toggleCard(sop, message.cardIndex);
					}
				}

				let canGuess= re.canSubmitGuess(this.findOperatives(), this.currTeam);
				if(canGuess
					&& !re.isPlayerSpy(sop)
					&& re.isPlayerTurn(this.currTeam, this.turn, sop)) {
					this.guessAllowed();
				}

				break;
			}

			case "submitGuess":
				console.log('Case submitGuess reached');
				let sop: Operative = this.getPlayerById(message.pid) as Operative;
				let currSelection = this.board.cards.findIndex((card: Card) => {
					return card.votes.indexOf(sop.name) !== -1;
				});

				this.checkGuess(currSelection as number);

				this.findOperatives().filter(op => op.team === sop.team).forEach(
					innerOp => this.toggleCard(innerOp, currSelection)
				)
				break;

			case "endGame":
				console.log('Case endTurn reached');
				break;

			case "sendMessage":
				console.log('Case sendMessage reached');

				const player = this.getPlayerById(message.pid);
				if(!re.isPlayerSpy(player)) {
					Broadcaster.sendMessage(this.players, message.text, player)
				}
				break;

			case "endTurn":
				console.log('Case endTurn reached');

				let sp: Agent = this.getPlayerById(message.pid) as Agent;
				if(re.isPlayerTurn(this.currTeam, this.turn, sp)) {
					this.switchActiveTeam();
				}

				break;
			default:
				console.log(`Whoops ${message} is not a known game message`);
		}
	}
}
