/**
 * Tit-for-Tat strategy implementation
 * Alternates actions based on the last outcome
 * @param {Array<number>} history - The history of previous decisions
 * @returns {number} The index of the chosen action
 */
function titForTat(history) {
  return history[history.length - 1] === 0 ? 1 : 0;
}

module.exports = titForTat; 