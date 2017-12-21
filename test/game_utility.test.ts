import { Agent } from '../src/Agent';
import { Player } from '../src/Player';
import { Loiterer } from '../src/Loiterer';
import { Spymaster } from '../src/Spymaster';
import { Operative } from '../src/Operative';
import { GameUtility as gu } from '../src/GameUtility';
import { Color, Team, Turn } from '../src/constants/Constants';

import 'mocha';
import { expect } from 'chai';
import WebSocket = require('ws')
import { mock, instance, when } from 'ts-mockito';
import { Teams } from '../src/Teams';

describe("Filename: game_utility.test.ts:\n\nGame Utility", () => {
	let mock_ws: WebSocket;
	let mock_ws_instance: WebSocket;
	let loiterers: Loiterer[];
	let agents: Agent[];

	before(() => {
		mock_ws = mock(WebSocket);
		mock_ws_instance = instance(mock_ws);

		let red_l_one = new Loiterer("1", "red_one", mock_ws_instance, Team.red);
		let red_l_two = new Loiterer("2", "red_two", mock_ws_instance, Team.red);
		let blue_l_one = new Loiterer("1", "blue_one", mock_ws_instance, Team.blue);
		let blue_l_two = new Loiterer("2", "blue_two", mock_ws_instance, Team.blue);
		let blue_l_three = new Loiterer("3", "blue_three", mock_ws_instance, Team.blue);
		loiterers = [red_l_one, red_l_two, blue_l_one, blue_l_two, blue_l_three];

		let red_p_one = new Spymaster("1", "red_spy", mock_ws_instance, Team.red);
		let red_p_two = new Operative("2", "red_op_one", mock_ws_instance, Team.red);
		let red_p_three = new Operative("3", "red_op_two", mock_ws_instance, Team.red);
		let blue_p_one = new Spymaster("1", "blue_spy", mock_ws_instance, Team.blue);
		let blue_p_two = new Operative("2", "blue_op_one", mock_ws_instance, Team.blue);
		agents = [red_p_one, red_p_two, red_p_three, blue_p_one, blue_p_two];
	});

  it("should correctly split loiterers on team", () => {
		let teams = gu.getTeams(loiterers);

		expect(teams.red.length).to.equal(2);
		expect(teams.blue.length).to.equal(3);
	});
	
  it("should correctly split players on team", () => {
		let teams = gu.getTeams(agents);

		expect(teams.red.length).to.equal(3);
		expect(teams.blue.length).to.equal(2);
	});
	
	it("should get correct number of names from loiterers", () => {
		let team_names = gu.getRoster(gu.getTeams(loiterers));
 
		expect(team_names[Team.red].length).to.equal(2);
		expect(team_names[Team.blue].length).to.equal(3);
	});
	
	it("should get correct number of names from players", () => {
		let team_names = gu.getRoster(gu.getTeams(agents));

		expect(team_names[Team.red].length).to.equal(3);
		expect(team_names[Team.blue].length).to.equal(2);
	});
	
	it("should correctly return other team", () => {
		expect(gu.getOtherTeam(Team.red)).to.equal(Team.blue);
		expect(gu.getOtherTeam(Team.blue)).to.equal(Team.red);
	});
	
	it("should correctly split operatives on team", () => {
		let ops: Teams<Operative> = gu.getOperatives(agents);
		expect(ops.red.length).to.equal(2);
		expect(ops.blue.length).to.equal(1);
	});

	it("should correctly split spymasters on team", () => {
		let spys: Teams<Spymaster> = gu.getSpymasters(agents);
		expect((spys.red.pop() as Spymaster).name).to.equal("red_spy");
		expect((spys.blue.pop() as Spymaster).name).to.equal("blue_spy");
	});
});
