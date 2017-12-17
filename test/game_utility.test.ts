import { SPlayer } from '../src/SPlayer';
import { SLoiterer } from '../src/SLoiterer';
import { SSpymaster } from '../src/SSpymaster';
import { SOperative } from '../src/SOperative';
import { GameUtility as gu } from '../src/GameUtility';
import { Color, Team, Turn } from '../src/constants/Constants';

import 'mocha';
import { expect } from 'chai';
import WebSocket = require('ws')
import { mock, instance, when } from 'ts-mockito';
import { SPlayerTeams } from '../src/Teams';

describe("Filename: game_utility.test.ts:\n\nGame Utility", () => {
	let mock_ws: WebSocket;
	let mock_ws_instance: WebSocket;
	let loiterers: SLoiterer[];
	let players: SPlayer[];

	before(() => {
		mock_ws = mock(WebSocket);
		mock_ws_instance = instance(mock_ws);

		let red_l_one = new SLoiterer("red", "1", Team.red, mock_ws_instance);
		let red_l_two = new SLoiterer("red", "2", Team.red, mock_ws_instance);
		let blue_l_one = new SLoiterer("blue", "1", Team.blue, mock_ws_instance);
		let blue_l_two = new SLoiterer("blue", "2", Team.blue, mock_ws_instance);
		let blue_l_three = new SLoiterer("blue", "3", Team.blue, mock_ws_instance);
		loiterers = [red_l_one, red_l_two, blue_l_one, blue_l_two, blue_l_three];

		let red_p_one = new SSpymaster("red", "1", Team.red, mock_ws_instance, Turn.spy);
		let red_p_two = new SOperative("red", "2", Team.red, mock_ws_instance, Turn.op);
		let red_p_three = new SSpymaster("red", "3", Team.red, mock_ws_instance, Turn.op);
		let blue_p_one = new SOperative("blue", "1", Team.blue, mock_ws_instance, Turn.spy);
		let blue_p_two = new SOperative("blue", "2", Team.blue, mock_ws_instance, Turn.op);
		players = [red_p_one, red_p_two, red_p_three, blue_p_one, blue_p_two];
	});

  it("should correctly split loiterers on team", () => {
		let teams = gu.getSloitererTeams(loiterers);

		expect(teams.red.length).to.equal(2);
		expect(teams.blue.length).to.equal(3);
	});
	
  it("should correctly split players on team", () => {
		let teams = gu.getPlayerTeams(players);

		expect(teams.red.length).to.equal(3);
		expect(teams.blue.length).to.equal(2);
	});
	
	it("should get correct number of names from sloiterers", () => {
		let team_names = gu.getSloitererRoster(gu.getSloitererTeams(loiterers));
 
		expect(team_names[Team.red].length).to.equal(2);
		expect(team_names[Team.blue].length).to.equal(3);
	});
	
	it("should get correct number of names from splayers", () => {
		let team_names = gu.getPlayerRoster(gu.getPlayerTeams(players));

		expect(team_names[Team.red].length).to.equal(3);
		expect(team_names[Team.blue].length).to.equal(2);
	});
	
	it("should correctly return other team", () => {
		expect(gu.getOtherTeam(Team.red)).to.equal(Team.blue);
		expect(gu.getOtherTeam(Team.blue)).to.equal(Team.red);
  });
});
