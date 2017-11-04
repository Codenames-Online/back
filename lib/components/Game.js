"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Board_1 = require("./Board");
const SLoiterer_1 = require("./SLoiterer");
class Game {
    constructor() {
        this.score = [];
        this.numGuesses = 0;
        // needs to change from being hardcoded
        this.players = [];
    }
}
exports.Game = Game;
// set the clue word and the initial number of guesses for operatives
// string, int ->
function initializeClue(word, num) {
    this.clue = word;
    this.numGuesses = num + 1;
}
// decrease number of guesses
// -> int
function decrementGuesses() {
    return this.numGuesses--;
}
// adds new loiterer to play class
// string ->
function registerPlayer(name) {
    let team = this.whichTeam();
    let newLoiterer = new SLoiterer_1.SLoiterer(name, team);
    this.players.append(newLoiterer);
}
// identify which team has fewer players
// -> Enum Team
function whichTeam() {
    if (this.getLengthOfTeam(Team.red) >= this.getLengthOfTeam(Team.blue)) {
        return Team.blue;
    }
    return Team.red;
}
// needs testing
// find length of team
// Enum Team -> int
function getLengthOfTeam(team) {
    let count = 0;
    for (var player in players) {
        if (player.team === team) {
            count++;
        }
    }
    return count;
}
function startGame() {
    this.board = new Board_1.Board();
    this.players = this.setPlayerRoles();
    this.startTeam = this.setStartTeam();
    this.turn = Turn.spy;
}
function setPlayerRoles() {
    for (let i = 0; i < players.length; i++) {
    }
}
set;
startTeam();
{
    this.startTeam = Math.round(Math.random()) ? Team.red : Team.blue;
}
// 
function updateScore(team) {
}
