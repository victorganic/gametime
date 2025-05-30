const readline = require('readline');
const {
  getAvailableGames,
  getGameTimeframes,
  getGameActions,
  getGameStrategies,
  makeDecision
} = require('./gameLogic');
const { exportToCSV, importFromCSV } = require('./utils/csvHandler');

// ===== GAME LIBRARY ===== //
const games = {
  // Game 1: Limit Food Delivery (weight/money savings)
  foodDelivery: {
    timeframes: {
      minute: { 
        actions: ["Order Now", "Delay 10min"], 
        payoffs: [[-3, -1], [1, 2]] // [Order][Outcome: Craving/No Craving]
      },
      day: { 
        actions: ["Order Takeout", "Cook Meal"], 
        payoffs: [[-5, -2], [3, 5]] // [Order][Outcome: Guilt/Pride]
      },
      month: { 
        actions: ["Subscribe to Service", "Cancel Subscriptions"], 
        payoffs: [[-30, -10], [50, 100]] // [Subscribe][Money Lost/Saved]
      }
    },
    strategies: {
      minimax: (payoffs) => payoffs.map(p => Math.min(...p)).indexOf(Math.max(...payoffs.map(p => Math.min(...p)))),
      titForTat: (history) => history[history.length - 1] === 0 ? 1 : 0 // Alternate if failed last time
    }
  },
  // Game 2: Productivity (example placeholder)
  productivity: {
    timeframes: {
      day: { 
        actions: ["Procrastinate", "Deep Work"], 
        payoffs: [[-2, 0], [1, 4]] 
      }
    },
    strategies: {
      minimax: (payoffs) => payoffs.map(p => Math.min(...p)).indexOf(Math.max(...payoffs.map(p => Math.min(...p)))),
      titForTat: (history) => history[history.length - 1] === 0 ? 1 : 0
    }
  }
};

// ===== REPL ENGINE ===== //
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
let state = { 
  history: [], // Track past decisions
  records: [], // Track detailed history with timestamps
  cumulativeScores: {}, // Track cumulative scores per game
  patterns: {}, // Track patterns of decisions
  streakCounts: {} // Track consecutive decisions
};

// Initialize state from imported data
function initializeStateFromRecords(records) {
  state.records = records;
  state.history = records.map(record => record.action);
  
  // Reset all tracking
  state.cumulativeScores = {};
  state.patterns = {};
  state.streakCounts = {};
  
  // Process records in chronological order
  records.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  records.forEach(record => {
    // Initialize game tracking if not exists
    if (!state.cumulativeScores[record.game]) {
      state.cumulativeScores[record.game] = 0;
      state.patterns[record.game] = {};
      state.streakCounts[record.game] = {};
    }
    
    // Update cumulative score
    state.cumulativeScores[record.game] += record.outcome;
    
    // Track patterns
    const key = `${record.timeframe}:${record.action}`;
    state.patterns[record.game][key] = (state.patterns[record.game][key] || 0) + 1;
    
    // Update streaks - reset if action changes
    if (!state.streakCounts[record.game][key]) {
      state.streakCounts[record.game][key] = 1;
    } else {
      // Only increment streak if it's the same action as the last record
      const lastRecord = records[records.indexOf(record) - 1];
      if (lastRecord && lastRecord.action === record.action && lastRecord.timeframe === record.timeframe) {
        state.streakCounts[record.game][key]++;
      } else {
        state.streakCounts[record.game][key] = 1;
      }
    }
  });
}

