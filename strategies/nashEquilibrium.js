/**
 * Nash Equilibrium strategy implementation
 * Finds the Nash Equilibrium in a 2x2 payoff matrix
 * A Nash Equilibrium is a set of strategies where no player can benefit by unilaterally changing their strategy
 * 
 * For a 2x2 matrix, we check each cell to see if it's a Nash Equilibrium by:
 * 1. Checking if the row player can't improve by switching rows
 * 2. Checking if the column player can't improve by switching columns
 * 
 * @param {Array<Array<number>>} payoffs - The payoff matrix
 * @returns {number} The index of the chosen action
 */
function nashEquilibrium(payoffs) {
  // For a 2x2 matrix, we need to check all possible combinations
  const n = payoffs.length;
  const m = payoffs[0].length;
  
  // Find the best response for each player
  const bestResponses = [];
  
  // Check each cell
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      let isNash = true;
      
      // Check if row player can improve
      for (let k = 0; k < n; k++) {
        if (payoffs[k][j] > payoffs[i][j]) {
          isNash = false;
          break;
        }
      }
      
      // Check if column player can improve
      for (let k = 0; k < m; k++) {
        if (payoffs[i][k] > payoffs[i][j]) {
          isNash = false;
          break;
        }
      }
      
      if (isNash) {
        bestResponses.push(i);
      }
    }
  }
  
  // If multiple Nash Equilibria exist, choose the one with the highest payoff
  if (bestResponses.length > 0) {
    return bestResponses.reduce((best, current) => {
      const currentPayoff = Math.max(...payoffs[current]);
      const bestPayoff = Math.max(...payoffs[best]);
      return currentPayoff > bestPayoff ? current : best;
    });
  }
  
  // If no pure Nash Equilibrium exists, fall back to minimax
  return payoffs.map(p => Math.min(...p)).indexOf(Math.max(...payoffs.map(p => Math.min(...p))));
}

module.exports = nashEquilibrium; 