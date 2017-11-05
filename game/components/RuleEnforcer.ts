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
    if (game.currTeam == player.team) {
      if (game.turn == player.role) {
        return true
      }
    }
    return false
  }

  export function isPlayerSpy(game, player) {
    if (Turn.spy === player.role) {
      return true
    }
    return false
  }

  export function isSelectableCard(game, cardIndex) {
    return !game.board.cards[cardIndex].revealed
  }

  export function canStartGame(roster) {
    var blueTeam = roster[0]
    var redTeam = roster[1]
    return (blueTeam.length > 2 && redTeam.length > 2)
  }

  export function canSubmitGuess(game) {

  }

}
