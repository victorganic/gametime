# **Game Theory Life Decision Simulator**
Life is not a game ... but you can act like it is.

## Overview
Here’s a **REPL (Read-Eval-Print Loop) script in JavaScript** that helps apply **game theory principles** to life tasks/goals across different timeframes (minute-to-minute up to month-to-month). It models tasks as "games" where you strategize against constraints (time, resources, opponents like procrastination).

---

A REPL-based JavaScript tool for applying game theory strategies to real-life decisions (e.g., habit formation, financial choices). Built for modular expansion and multi-timeframe analysis.

---

## **Key Features**
- **Multi-Game Framework**: Preconfigured scenarios (food delivery, productivity) with customizable payoff matrices.
- **Timeframe Flexibility**: Model decisions from minute-to-minute to month-to-month.
- **Strategy Library**: Includes Minimax, Tit-for-Tat, and Nash Equilibrium (placeholder).
- **State Tracking**: Persists decision history for adaptive strategies.

---

## **Quick Start**
1. **Run** (Node.js required):
   ```bash
   node life_game.js
   ```
2. **Follow REPL prompts**:
   - Select a game (e.g., `foodDelivery`).
   - Choose timeframe (e.g., `day`).
   - Pick a strategy (e.g., `titForTat`).
3. **Output**:
   ```
   Decision: Cook Meal
   Outcome Payoff: 5
   History: Order Takeout → Cook Meal
   ```

---

## **Architecture**
```text
.
├── games/               # Game definitions
│   ├── foodDelivery.js  # Payoffs/strategies for food ordering
│   └── productivity.js  # Placeholder for task management
├── strategies/          # Strategy implementations
│   ├── minimax.js       # Avoid worst-case outcomes
│   └── titForTat.js     # React to past decisions
└── life_game.js         # REPL core engine
```

### **Core Modules**
1. **Game Configs**:
   - Defined in `games/*.js` as objects with:
     - `timeframes`: Actions/payoffs per timeframe.
     - `strategies`: Functions mapping payoffs/history → decisions.
   - Example:
     ```javascript
     month: {
       actions: ["Subscribe", "Cancel"],
       payoffs: [[-30, -10], [50, 100]] // [Action][Outcome]
     }
     ```

2. **Strategies**:
   - Input: `(payoffs, history)` → Output: `decisionIndex`.
   - Defaults: `minimax`, `titForTat`, `nash`.

3. **REPL Engine**:
   - Maintains game state/history.
   - Handles user input loops.

---

## **Extension Guide**
### **1. Add a New Game**
1. Create `games/newGame.js`:
   ```javascript
   module.exports = {
     timeframes: {
       week: {
         actions: ["Skip Gym", "Work Out"],
         payoffs: [[-2, 0], [3, 5]] // [Action][Outcome: Regret/Pride]
       }
     },
     strategies: {
       momentum: (history) => history.filter(h => h === 1).length > 2 ? 1 : 0
     }
   };
   ```
2. Import in `life_game.js`:
   ```javascript
   const games = {
     ...require('./games/foodDelivery'),
     newGame: require('./games/newGame')
   };
   ```

### **2. Add a Strategy**
1. Add to `strategies/adaptive.js`:
   ```javascript
   // Example: "Win-Stay, Lose-Shift"
   module.exports = (payoffs, history) => {
     const lastOutcome = history.length ? payoffs[history[history.length - 1]][0] : 0;
     return lastOutcome > 0 ? history[history.length - 1] : 1 - history[history.length - 1];
   };
   ```
2. Inject into game configs:
   ```javascript
   strategies: {
     ...require('./strategies/adaptive'),
     custom: (payoffs) => payoffs[0][0] > 2 ? 0 : 1
   }
   ```

### **3. Visualize Outcomes**
Use `chart.js` to log history:
```javascript
const Chart = require('chart.js');
// In REPL engine:
new Chart(ctx, { data: { labels: state.history, datasets: [...] } });
```

---

## **Development Roadmap**
| Priority | Feature                          | Notes                          |
|----------|----------------------------------|--------------------------------|
| P0       | Real Nash Equilibrium solver     | Integrate `algebra.js`         |
| P1       | CSV import/export for history    | Enable data analysis           |
| P2       | GUI (Electron/Web)               | Replace REPL with visual UI    |
| P3       | LLM-generated payoff suggestions | e.g., "Based on your goals..." |

---

## **Contributor Notes**
- **For LLMs**: Focus on:
  - Expanding `games/` and `strategies/` directories.
  - Improving payoff realism (e.g., dynamic values from APIs).
  - Error handling in REPL loops.
- **Key Variables**:
  - `state.history`: Decision trail for adaptive strategies.
  - `payoffs[action][outcome]`: Row = action, column = stochastic outcome.

---

**License**: MIT  
**Maintainer**: Dr. Victor 

--- 
