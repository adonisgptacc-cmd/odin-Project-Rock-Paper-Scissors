const CHOICES = ["rock", "paper", "scissors"];
const WINNING_MATCHUPS = {
  rock: "scissors",
  paper: "rock",
  scissors: "paper",
};
const WINNING_SCORE = 5;

function getComputerChoice(random = Math.random) {
  const choiceIndex = Math.floor(random() * CHOICES.length);
  return CHOICES[choiceIndex];
}

function normalizeChoice(choice) {
  const normalizedChoice = choice.trim().toLowerCase();

  if (!CHOICES.includes(normalizedChoice)) {
    throw new RangeError(`Invalid choice: ${choice}`);
  }

  return normalizedChoice;
}

function formatChoice(choice) {
  return choice[0].toUpperCase() + choice.slice(1);
}

function playRound(humanChoice, computerChoice) {
  const human = normalizeChoice(humanChoice);
  const computer = normalizeChoice(computerChoice);

  if (human === computer) {
    return {
      winner: "tie",
      message: `It's a tie! You both chose ${formatChoice(human)}.`,
    };
  }

  if (WINNING_MATCHUPS[human] === computer) {
    return {
      winner: "human",
      message: `You win! ${formatChoice(human)} beats ${formatChoice(computer)}.`,
    };
  }

  return {
    winner: "computer",
    message: `You lose! ${formatChoice(computer)} beats ${formatChoice(human)}.`,
  };
}

function getGameMessage(humanScore, computerScore) {
  if (humanScore === WINNING_SCORE) {
    return `You win the game ${humanScore} to ${computerScore}!`;
  }

  if (computerScore === WINNING_SCORE) {
    return `Computer wins the game ${computerScore} to ${humanScore}.`;
  }

  return `First to ${WINNING_SCORE} points wins.`;
}

function createGame(chooseComputer = getComputerChoice) {
  let state = {
    humanScore: 0,
    computerScore: 0,
    isGameOver: false,
    roundMessage: "Make your choice to begin.",
    gameMessage: `First to ${WINNING_SCORE} points wins.`,
  };

  function getState() {
    return { ...state };
  }

  function play(humanChoice) {
    if (state.isGameOver) {
      return getState();
    }

    const round = playRound(humanChoice, chooseComputer());
    const humanScore = state.humanScore + (round.winner === "human" ? 1 : 0);
    const computerScore = state.computerScore + (round.winner === "computer" ? 1 : 0);
    const isGameOver = humanScore === WINNING_SCORE || computerScore === WINNING_SCORE;

    state = {
      humanScore,
      computerScore,
      isGameOver,
      roundMessage: round.message,
      gameMessage: getGameMessage(humanScore, computerScore),
    };

    return getState();
  }

  return { getState, play };
}

function initializeGameUI(documentRoot, chooseComputer = getComputerChoice) {
  const choiceButtons = [...documentRoot.querySelectorAll("[data-choice]")];
  const humanScore = documentRoot.querySelector("#human-score");
  const computerScore = documentRoot.querySelector("#computer-score");
  const roundResult = documentRoot.querySelector("#round-result");
  const gameResult = documentRoot.querySelector("#game-result");

  if (
    choiceButtons.length !== CHOICES.length ||
    !humanScore ||
    !computerScore ||
    !roundResult ||
    !gameResult
  ) {
    throw new Error("The page is missing required game elements.");
  }

  const game = createGame(chooseComputer);

  function render(state) {
    humanScore.textContent = String(state.humanScore);
    computerScore.textContent = String(state.computerScore);
    roundResult.textContent = state.roundMessage;
    gameResult.textContent = state.gameMessage;

    choiceButtons.forEach((button) => {
      button.disabled = state.isGameOver;
    });
  }

  choiceButtons.forEach((button) => {
    button.addEventListener("click", () => {
      render(game.play(button.dataset.choice));
    });
  });

  render(game.getState());

  return game;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    createGame,
    getComputerChoice,
    initializeGameUI,
    playRound,
  };
}

if (typeof document !== "undefined") {
  initializeGameUI(document);
}
