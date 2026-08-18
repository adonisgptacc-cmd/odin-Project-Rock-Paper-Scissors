const test = require("node:test");
const assert = require("node:assert/strict");

const {
  createGame,
  getComputerChoice,
  initializeGameUI,
  playRound,
} = require("./game.js");

function createFakeElement(choice = "") {
  const listeners = new Map();

  return {
    dataset: { choice },
    disabled: false,
    textContent: "",
    addEventListener(eventName, listener) {
      listeners.set(eventName, listener);
    },
    click() {
      listeners.get("click")?.();
    },
  };
}

function createFakeDocument() {
  const choiceButtons = ["rock", "paper", "scissors"].map(createFakeElement);
  const elements = {
    "#human-score": createFakeElement(),
    "#computer-score": createFakeElement(),
    "#round-result": createFakeElement(),
    "#game-result": createFakeElement(),
  };

  return {
    choiceButtons,
    elements,
    querySelector(selector) {
      return elements[selector] ?? null;
    },
    querySelectorAll(selector) {
      return selector === "[data-choice]" ? choiceButtons : [];
    },
  };
}

test("getComputerChoice maps random values to every valid choice", () => {
  assert.equal(getComputerChoice(() => 0), "rock");
  assert.equal(getComputerChoice(() => 0.34), "paper");
  assert.equal(getComputerChoice(() => 0.99), "scissors");
});

test("playRound accepts mixed-case human choices", () => {
  assert.deepEqual(playRound("RoCk", "scissors"), {
    winner: "human",
    message: "You win! Rock beats Scissors.",
  });
});

test("playRound reports a computer win and a tie", () => {
  assert.equal(playRound("rock", "paper").winner, "computer");
  assert.equal(playRound("paper", "paper").winner, "tie");
});

test("playRound rejects choices outside rock, paper, and scissors", () => {
  assert.throws(() => playRound("lizard", "rock"), /Invalid choice: lizard/);
});

test("createGame keeps a running score without a fixed round limit", () => {
  const game = createGame(() => "scissors");

  const firstRound = game.play("rock");
  const secondRound = game.play("rock");

  assert.deepEqual(firstRound, {
    humanScore: 1,
    computerScore: 0,
    isGameOver: false,
    roundMessage: "You win! Rock beats Scissors.",
    gameMessage: "First to 5 points wins.",
  });
  assert.equal(secondRound.humanScore, 2);
});

test("createGame ends when a player reaches five and ignores later plays", () => {
  const game = createGame(() => "scissors");

  let winningState;
  for (let round = 0; round < 5; round += 1) {
    winningState = game.play("rock");
  }

  const stateAfterAnotherPlay = game.play("paper");

  assert.equal(winningState.isGameOver, true);
  assert.equal(winningState.gameMessage, "You win the game 5 to 0!");
  assert.deepEqual(stateAfterAnotherPlay, winningState);
  assert.notStrictEqual(stateAfterAnotherPlay, winningState);
});

test("createGame protects its internal score from returned state mutation", () => {
  const game = createGame(() => "scissors");
  const returnedState = game.play("rock");

  returnedState.humanScore = 99;

  assert.equal(game.getState().humanScore, 1);
});

test("initializeGameUI renders the initial state", () => {
  const fakeDocument = createFakeDocument();
  initializeGameUI(fakeDocument, () => "scissors");

  assert.equal(fakeDocument.elements["#human-score"].textContent, "0");
  assert.equal(fakeDocument.elements["#computer-score"].textContent, "0");
  assert.equal(
    fakeDocument.elements["#round-result"].textContent,
    "Make your choice to begin.",
  );
  assert.equal(
    fakeDocument.elements["#game-result"].textContent,
    "First to 5 points wins.",
  );
});

test("initializeGameUI updates the result and score after a button click", () => {
  const fakeDocument = createFakeDocument();
  initializeGameUI(fakeDocument, () => "scissors");

  fakeDocument.choiceButtons[0].click();

  assert.equal(fakeDocument.elements["#human-score"].textContent, "1");
  assert.equal(fakeDocument.elements["#computer-score"].textContent, "0");
  assert.equal(
    fakeDocument.elements["#round-result"].textContent,
    "You win! Rock beats Scissors.",
  );
});

test("initializeGameUI announces the winner and disables choices at five points", () => {
  const fakeDocument = createFakeDocument();
  initializeGameUI(fakeDocument, () => "scissors");

  for (let round = 0; round < 5; round += 1) {
    fakeDocument.choiceButtons[0].click();
  }

  assert.equal(
    fakeDocument.elements["#game-result"].textContent,
    "You win the game 5 to 0!",
  );
  assert.ok(fakeDocument.choiceButtons.every((button) => button.disabled));
});

test("initializeGameUI announces when the computer reaches five points", () => {
  const fakeDocument = createFakeDocument();
  initializeGameUI(fakeDocument, () => "paper");

  for (let round = 0; round < 5; round += 1) {
    fakeDocument.choiceButtons[0].click();
  }

  assert.equal(fakeDocument.elements["#computer-score"].textContent, "5");
  assert.equal(
    fakeDocument.elements["#game-result"].textContent,
    "Computer wins the game 5 to 0.",
  );
});

test("initializeGameUI fails clearly when required markup is missing", () => {
  assert.throws(
    () => initializeGameUI({ querySelector: () => null, querySelectorAll: () => [] }),
    /required game elements/i,
  );
});
