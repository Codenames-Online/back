import { Clue } from '../src/Clue'
import { Card } from '../src/Card'
import { Agent } from '../src/Agent';
import { Player } from '../src/Player';
import { Loiterer } from '../src/Loiterer';
import { Spymaster } from '../src/Spymaster';
import { Operative } from '../src/Operative';
import { GameUtility as gu } from '../src/GameUtility';
import { RuleEnforcer as re } from '../src/RuleEnforcer';
import { Color, Team, Turn } from '../src/constants/Constants';

import 'mocha';
import { expect } from 'chai';
import WebSocket = require('ws')
import { mock, instance, when } from 'ts-mockito';
import { decode } from 'punycode';

describe("Filename: rules_enforcer.test.ts:\n\nRules Enforcer", () => {
	let mock_ws: WebSocket;
	let mock_ws_instance: WebSocket;

	before(() => {
		mock_ws = mock(WebSocket);
		mock_ws_instance = instance(mock_ws);
	});

	it("should allow names that have at least one character and only letters, underscores and spaces", () => {
		expect(re.isValidName('test')).to.be.true;
		expect(re.isValidName('valid name')).to.be.true;
		expect(re.isValidName('also_valid_name')).to.be.true;
		expect(re.isValidName('FINAL also_valid nAme')).to.be.true;
	});
	
	it("should not allow names that anything besides letters, underscores and spaces", () => {
		expect(re.isValidName('')).to.be.false;
		expect(re.isValidName('1nvalid name')).to.be.false;
		expect(re.isValidName('@lso_invalid_name')).to.be.false;
		expect(re.isValidName('FINAL-also_invalid-nAme')).to.be.false;
	});
	
	it("should allow numbers of guesses between 0 and 9 inclusive", () => {
		expect(re.isValidNumGuesses(0)).to.be.true;
		expect(re.isValidNumGuesses(5)).to.be.true;
		expect(re.isValidNumGuesses(9)).to.be.true;
	});
		
	it("should not allow numbers of guesses outside 0 and 9 inclusive", () => {
		expect(re.isValidNumGuesses(-1)).to.be.false;
		expect(re.isValidNumGuesses(10)).to.be.false;
		expect(re.isValidNumGuesses(999)).to.be.false;
		expect(re.isValidNumGuesses(-1000)).to.be.false;
	});

	it("should allow words in dictionary ", () => {
		expect(re.isValidWord("test")).to.be.true;
		expect(re.isValidWord("hello")).to.be.true;
		expect(re.isValidWord("rabbit")).to.be.true;
		expect(re.isValidWord("coniferous")).to.be.true;
	});

	it("should not allow words not in dictionary", () => {
		expect(re.isValidWord("bae")).to.be.false
		expect(re.isValidWord("porg")).to.be.false;
		expect(re.isValidWord("asdfasdjflasdjflkasdjflkasdj")).to.be.false;
		expect(re.isValidWord("supercalifragilistcexpialidocious")).to.be.false;
	});

	it("should determine if words are not on the board (regardless of dictionary)", () => {
		let words = ["ALIEN", "ALPS", "BOARD", "BUG", "BUGLE", "CODE", "DIAMOND", "DICE",
		"EAGLE", "EGYPT", "FISH", "FLY", "GAS", "GENIUS", "HAND", "HOLE", "JAM",
		"LEAD", "LOCH NESS", "POOL", "PYRAMID", "QUEEN", "ROBOT", "SNOWMAN", "WORM"];
		let cards = words.map(word => new Card(word));

		expect(re.isWordOnBoard("porg", cards)).to.be.false;
		expect(re.isWordOnBoard("HELLO", cards)).to.be.false
		expect(re.isWordOnBoard("KNIGHT", cards)).to.be.false;
		expect(re.isWordOnBoard("supercalifragilistcexpialidocious", cards)).to.be.false;
	});

	it("should determine if words are on the board (regardless of dictionary)", () => {
		let words = ["porg", "ALPS", "BOARD", "BUG", "BUGLE", "CODE", "DIAMOND", "DICE",
		"EAGLE", "EGYPT", "FISH", "FLY", "GAS", "GENIUS", "HAND", "HOLE", "JAM",
		"LEAD", "LOCH NESS", "POOL", "PYRAMID", "QUEEN", "ROBOT", "SNOWMAN", "WORM"];
		let cards = words.map(word => new Card(word));

		expect(re.isWordOnBoard("porg", cards)).to.be.true;
		expect(re.isWordOnBoard("board", cards)).to.be.true;
		expect(re.isWordOnBoard("WORM", cards)).to.be.true;
	});

	it("should correctly determine if it is player turn", () => {
		let red = new Operative("test", "1", mock_ws_instance, Team.red);

		expect(re.isAgentTurn(Team.red, Turn.op, red)).to.be.true;
		expect(re.isAgentTurn(Team.red, Turn.spy, red)).to.be.false;
		expect(re.isAgentTurn(Team.blue, Turn.op, red)).to.be.false;
		expect(re.isAgentTurn(Team.blue, Turn.spy, red)).to.be.false;
		
		let blue = new Spymaster("test", "2", mock_ws_instance, Team.blue);

		expect(re.isAgentTurn(Team.red, Turn.op, blue)).to.be.false;
		expect(re.isAgentTurn(Team.red, Turn.spy, blue)).to.be.false;
		expect(re.isAgentTurn(Team.blue, Turn.op, blue)).to.be.false;
		expect(re.isAgentTurn(Team.blue, Turn.spy, blue)).to.be.true;
	});

	it("should correctly determine if a player is a spy", () => {
		let red = new Operative("test", "1", mock_ws_instance, Team.red);
		let blue = new Spymaster("test", "2", mock_ws_instance, Team.blue);

		expect(re.isAgentSpy(red)).to.be.false;
		expect(re.isAgentSpy(blue)).to.be.true;
	});

	it("should correctly determine if a card is selectable", () => {
		let words = ["porg", "ALPS", "BOARD", "BUG", "BUGLE", "CODE", "DIAMOND", "DICE",
		"EAGLE", "EGYPT", "FISH", "FLY", "GAS", "GENIUS", "HAND", "HOLE", "JAM",
		"LEAD", "LOCH NESS", "POOL", "PYRAMID", "QUEEN", "ROBOT", "SNOWMAN", "WORM"];
		let cards = words.map(word => new Card(word));

		cards[24].revealed = true;

		expect(re.isCardSelectable(cards, 0)).to.be.true;
		expect(re.isCardSelectable(cards, 24)).to.be.false;
	});

	it("should correctly determine if we can start a game", () => {
		let red_l_one = new Loiterer("red", "1", mock_ws_instance, Team.red);
		let red_l_two = new Loiterer("red", "2", mock_ws_instance, Team.red);
		let blue_l_one = new Loiterer("blue", "1", mock_ws_instance, Team.blue);
		let blue_l_two = new Loiterer("blue", "2", mock_ws_instance, Team.blue);
		let blue_l_three = new Loiterer("blue", "3", mock_ws_instance, Team.blue);
		let loiterers = [red_l_one, red_l_two, blue_l_one, blue_l_two, blue_l_three];

		let can_start_one = [red_l_one, red_l_two, blue_l_one, blue_l_two];
		let can_start_two = [red_l_one, red_l_two, blue_l_one, blue_l_two, blue_l_three];
		let cant_start_one = [];
		let cant_start_two = [red_l_one, red_l_two, blue_l_one];
		let cant_start_three = [red_l_one, blue_l_one, blue_l_two, blue_l_three];

		expect(re.canStartGame(gu.getTeams(can_start_one))).to.be.true;
		expect(re.canStartGame(gu.getTeams(can_start_two))).to.be.true;
		expect(re.canStartGame(gu.getTeams(cant_start_one))).to.be.false;
		expect(re.canStartGame(gu.getTeams(cant_start_two))).to.be.false;
		expect(re.canStartGame(gu.getTeams(cant_start_three))).to.be.false;
	});

	it("should correctly determine if a guess can be submitted", () => {		
		let red_p_one = new Spymaster("red", "1", mock_ws_instance, Team.red);
		let red_p_two = new Operative("red", "2", mock_ws_instance, Team.red);
		let red_p_three = new Operative("red", "3", mock_ws_instance, Team.red);
		let blue_p_one = new Spymaster("blue", "1", mock_ws_instance, Team.blue);
		let blue_p_two = new Operative("blue", "2", mock_ws_instance, Team.blue);
		let agents: Agent[] = [red_p_one, red_p_two, red_p_three, blue_p_one, blue_p_two];

		// TODO: Use utility method for getting ops
		let ops: Operative[] = agents.filter(agent => agent.role === Turn.op) as Operative[];
		let select_card = new Card("select");
		let decoy_card = new Card("decoy");

		expect(re.canSubmitGuess(ops, Team.red)).to.be.false;

		red_p_two.selectCard(select_card);
		select_card.votes.push(red_p_two.name);

		expect(re.canSubmitGuess(ops, Team.red)).to.be.false;

		red_p_three.selectCard(decoy_card);
		decoy_card.votes.push(red_p_three.name);

		expect(re.canSubmitGuess(ops, Team.red)).to.be.false;

		red_p_three.selectCard(select_card);
		select_card.votes.push(red_p_three.name);

		expect(re.canSubmitGuess(ops, Team.red)).to.be.true;
	});
});
