const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getComputerChoice,
  getHumanChoice,
  playGame,
} = require("./game.js");

test("getComputerChoice maps the random number to rock, paper, or scissors", () => {
  assert.equal(getComputerChoice(() => 0), "rock");
  assert.equal(getComputerChoice(() => 0.34), "paper");
  assert.equal(getComputerChoice(() => 0.99), "scissors");
});

test("getHumanChoice normalizes capitalization", () => {
  assert.equal(getHumanChoice(() => "RoCk"), "rock");
});

test("getHumanChoice asks again after an invalid choice", () => {
  const answers = ["lizard", " PAPER "];
  const messages = [];

  const choice = getHumanChoice(() => answers.shift(), (message) => messages.push(message));

  assert.equal(choice, "paper");
  assert.deepEqual(messages, ["Please choose rock, paper, or scissors."]);
});

test("getHumanChoice reports when the player cancels", () => {
  assert.throws(() => getHumanChoice(() => null), /Game cancelled/);
});

test("playGame plays five rounds, tracks scores, and announces the human winner", () => {
  const humanChoices = ["rock", "paper", "scissors", "rock", "paper"];
  const computerChoices = ["scissors", "rock", "paper", "rock", "scissors"];
  const messages = [];

  const result = playGame({
    getHumanChoice: () => humanChoices.shift(),
    getComputerChoice: () => computerChoices.shift(),
    log: (message) => messages.push(message),
  });

  assert.deepEqual(result, { humanScore: 3, computerScore: 1 });
  assert.equal(messages.length, 6);
  assert.match(messages.at(-1), /You win the game! 3 to 1/);
});

test("playGame announces a computer win", () => {
  const messages = [];

  const result = playGame({
    getHumanChoice: () => "rock",
    getComputerChoice: () => "paper",
    log: (message) => messages.push(message),
  });

  assert.deepEqual(result, { humanScore: 0, computerScore: 5 });
  assert.match(messages.at(-1), /Computer wins the game! 5 to 0/);
});

test("playGame can announce a tied game", () => {
  const messages = [];

  const result = playGame({
    getHumanChoice: () => "scissors",
    getComputerChoice: () => "scissors",
    log: (message) => messages.push(message),
  });

  assert.deepEqual(result, { humanScore: 0, computerScore: 0 });
  assert.match(messages.at(-1), /The game is a tie! 0 to 0/);
});
