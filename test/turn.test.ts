import { Agent } from '../src/Agent';
import { GameTurn } from '../src/Turn';
import { Loiterer } from '../src/Loiterer';
import { Spymaster } from '../src/Spymaster';
import { Operative } from '../src/Operative';
import { Team, Turn } from '../src/constants/Constants';

import 'mocha';
import ws = require('ws');
import { expect } from 'chai';
import { mock, instance, when, verify } from 'ts-mockito';

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
			new (t[3] === Turn.op ? Spymaster : Operative)(t[0], t[1], ws_inst, t[2])
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

	it("should send expected messages to expected agents on advance from spy to op", () => {
		// state is red spy
		this.turn.advance(this.agents);

		// state is red op
		// should have sent switchTurn message to all 5 agents
		verify(mock_ws.send(
			{ action: "switchTurn", team: this.turn.getTeam(), turn: this.turn.getRole() }
		)).times(5);
	});
});