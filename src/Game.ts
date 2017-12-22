import { Clue } from './Clue';
import { Card } from './Card'
import { Teams } from './Teams';
import { Lobby } from './Lobby';
import { Board } from './Board';
import { Agent } from './Agent';
import { Operative } from './Operative';
import { Spymaster } from './Spymaster';
import { Loiterer } from './Loiterer';
import { Broadcaster } from './Broadcaster';
import { GameUtility as gu } from './GameUtility'
import { RuleEnforcer as re } from './RuleEnforcer';
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
	agents: Agent[];
	currTeam: Team;

  constructor(startTeam: Team) {
		// switching to lobbies
		this.board = new Board(startTeam);
		this.currTeam = startTeam;
		this.score = [8,8];
		this.score[startTeam] = 9;
		this.numGuesses = 0;
		this.agents = [];
		this.turn = Turn.spy;
	}
	
	static gameFromLobby(lobby: Lobby): Game {
		let startTeam = gu.getStartTeam();
		let game = new Game(startTeam);

		game.agents = game.loiterersToAgents(lobby.getLoiterers());
		
		let startingRoster = gu.getStartingRoster(game.agents);

		game.broadcastUpdatedBoard();
		Broadcaster.updateScore(game.agents, game.score);
		Broadcaster.startGame(game.agents, game.currTeam, startingRoster);

		let startSpy: Spymaster[] = gu.getByTeam(gu.getSpymasters(game.agents), startTeam);
		Broadcaster.promptForClue(startSpy.pop() as Spymaster);
		
		return game;
	}
	
	loiterersToAgents(loiterers: Loiterer[]): Agent[] {
		let foundSpy: [boolean, boolean] = [false, false];
		let haveTeamSpy: boolean;
		
		return loiterers.map(loiterer => {
			haveTeamSpy = foundSpy[loiterer.team];
			if(!haveTeamSpy) { foundSpy[loiterer.team] = true; }
			let agent = haveTeamSpy
				? Operative.loitererToOperative(loiterer)
				: Spymaster.loitererToSpymaster(loiterer);
			Broadcaster.updateLoitererToAgent(loiterer, agent);

			return agent;
		});
	}
	
	
	boardToColorsAndCards(toSpymasters): [number, Card][] {
		return this.board.cards.map((card: Card, index) => {
			let color = (toSpymasters || card.revealed) ? this.board.colors[index] : 4;
			return [color, card] as [number, Card];
		});
	}

	broadcastUpdatedBoard() {
		let ops = gu.getOperatives(this.agents).getAll();
		let spys = gu.getSpymasters(this.agents).getAll();

		Broadcaster.updateBoard(ops, this.boardToColorsAndCards(false));
		Broadcaster.updateBoard(spys, this.boardToColorsAndCards(true));
	}

	// on socket close, remove person
	// TODO: Weird typing between here and receiver
	removeAgent(socket: ws) {
		let index = this.agents.findIndex(agent => _.isEqual(agent.socket, socket));
		if (index > -1) { this.agents.splice(index, 1) }

		let roster = gu.getRoster(gu.getTeams(this.agents));
		Broadcaster.updateTeams(this.agents, roster);
	}
	
	// TODO: REALLLLLLLLY SHOULDNT CAST LIKE THIS
	getAgentById(id: string): Agent {
    return this.agents.find(agent => agent.id === id) as Agent;
	}

  // set the clue and the initial number of guesses for operatives, switch turn to operatives
  initializeClue(clue: Clue): void {
		this.clue = clue;
		this.clue.num = Number(clue.num);
		this.clue.guesses = Number(clue.num) + 1;
		console.log("Clue num after: " + this.clue.num);
		this.turn = Turn.op;
		this.numGuesses = clue.guesses;

		Broadcaster.switchTurn(this.agents, this.currTeam, this.turn);
		Broadcaster.postClue(this.agents, this.clue, this.currTeam);
  }

	// toggle card (select OR deselect)
	toggleCard(agent: Operative, cardIndex: number): void {
		let agentIndex = this.board.cards[cardIndex].votes.indexOf(agent.name);
		if (agentIndex !== -1) {
			agent.deselectCard();
			this.board.cards[cardIndex].votes.splice(agentIndex, 1);
		} else {
			agent.selectCard(this.board.cards[cardIndex]);
			this.board.cards[cardIndex].votes.push(agent.name);
		}
	}

  // decrease number of guesses
  decrementGuesses(): void {
    this.numGuesses--;
		(this.clue as Clue).guesses--;
		Broadcaster.postClue(this.agents, this.clue as Clue, this.currTeam);

		if (this.numGuesses == 0) { this.switchActiveTeam(); }
  }

	guessAllowed(): void {
		let teams = gu.getTeams(this.agents);
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
	}

	switchActiveTeam(): void {
    this.currTeam = this.currTeam === Team.red ? Team.blue : Team.red;
		this.turn = Turn.spy;
		
		Broadcaster.switchActiveTeam(this.agents, this.currTeam, this.turn);
		
		let currTeamMaster: Spymaster[] = gu.getByTeam(gu.getSpymasters(this.agents), this.currTeam)
		Broadcaster.promptForClue(currTeamMaster.pop() as Spymaster);
	}

  // update this.score
  updateScore(team: Team): void {
		this.score[team]--;
		if (this.score[team] == 0) {
			this.endGame(team);
		}
		Broadcaster.updateScore(this.agents, this.score);
  }

	revealCard(guessIndex: number): void {
		this.board.cards[guessIndex].revealed = true;
	}

	endGame(team: Team): void {
		Broadcaster.endGame(this.agents, team);
	}

	empty(): boolean {
		return this.agents.length === 0;
	}

	handleMessage(message: any, socket: ws) {
		switch(message.action) {
			case "sendClue":
				console.log('Case sendClue reached');
				if(re.isLegalClue(message.clue, this.board.cards)
				&& re.isAgentTurn(this.currTeam, this.turn, this.getAgentById(message.pid))) {
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
				let sop: Operative = this.getAgentById(message.pid) as Operative;
				if(re.isCardSelectable(this.board.cards, message.cardIndex)
					&& re.isAgentTurn(this.currTeam, this.turn, sop)
					&& !re.isAgentSpy(sop)) {
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

					// move outside this.toggleCard to prevent repeated triggering
					this.broadcastUpdatedBoard();
				}

				let currOperatives = gu.getByTeam(gu.getOperatives(this.agents), this.currTeam);
				if(!re.isAgentSpy(sop)
					&& re.canSubmitGuess(currOperatives)
					&& re.isAgentTurn(this.currTeam, this.turn, sop)) {
					this.guessAllowed();
				}

				break;
			}

			case "submitGuess":
				console.log('Case submitGuess reached');
				let sop: Operative = this.getAgentById(message.pid) as Operative;
				let currSelection = this.board.cards.findIndex((card: Card) => {
					return card.votes.indexOf(sop.name) !== -1;
				});

				this.checkGuess(currSelection as number);

				gu.getByTeam(gu.getOperatives(this.agents), sop.team).forEach(op => 
						this.toggleCard(op, currSelection));
				
				// move outside this.toggleCard to prevent repeated triggering
				this.broadcastUpdatedBoard();
				break;

			case "endGame":
				console.log('Case endTurn reached');
				break;

			case "sendMessage":
				console.log('Case sendMessage reached');

				const agent = this.getAgentById(message.pid);
				if(!re.isAgentSpy(agent)) {
					Broadcaster.sendMessage(this.agents, message.text, agent)
				}
				break;

			case "endTurn":
				console.log('Case endTurn reached');

				let sp: Agent = this.getAgentById(message.pid) as Agent;
				if(re.isAgentTurn(this.currTeam, this.turn, sp)) {
					this.switchActiveTeam();
				}

				break;
			default:
				console.log(`Whoops ${message} is not a known game message`);
		}
	}
}
