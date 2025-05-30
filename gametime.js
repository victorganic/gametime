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
  records: []  // Track detailed history with timestamps
};

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
    state.records = importedHistory;
    state.history = importedHistory.map(record => record.action);
    console.log(`\nImported ${importedHistory.length} records from ${filename}`);
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

function runGame(gameName) {
  console.log(`\n=== ${gameName.toUpperCase()} ===`);

  rl.question(`Timeframe (${getGameTimeframes(gameName).join('/')}): `, (timeframe) => {
    const actions = getGameActions(gameName, timeframe);
    if (!actions.length) {
      console.log("Invalid timeframe.");
      return runGame(gameName);
    }

    console.log(`Actions: ${actions.map((a, i) => `\n${i}. ${a}`).join('')}`);

    rl.question(`Strategy (${getGameStrategies(gameName).join('/')}): `, (strategyName) => {
      const result = makeDecision(gameName, timeframe, strategyName, state.history);
      
      if (!result) {
        console.log("Invalid strategy or game configuration.");
        return runGame(gameName);
      }

      state.history = result.history;
      state.records.push(result.record);
      
      console.log(`\nDecision: ${result.action}`);
      console.log(`Outcome Payoff: ${result.outcome}`);
      console.log(`History: ${state.history.map(d => actions[d]).join(' → ')}\n`);

      rl.question("Another round? (y/n): ", (answer) => {
        if (answer.toLowerCase() === 'y') runGame(gameName);
        else mainMenu();
      });
    });
  });
}

// ===== MAIN MENU ===== //
function mainMenu() {
  rl.question(`\nChoose a game (${getAvailableGames().join('/')}), or type 'export', 'import', 'history', or 'exit': `, async (input) => {
    if (input === 'exit') rl.close();
    else if (input === 'export') await handleExport();
    else if (input === 'import') await handleImport();
    else if (input === 'history') displayHistory();
    else if (getAvailableGames().includes(input)) runGame(input);
    else {
      console.log("Invalid option. Try again.");
      mainMenu();
    }
  });
}

// Start
displayWelcome();
mainMenu();