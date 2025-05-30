// Import game configurations
const foodDelivery = require('./games/foodDelivery');
const productivity = require('./games/productivity');

// Import strategies
const minimax = require('./strategies/minimax');
const titForTat = require('./strategies/titForTat');
const nashEquilibrium = require('./strategies/nashEquilibrium');

// Game configurations with strategies
const games = {
  foodDelivery: {
    ...foodDelivery,
    strategies: {
      minimax,
      titForTat,
      nashEquilibrium
    }
  },
  productivity: {
    ...productivity,
    strategies: {
      minimax,
      titForTat,
      nashEquilibrium
    }
  }
};

// Core game logic functions
function getAvailableGames() {
  return Object.keys(games);
}

function getGameTimeframes(gameName) {
  return Object.keys(games[gameName]?.timeframes || {});
}

function getGameActions(gameName, timeframe) {
  return games[gameName]?.timeframes[timeframe]?.actions || [];
}

function getGameStrategies(gameName) {
  return Object.keys(games[gameName]?.strategies || {});
}

function makeDecision(gameName, timeframe, strategyName, history = []) {
  const game = games[gameName];
  if (!game || !game.timeframes[timeframe]) return null;

  const { actions, payoffs } = game.timeframes[timeframe];
  const strategy = game.strategies[strategyName];
  
  if (!strategy || !actions || !payoffs) return null;

  const decision = strategy(payoffs, history);
  const outcome = payoffs[decision][Math.floor(Math.random() * payoffs[decision].length)];

  const record = {
    game: gameName,
    timeframe,
    strategy: strategyName,
    action: actions[decision],
    outcome,
    timestamp: new Date().toISOString()
  };

  return {
    decision,
    action: actions[decision],
    outcome,
    history: [...history, decision],
    record
  };
}

module.exports = {
  games,
  getAvailableGames,
  getGameTimeframes,
  getGameActions,
  getGameStrategies,
  makeDecision
}; 