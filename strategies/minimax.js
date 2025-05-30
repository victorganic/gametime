/**
 * Minimax strategy implementation
 * Chooses the action that maximizes the minimum possible payoff
 * @param {Array<Array<number>>} payoffs - The payoff matrix
 * @returns {number} The index of the chosen action
 */
function minimax(payoffs) {
  return payoffs.map(p => Math.min(...p)).indexOf(Math.max(...payoffs.map(p => Math.min(...p))));
}

module.exports = minimax; 