function displayWelcome() {
  console.log("\n=== Game Theory Life Decision Simulator ===");
  console.log("Life is not a game ... but you can act like it is.\n");
  
  console.log("Overview:");
  console.log("This tool helps you apply game theory principles to real-life decisions");
  console.log("across different timeframes (minute-to-minute up to month-to-month).\n");
  
  console.log("Key Features:");
  console.log("- Multi-Game Framework: Preconfigured scenarios with customizable payoffs");
  console.log("- Timeframe Flexibility: Model decisions from minute-to-minute to month-to-month");
  console.log("- Strategy Library: Includes Minimax, Tit-for-Tat, and Nash Equilibrium");
  console.log("- State Tracking: Maintains decision history for adaptive strategies");
  console.log("- Data Export: Save and load game history in CSV format\n");
  
  console.log("Available Strategies:");
  console.log("1. Minimax: Chooses the action that maximizes the minimum possible payoff");
  console.log("2. Tit-for-Tat: Alternates actions based on the last outcome");
  console.log("3. Nash Equilibrium: Finds the optimal strategy where no player can benefit by changing their choice\n");
  
  console.log("Nash Equilibrium Explained:");
  console.log("A Nash Equilibrium is a set of strategies where no player can benefit by");
  console.log("unilaterally changing their strategy, assuming other players maintain their strategies.");
  console.log("In our implementation:");
  console.log("- We check each possible outcome to find stable strategies");
  console.log("- If multiple equilibria exist, we choose the one with highest payoff");
  console.log("- If no pure equilibrium exists, we fall back to minimax strategy\n");
  
  console.log("How to Play:");
  console.log("1. Select a game (e.g., foodDelivery, productivity)");
  console.log("2. Choose a timeframe (e.g., minute, day, month)");
  console.log("3. Pick a strategy (e.g., minimax, titForTat, nashEquilibrium)");
  console.log("4. Review the decision and outcome");
  console.log("5. Continue or start a new game\n");
  
  console.log("Data Management:");
  console.log("- Type 'export' to save game history to CSV");
  console.log("- Type 'import' to load game history from CSV");
  console.log("- Type 'history' to view current game history\n");
}

async function handleExport() {
  try {
    const filename = 'game_history.csv';
    await exportToCSV(filename, state.records);
    console.log(`\nGame history exported to ${filename}`);
  } catch (error) {
    console.error('\nError exporting history:', error.message);
  }
  mainMenu();
}

async function handleImport() {
  try {
    const filename = 'sample_history.csv';
    const importedHistory = await importFromCSV(filename);
    initializeStateFromRecords(importedHistory);
    console.log(`\nImported ${importedHistory.length} records from ${filename}`);
    console.log("\nCurrent Statistics:");
    displayStatistics();
  } catch (error) {
    console.error('\nError importing history:', error.message);
  }
  mainMenu();
}

function displayHistory() {
  if (state.records.length === 0) {
    console.log('\nNo game history available.');
  } else {
    console.log('\nGame History:');
    state.records.forEach((record, index) => {
      console.log(`${index + 1}. Game: ${record.game}`);
      console.log(`   Timeframe: ${record.timeframe}`);
      console.log(`   Strategy: ${record.strategy}`);
      console.log(`   Action: ${record.action}`);
      console.log(`   Outcome: ${record.outcome}`);
      console.log(`   Time: ${record.timestamp}\n`);
    });
  }
  mainMenu();
}

function displayStatistics() {
  if (Object.keys(state.cumulativeScores).length === 0) {
    console.log("\nNo statistics available yet. Play some games or import history to see statistics.");
    return;
  }

  Object.entries(state.cumulativeScores).forEach(([game, score]) => {
    console.log(`\n=== ${game.toUpperCase()} STATISTICS ===`);
    console.log(`Cumulative Score: ${score}`);
    
    if (state.patterns[game] && Object.keys(state.patterns[game]).length > 0) {
      console.log("\nDecision Patterns:");
      Object.entries(state.patterns[game])
        .sort((a, b) => b[1] - a[1])
        .forEach(([key, count]) => {
          const [timeframe, action] = key.split(':');
          console.log(`  ${timeframe} - ${action}: ${count} times`);
        });
    }
    
    if (state.streakCounts[game] && Object.keys(state.streakCounts[game]).length > 0) {
      console.log("\nCurrent Streaks:");
      Object.entries(state.streakCounts[game])
        .sort((a, b) => b[1] - a[1])
        .forEach(([key, streak]) => {
          const [timeframe, action] = key.split(':');
          console.log(`  ${timeframe} - ${action}: ${streak} in a row`);
        });
    }

    // Add summary statistics
    const gameRecords = state.records.filter(record => record.game === game);
    if (gameRecords.length > 0) {
      const totalDecisions = gameRecords.length;
      const averageScore = score / totalDecisions;
      console.log(`\nSummary:`);
      console.log(`  Total Decisions: ${totalDecisions}`);
      console.log(`  Average Score: ${averageScore.toFixed(2)}`);
    }
  });
}

