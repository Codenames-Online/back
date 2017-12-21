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

		let red_l_one = new Loiterer("red", "1", mock_ws_instance, Team.red);
		let red_l_two = new Loiterer("red", "2", mock_ws_instance, Team.red);
		let blue_l_one = new Loiterer("blue", "1", mock_ws_instance, Team.blue);
		let blue_l_two = new Loiterer("blue", "2", mock_ws_instance, Team.blue);
		let blue_l_three = new Loiterer("blue", "3", mock_ws_instance, Team.blue);
		loiterers = [red_l_one, red_l_two, blue_l_one, blue_l_two, blue_l_three];

		let red_p_one = new Spymaster("red", "1", mock_ws_instance, Team.red);
		let red_p_two = new Operative("red", "2", mock_ws_instance, Team.red);
		let red_p_three = new Operative("red", "3", mock_ws_instance, Team.red);
		let blue_p_one = new Spymaster("blue", "1", mock_ws_instance, Team.blue);
		let blue_p_two = new Operative("blue", "2", mock_ws_instance, Team.blue);
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
	
	// TODO: update this to use get operatives utility function
	it("should correctly split operatives on team", () => {
		let ops: Teams<Operative> = gu.getOperatives(agents);
		expect(ops.red.length).to.equal(2);
		expect(ops.blue.length).to.equal(1);
	});
});
