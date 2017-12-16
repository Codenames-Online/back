import { Board } from '../src/Board';
import { Team, Color } from '../src/constants/Constants';

import 'mocha';
import { expect } from 'chai'

describe("Filename: board.test.ts:\n\nThe board", () => {
  it("should have expected number of colors with expected distribution", () => {
    let board = new Board(Team.blue);
    
    let num_red = board.colors.filter(n => n === Color.red).length;
    let num_blue = board.colors.filter(n => n === Color.blue).length;
    let num_neutral = board.colors.filter(n => n === Color.neutral).length;
    let num_assassins = board.colors.filter(n => n === Color.assassin).length;
    
    expect(board.colors.length).to.equal(25);
    expect(num_red).to.be.within(8, 9);
    expect(num_blue).to.be.within(8, 9);
    expect(num_neutral).to.equal(7);
    expect(num_assassins).to.equal(1);
  });

  it("should have expected number of cards", () => {
    let board = new Board(Team.red);
    expect(board.cards.length).to.equal(25);
  });
});
