import { Card } from './Card';
import { Clue } from './Clue';
import { Teams } from './Teams';
import { Agent } from './Agent';
import { Loiterer } from './Loiterer';
import { Operative } from './Operative';
import { Spymaster } from './Spymaster';
import { GameUtility as gu } from './GameUtility';
import { Team, Turn } from './constants/Constants';

let words = require('check-word')('en');

export module RuleEnforcer {
  export function isValidName(name: string) { return /^[a-z_ ]+$/i.test(name); }
  
  export function isValidNumGuesses(guesses: number) {
    return 0 <= guesses && guesses <= 9;
  }

  export function isValidWord(word: string) {
    return words.check(word.toLocaleLowerCase());
  }

  export function isWordOnBoard(word: string, cards: Card[]): boolean {
    return cards.some(card => card.word.toLocaleLowerCase() === word.toLocaleLowerCase());
  }

  export function isLegalClue(clue: Clue, cards: Card[]): boolean {
    return isValidWord(clue.word) && isValidNumGuesses(clue.num) && !isWordOnBoard(clue.word, cards);
  }

  export function isAgentTurn(currTeam: Team, currTurn: Turn, agent: Agent): boolean {
    return currTeam === agent.team && currTurn === agent.role;
  }

  export function isAgentSpy(agent: Agent): boolean {
    return agent.role === Turn.spy;
  }

  export function isCardSelectable(cards: Card[], cardIndex: number): boolean {
    return !cards[cardIndex].revealed;
  }

  export function canStartGame(teams: Teams<Loiterer>): boolean {
    return teams.red.length >= 2 && teams.blue.length >= 2;
  }

  export function canSubmitGuess(ops: Operative[]): boolean {
    let selected: Card | undefined = ops[0].getSelected();

    // votes.length check and ops.every should be redundant but leaving in for now
    return selected !== undefined && selected.votes.length === ops.length &&
      ops.every(op => op.getSelected() === selected);
  }
}
