import { Clue } from '../src/Clue'
import { Card } from '../src/Card'
import { SPlayer } from '../src/SPlayer';
import { SLoiterer } from '../src/SLoiterer';
import { SSpymaster } from '../src/SSpymaster';
import { SOperative } from '../src/SOperative';
import { RuleEnforcer as re } from '../src/RuleEnforcer';
import { Color, Team, Turn } from '../src/constants/Constants';

import 'mocha';
import { expect } from 'chai';
import WebSocket = require('ws')
import { mock, instance, when } from 'ts-mockito';

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

	it("should return false for words that are not on the board (regardless of dictionary)", () => {
		let words = ["ALIEN", "ALPS", "BOARD", "BUG", "BUGLE", "CODE", "DIAMOND", "DICE",
		"EAGLE", "EGYPT", "FISH", "FLY", "GAS", "GENIUS", "HAND", "HOLE", "JAM",
		"LEAD", "LOCH NESS", "POOL", "PYRAMID", "QUEEN", "ROBOT", "SNOWMAN", "WORM"];
		let cards = words.map(word => new Card(word));

		expect(re.isWordOnBoard("porg", cards)).to.be.false;
		expect(re.isWordOnBoard("HELLO", cards)).to.be.false
		expect(re.isWordOnBoard("KNIGHT", cards)).to.be.false;
		expect(re.isWordOnBoard("supercalifragilistcexpialidocious", cards)).to.be.false;
	});

	it("should return true for words that are on the board (regardless of dictionary)", () => {
		let words = ["porg", "ALPS", "BOARD", "BUG", "BUGLE", "CODE", "DIAMOND", "DICE",
		"EAGLE", "EGYPT", "FISH", "FLY", "GAS", "GENIUS", "HAND", "HOLE", "JAM",
		"LEAD", "LOCH NESS", "POOL", "PYRAMID", "QUEEN", "ROBOT", "SNOWMAN", "WORM"];
		let cards = words.map(word => new Card(word));

		expect(re.isWordOnBoard("porg", cards)).to.be.true;
		expect(re.isWordOnBoard("board", cards)).to.be.true;
		expect(re.isWordOnBoard("WORM", cards)).to.be.true;
	});

	it("should correctly determine if it is player turn", () => {
		let red = new SOperative("test", "1", Team.red, mock_ws_instance, Turn.op);

		expect(re.isPlayerTurn(Team.red, Turn.op, red)).to.be.true;
		expect(re.isPlayerTurn(Team.red, Turn.spy, red)).to.be.false;
		expect(re.isPlayerTurn(Team.blue, Turn.op, red)).to.be.false;
		expect(re.isPlayerTurn(Team.blue, Turn.spy, red)).to.be.false;
		
		let blue = new SSpymaster("test", "2", Team.blue, mock_ws_instance, Turn.spy);

		expect(re.isPlayerTurn(Team.red, Turn.op, blue)).to.be.false;
		expect(re.isPlayerTurn(Team.red, Turn.spy, blue)).to.be.false;
		expect(re.isPlayerTurn(Team.blue, Turn.op, blue)).to.be.false;
		expect(re.isPlayerTurn(Team.blue, Turn.spy, blue)).to.be.true;
	});

	it("should correctly determine if a player is a spy", () => {
		let red = new SOperative("test", "1", Team.red, mock_ws_instance, Turn.op);
		let blue = new SSpymaster("test", "2", Team.blue, mock_ws_instance, Turn.spy);

		expect(re.isPlayerSpy(red)).to.be.false;
		expect(re.isPlayerSpy(blue)).to.be.true;
	});
});
