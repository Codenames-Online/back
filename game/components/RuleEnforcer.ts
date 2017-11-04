var checker = require('check-word');
var words = checker('en');

import { SOperative } from './SOperative';
import { SSpymaster } from './SSpymaster';
import { SLoiterer } from './SLoiterer';
import { Team, Turn } from '../constants/Constants';

export module RuleEnforcer {
  export function isLegalClue(clue) {
    return words.check(clue.word)
  }

  export function isPlayerTurn(game, player) {
    var turn = game.turn;
    if (game.currTeam == player.team) {
      if (turn == Turn.op && player.constructor.name == SOperative) {
        return true
      }
      if (turn == Turn.spy && player.constructor.name == SSpymaster) {
        return true
      }
    }
    return false
  }

  export function isSelectableCard(card) {
    return !card.revealed
  }

  export function canStartGame(game) {

  }

  export function canSubmitGuess(game) {

  }

}
