const fs = require('fs').promises;
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

/**
 * Exports game history to a CSV file
 * @param {string} filename - The name of the file to export to
 * @param {Array<Object>} history - The game history to export
 * @returns {Promise<void>}
 */
async function exportToCSV(filename, history) {
  const records = history.map(record => ({
    game: record.game,
    timeframe: record.timeframe,
    strategy: record.strategy,
    action: record.action,
    outcome: record.outcome,
    timestamp: record.timestamp
  }));

  const csv = stringify(records, {
    header: true,
    columns: {
      game: 'Game',
      timeframe: 'Timeframe',
      strategy: 'Strategy',
      action: 'Action',
      outcome: 'Outcome',
      timestamp: 'Timestamp'
    }
  });

  await fs.writeFile(filename, csv);
}

/**
 * Imports game history from a CSV file
 * @param {string} filename - The name of the file to import from
 * @returns {Promise<Array<Object>>} The imported game history
 */
async function importFromCSV(filename) {
  const fileContent = await fs.readFile(filename, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  });

  return records.map(record => ({
    game: record.Game,
    timeframe: record.Timeframe,
    strategy: record.Strategy,
    action: record.Action,
    outcome: Number(record.Outcome),
    timestamp: record.Timestamp
  }));
}

module.exports = {
  exportToCSV,
  importFromCSV
}; 