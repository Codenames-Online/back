import { Agent } from '../src/Agent';
import { GameTurn } from '../src/Turn';
import { Loiterer } from '../src/Loiterer';
import { Spymaster } from '../src/Spymaster';
import { Operative } from '../src/Operative';
import { Team, Turn } from '../src/constants/Constants';

import 'mocha';
import ws = require('ws');
import { expect } from 'chai';
import { mock, instance, when, verify, deepEqual } from 'ts-mockito';

describe("Filename: turn.test.ts:\n\nTurn", () => {
	let mock_ws: ws;
	let ws_inst: ws;
	let agents: Agent[];
	let turn: GameTurn;

	before(() => {
		mock_ws = mock(ws);
		ws_inst = instance(mock_ws);

		let data: [string, string, Team, Turn][] = [["1", "red_spy", Team.red, Turn.spy],
		["2", "red_op_one", Team.red, Turn.op], ["3", "red_op_two", Team.red, Turn.op],
		["1", "blue_spy", Team.blue, Turn.spy], ["2", "blue_op_one", Team.blue, Turn.op]]
		
		agents = data.map(t =>
			new (t[3] === Turn.spy ? Spymaster : Operative)(t[0], t[1], ws_inst, t[2])
		);
	});

	beforeEach(() => {
		turn = new GameTurn(Team.red);
	});

	it("should always begin with spy of starting team", () => {	
		expect(turn.getRole()).to.equal(Turn.spy);
		expect(turn.getTeam()).to.equal(Team.red);
	});

	it("should error on starting twice", () => {	
		turn.start([]);
		expect(turn.start).to.throw(Error);
	});

	it("should error on advancing without first starting", () => {	
		expect(turn.advance).to.throw(Error);
	});

	it("should correctly change teams and roles on advance", () => {
		expect(turn.getRole()).to.equal(Turn.spy);
		expect(turn.getTeam()).to.equal(Team.red);

		turn.advance(agents);

		expect(turn.getRole()).to.equal(Turn.op);
		expect(turn.getTeam()).to.equal(Team.red);

		turn.advance(agents);

		expect(turn.getRole()).to.equal(Turn.spy);
		expect(turn.getTeam()).to.equal(Team.blue);

		turn.advance(agents);

		expect(turn.getRole()).to.equal(Turn.op);
		expect(turn.getTeam()).to.equal(Team.blue);

		turn.advance(agents);

		expect(turn.getRole()).to.equal(Turn.spy);
		expect(turn.getTeam()).to.equal(Team.red);
	});

	it("should send expected messages to expected agents on start", () => {
		turn.start(agents);

		// should have sent prompt for clue to red spymaster (for now just confirming
		// that it was sent to one agent)
		verify(mock_ws.send(deepEqual(JSON.stringify(
			{ action: "promptForClue" }
		)))).once();

		// should have sent gameStarted message to all 5 agents
		verify(mock_ws.send(deepEqual(JSON.stringify(
			{ action: "gameStarted", team: turn.getTeam(), turn: turn.getRole() }
		)))).times(5);
	});

	it("should send expected messages to expected agents on advance from spy to op", () => {
		turn.start(agents);

		// state is red spy
		turn.advance(agents);

		// state is red op
		// should have sent switchTurn message to all 5 agents
		verify(mock_ws.send(deepEqual(JSON.stringify(
			{ action: "switchTurn", team: turn.getTeam(), turn: turn.getRole() }
		)))).times(5);
	});

	it("should send expected messages to expected agents on advance from op to spy", () => {
		turn.start(agents);

		// state is red spy
		turn.advance(agents);

		// state is red op
		turn.advance(agents);

		// state is blue spy
		// should have sent switchActiveTeam message to all 5 agents
		verify(mock_ws.send(deepEqual(JSON.stringify(
			{ action: "switchActiveTeam", team: turn.getTeam(), turn: turn.getRole() }
		)))).times(5);

		// should also have sent promptForClue to blue spy (currently just checking
		// that is was sent once)
		verify(mock_ws.send(deepEqual(JSON.stringify(
			{ action: "promptForClue" }
		)))).once();
	});
});