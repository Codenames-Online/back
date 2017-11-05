var checker = require('check-word');
var words = checker('en');

import { Card } from './Card'
import { Clue } from './Clue'
import { SPlayer } from './SPlayer'
import { SOperative } from './SOperative';
import { SSpymaster } from './SSpymaster';
import { SLoiterer } from './SLoiterer';
import { Team, Turn } from '../constants/Constants';
import { Game } from './Game'

export module RuleEnforcer {
  export function isValidName(name) { return name.length > 0; }
  
  export function isLegalClue(clue: Clue): boolean {
    return words.check(clue.word.toLocaleLowerCase());
  }

  export function isPlayerTurn(game: Game, player: SPlayer) {
    return game.currTeam === player.team && game.turn === player.role;
  }

  export function isPlayerSpy(game: Game, player: SPlayer): boolean {
    return Turn.spy === player.role;
  }

  export function isSelectableCard(game: Game, cardIndex: number): boolean {
    return !game.board.cards[cardIndex].revealed
  }

  export function canStartGame(sloitererRoster: [string[], string[]]) {
    let redTeam = sloitererRoster[1];
    let blueTeam = sloitererRoster[0];
    return blueTeam.length >= 2 && redTeam.length >= 2;
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