function displayStrategyInfo(strategyName) {
  console.log(`\n=== ${strategyName.toUpperCase()} STRATEGY ===`);
  
  switch(strategyName.toLowerCase()) {
    case 'minimax':
      console.log("\nHow it works:");
      console.log("1. For each possible action, identifies the worst possible outcome");
      console.log("2. Chooses the action with the best 'worst-case' scenario");
      console.log("3. Focuses on minimizing maximum possible loss");
      console.log("\nExample:");
      console.log("In the food delivery game (day timeframe):");
      console.log("- 'Order Takeout' has outcomes [-5, -2]");
      console.log("- 'Cook Meal' has outcomes [3, 5]");
      console.log("Minimax would choose 'Cook Meal' because its worst outcome (3) is better than 'Order Takeout's' worst outcome (-5)");
      break;
      
    case 'titfortat':
      console.log("\nHow it works:");
      console.log("1. Starts with a cooperative action");
      console.log("2. Repeats the opponent's last action in subsequent rounds");
      console.log("3. Adapts strategy based on previous outcomes");
      console.log("\nExample:");
      console.log("In the food delivery game:");
      console.log("- If last decision was 'Order Takeout' with a negative outcome");
      console.log("- Next decision would be 'Cook Meal' to try a different approach");
      console.log("- If 'Cook Meal' was successful, might stick with it");
      break;
      
    case 'nashequilibrium':
      console.log("\nHow it works:");
      console.log("1. Finds the optimal strategy where no player can benefit by changing their choice");
      console.log("2. Considers all possible outcomes and their probabilities");
      console.log("3. Chooses the most stable strategy");
      console.log("\nExample:");
      console.log("In the food delivery game (month timeframe):");
      console.log("- 'Subscribe to Service' has outcomes [-30, -10]");
      console.log("- 'Cancel Subscriptions' has outcomes [50, 100]");
      console.log("Nash Equilibrium would likely choose 'Cancel Subscriptions' as it dominates in both outcomes");
      break;
  }
}

function displayPayoffMatrix(gameName, timeframe) {
  const game = games[gameName];
  if (!game || !game.timeframes[timeframe]) {
    console.log("\nInvalid game or timeframe.");
    return;
  }

  const { actions, payoffs } = game.timeframes[timeframe];
  
  console.log(`\n=== PAYOFF MATRIX FOR ${gameName.toUpperCase()} (${timeframe}) ===`);
  console.log("\nActions and their possible outcomes:");
  
  actions.forEach((action, i) => {
    console.log(`\n${action}:`);
    console.log(`  Outcome 1: ${payoffs[i][0]}`);
    console.log(`  Outcome 2: ${payoffs[i][1]}`);
    console.log(`  Best case: ${Math.max(...payoffs[i])}`);
    console.log(`  Worst case: ${Math.min(...payoffs[i])}`);
  });
}

