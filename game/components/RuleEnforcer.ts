var checker = require('check-word');
var words = checker('en');

import { Clue } from './Clue'
import { SPlayer } from './SPlayer'
import { SOperative } from './SOperative';
import { SSpymaster } from './SSpymaster';
import { SLoiterer } from './SLoiterer';
import { Team, Turn } from '../constants/Constants';
import { Game } from './Game'

export module RuleEnforcer {
  export function isValidName(name) {
    return (name.length > 0)
  }
  
  export function isLegalClue(clue: Clue): boolean {
    return words.check(clue.word);
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

  export function canStartGame(roster) {
    let blueTeam = roster[0];
    let redTeam = roster[1];
    return (blueTeam.length >= 2 && redTeam.length >= 2);
  }

  export function canSubmitGuess(game) {
      let operatives = game.findOperatives().filter((op)=>{
        op.team === game.currTeam
      });
      let selectedCard = operatives[0].selectedCard;
      for (var op of operatives) {
        if (op.selectedCard !== selectedCard) {
          return [false, null]
        }
      }
      let guessIndex = game.board.cards.indexOf(selectedCard);
      return [true, guessIndex]
  }
}
