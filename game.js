const CHOICES = ["rock", "paper", "scissors"];
const WINNING_MATCHUPS = {
  rock: "scissors",
  paper: "rock",
  scissors: "paper",
};
const TOTAL_ROUNDS = 5;

function getComputerChoice(random = Math.random) {
  const choiceIndex = Math.floor(random() * CHOICES.length);
  return CHOICES[choiceIndex];
}

function getHumanChoice(promptPlayer = globalThis.prompt, log = console.log) {
  if (typeof promptPlayer !== "function") {
    throw new Error("A prompt function is required to get the player's choice.");
  }

  while (true) {
    const input = promptPlayer("Choose rock, paper, or scissors:");

    if (input === null) {
      throw new Error("Game cancelled.");
    }

    const choice = input.trim().toLowerCase();

    if (CHOICES.includes(choice)) {
      return choice;
    }

    log("Please choose rock, paper, or scissors.");
  }
}

function formatChoice(choice) {
  return choice[0].toUpperCase() + choice.slice(1);
}

function playGame({
  getHumanChoice: chooseForHuman = getHumanChoice,
  getComputerChoice: chooseForComputer = getComputerChoice,
  log = console.log,
} = {}) {
  let humanScore = 0;
  let computerScore = 0;

  function playRound(humanChoice, computerChoice) {
    const normalizedHumanChoice = humanChoice.trim().toLowerCase();

    if (normalizedHumanChoice === computerChoice) {
      log(`It's a tie! You both chose ${formatChoice(computerChoice)}.`);
      return;
    }

    if (WINNING_MATCHUPS[normalizedHumanChoice] === computerChoice) {
      humanScore += 1;
      log(`You win! ${formatChoice(normalizedHumanChoice)} beats ${formatChoice(computerChoice)}.`);
      return;
    }

    computerScore += 1;
    log(`You lose! ${formatChoice(computerChoice)} beats ${formatChoice(normalizedHumanChoice)}.`);
  }

  for (let round = 0; round < TOTAL_ROUNDS; round += 1) {
    playRound(chooseForHuman(), chooseForComputer());
  }

  if (humanScore > computerScore) {
    log(`You win the game! ${humanScore} to ${computerScore}.`);
  } else if (computerScore > humanScore) {
    log(`Computer wins the game! ${computerScore} to ${humanScore}.`);
  } else {
    log(`The game is a tie! ${humanScore} to ${computerScore}.`);
  }

  return { humanScore, computerScore };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { getComputerChoice, getHumanChoice, playGame };
}

if (typeof window !== "undefined") {
  playGame();
}