function runGame(gameName) {
  console.log(`\n=== ${gameName.toUpperCase()} ===`);

  const timeframes = getGameTimeframes(gameName);
  console.log("\nAvailable Timeframes:");
  timeframes.forEach((tf, index) => {
    console.log(`${index + 1}. ${tf}`);
  });

  rl.question("\nSelect timeframe (number): ", (timeframeIndex) => {
    const timeframe = timeframes[parseInt(timeframeIndex) - 1];
    if (!timeframe) {
      console.log("Invalid timeframe selection.");
      return runGame(gameName);
    }

    const actions = getGameActions(gameName, timeframe);
    console.log("\nPossible Actions in this Timeframe:");
    actions.forEach((action, index) => {
      console.log(`${index + 1}. ${action}`);
    });
    console.log("\nNote: The strategy you select will choose from these actions based on its decision-making rules.");

    // Display payoff matrix for current timeframe
    displayPayoffMatrix(gameName, timeframe);

    const strategies = getGameStrategies(gameName);
    console.log("\nAvailable Decision-Making Strategies:");
    strategies.forEach((strategy, index) => {
      console.log(`${index + 1}. ${strategy}`);
    });

    rl.question("\nSelect strategy (number) or 'i' for strategy info: ", (strategyInput) => {
      if (strategyInput.toLowerCase() === 'i') {
        strategies.forEach((strategy, index) => {
          displayStrategyInfo(strategy);
        });
        return runGame(gameName);
      }

      const strategyIndex = parseInt(strategyInput) - 1;
      const strategyName = strategies[strategyIndex];
      if (!strategyName) {
        console.log("Invalid strategy selection.");
        return runGame(gameName);
      }

      // Display info for selected strategy
      displayStrategyInfo(strategyName);

      console.log(`\nApplying ${strategyName} strategy to make decision...`);
      const result = makeDecision(gameName, timeframe, strategyName, state.history);
      
      if (!result) {
        console.log("Invalid strategy or game configuration.");
        return runGame(gameName);
      }

      state.history = result.history;
      state.records.push(result.record);
      
      // Update cumulative score
      state.cumulativeScores[gameName] = (state.cumulativeScores[gameName] || 0) + result.outcome;
      
      // Update patterns
      const key = `${timeframe}:${result.action}`;
      state.patterns[gameName] = state.patterns[gameName] || {};
      state.patterns[gameName][key] = (state.patterns[gameName][key] || 0) + 1;
      
      // Update streaks
      state.streakCounts[gameName] = state.streakCounts[gameName] || {};
      state.streakCounts[gameName][key] = (state.streakCounts[gameName][key] || 0) + 1;
      
      console.log(`\nStrategy's Decision: ${result.action}`);
      console.log(`Outcome Payoff: ${result.outcome}`);
      console.log(`Decision History: ${state.history.map(d => actions[d]).join(' → ')}`);
      console.log(`\nCurrent Statistics for ${gameName}:`);
      console.log(`Cumulative Score: ${state.cumulativeScores[gameName]}`);
      console.log(`Current Streak: ${state.streakCounts[gameName][key]} ${result.action} in a row\n`);

      rl.question("Another round? (y/n): ", (answer) => {
        if (answer.toLowerCase() === 'y') runGame(gameName);
        else mainMenu();
      });
    });
  });
}

// ===== MAIN MENU ===== //
function displayGameOptions() {
  const games = getAvailableGames();
  console.log("\nAvailable Games:");
  games.forEach((game, index) => {
    console.log(`${index + 1}. ${game}`);
  });
  console.log("\nOther Options:");
  console.log("e. Export history");
  console.log("i. Import history");
  console.log("h. View history");
  console.log("s. View statistics");
  console.log("x. Exit");
}

function mainMenu() {
  displayGameOptions();
  rl.question("\nEnter your choice (number or letter): ", async (input) => {
    const games = getAvailableGames();
    
    if (input === 'x') rl.close();
    else if (input === 'e') await handleExport();
    else if (input === 'i') await handleImport();
    else if (input === 'h') displayHistory();
    else if (input === 's') {
      displayStatistics();
      mainMenu();
    }
    else {
      const gameIndex = parseInt(input) - 1;
      if (gameIndex >= 0 && gameIndex < games.length) {
        runGame(games[gameIndex]);
      } else {
        console.log("Invalid option. Please try again.");
        mainMenu();
      }
    }
  });
}

// Start
displayWelcome();
mainMenu();