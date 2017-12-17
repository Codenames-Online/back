var checker = require('check-word');
var words = checker('en');

import { Card } from './Card'
import { Clue } from './Clue'
import { SLoitererTeams } from './Teams'
import { SPlayer } from './SPlayer'
import { SOperative } from './SOperative';
import { SSpymaster } from './SSpymaster';
import { SLoiterer } from './SLoiterer';
import { Team, Turn } from './constants/Constants';
import { Game } from './Game'

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

  export function isPlayerTurn(currTeam: Team, currTurn: Turn, player: SPlayer) {
    return currTeam === player.team && currTurn === player.role;
  }

  export function isPlayerSpy(player: SPlayer): boolean {
    return player.role === Turn.spy;
  }

  export function isCardSelectable(cards: Card[], cardIndex: number): boolean {
    return !cards[cardIndex].revealed;
  }

  export function canStartGame(teams: SLoitererTeams) {
    return teams.red.length >= 2 && teams.blue.length >= 2;
  }

  export function canSubmitGuess(game: Game): [boolean, number | null] {
    let ops: SOperative[] = game.findOperatives().filter(op =>
      op.team === game.currTeam
    );
    let selectedCard: Card | undefined = ops[0].selected;
    if(typeof selectedCard === 'undefined') { return [false, null] };

    let canGuess = ops.every((op: SOperative) => op.selected === selectedCard);
    return [canGuess, canGuess ? game.board.cards.indexOf(selectedCard) : null];
  }
}
