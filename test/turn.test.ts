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
});