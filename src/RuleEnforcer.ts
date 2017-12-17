var checker = require('check-word');
var words = checker('en');

import { Card } from './Card'
import { Clue } from './Clue'
import { SLoitererTeams } from './Teams'
import { Player } from './Player'
import { Operative } from './Operative';
import { Spymaster } from './Spymaster';
import { Loiterer } from './Loiterer';
import { Team, Turn } from './constants/Constants';
import { GameUtility as gu } from './GameUtility'


export module RuleEnforcer {
  export function isValidName(name: string) { return /^[a-z_ ]+$/i.test(name); }
  
  export function isValidNumGuesses(guesses: number) {
    return guesses >= 0 && guesses <= 9;
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

  export function isPlayerTurn(currTeam: Team, currTurn: Turn, player: Player): boolean {
    return currTeam === player.team && currTurn === player.role;
  }

  export function isPlayerSpy(player: Player): boolean {
    return player.role === Turn.spy;
  }

  export function isCardSelectable(cards: Card[], cardIndex: number): boolean {
    return !cards[cardIndex].revealed;
  }

  export function canStartGame(teams: SLoitererTeams): boolean {
    return teams.red.length >= 2 && teams.blue.length >= 2;
  }

  export function canSubmitGuess(allOps: Operative[], team: Team): boolean {
    let ops: Operative[] = gu.getTeamOps(allOps, team);
    let selected: Card | undefined = ops[0].getSelected();

    // votes.length check and ops.every should be redundant but leaving in for now
    return selected !== undefined && selected.votes.length === ops.length &&
      ops.every(op => op.getSelected() === selected);
  }
}
