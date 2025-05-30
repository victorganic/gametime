const readline = require('readline');

// Game Theory Strategies
const strategies = {
  minimax: (payoffs) => Math.max(...payoffs.map(p => Math.min(...p))), // Avoid worst-case
  nash: (payoffs) => payoffs[0][0], // Simplest equilibrium (placeholder)
  titForTat: (history) => history.length ? history[history.length - 1] : 1, // Cooperate/defect based on past
};

// Task Payoff Matrix Example: [Your Effort][Outcome Quality]
const taskPayoffs = {
  'minute': [[1, 0], [3, 2]], // Low/High effort vs. success/failure
  'day': [[2, 1], [4, 3]],
  'week': [[3, 2], [6, 5]],
  'month': [[5, 3], [10, 8]],
};

// REPL Interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const prompt = `\nGame Theory Life Planner:\n
1. Minute-to-minute (urgent)
2. Day-to-day (routine)
3. Week-to-week (goals)
4. Month-to-month (long-term)
Choose timeframe (1-4) or "exit": `;

function evaluateDecision(timeframe, strategy, history = []) {
  const payoffs = taskPayoffs[timeframe];
  let decision;
  switch (strategy) {
    case 'minimax': decision = strategies.minimax(payoffs); break;
    case 'nash': decision = strategies.nash(payoffs); break;
    case 'titForTat': decision = strategies.titForTat(history); break;
    default: decision = 1; // Default to high effort
  }
  return { decision, payoff: payoffs[decision] };
}

function run() {
  rl.question(prompt, (input) => {
    if (input === 'exit') return rl.close();
    
    const timeframes = ['minute', 'day', 'week', 'month'];
    const timeframe = timeframes[parseInt(input) - 1];
    
    if (!timeframe) {
      console.log("Invalid input. Try 1-4.");
      return run();
    }

    rl.question(`Strategy (minimax/nash/titForTat): `, (strategy) => {
      const { decision, payoff } = evaluateDecision(timeframe, strategy);
      console.log(`\nDecision: ${decision ? 'High Effort' : 'Low Effort'}`);
      console.log(`Payoff: ${payoff}\n`);
      run();
    });
  });
}

run();