const fs = require('fs').promises;
const path = require('path');
const { exportToCSV, importFromCSV } = require('../utils/csvHandler');

describe('CSV Handler', () => {
  const testFile = path.join(__dirname, 'test_history.csv');
  const sampleHistory = [
    {
      game: 'foodDelivery',
      timeframe: 'day',
      strategy: 'minimax',
      action: 'Cook Meal',
      outcome: 5,
      timestamp: '2024-03-20T10:00:00Z'
    },
    {
      game: 'productivity',
      timeframe: 'day',
      strategy: 'nashEquilibrium',
      action: 'Deep Work',
      outcome: 4,
      timestamp: '2024-03-20T11:00:00Z'
    }
  ];

  afterEach(async () => {
    try {
      await fs.unlink(testFile);
    } catch (error) {
      // Ignore error if file doesn't exist
    }
  });

  describe('exportToCSV', () => {
    it('should export history to CSV file', async () => {
      await exportToCSV(testFile, sampleHistory);
      const fileContent = await fs.readFile(testFile, 'utf-8');
      
      expect(fileContent).toContain('Game,Timeframe,Strategy,Action,Outcome,Timestamp');
      expect(fileContent).toContain('foodDelivery,day,minimax,Cook Meal,5,2024-03-20T10:00:00Z');
      expect(fileContent).toContain('productivity,day,nashEquilibrium,Deep Work,4,2024-03-20T11:00:00Z');
    });
  });

  describe('importFromCSV', () => {
    it('should import history from CSV file', async () => {
      // First export the sample history
      await exportToCSV(testFile, sampleHistory);
      
      // Then import it back
      const importedHistory = await importFromCSV(testFile);
      
      expect(importedHistory).toHaveLength(2);
      expect(importedHistory[0]).toEqual(sampleHistory[0]);
      expect(importedHistory[1]).toEqual(sampleHistory[1]);
    });

    it('should handle empty CSV file', async () => {
      await fs.writeFile(testFile, 'Game,Timeframe,Strategy,Action,Outcome,Timestamp\n');
      const importedHistory = await importFromCSV(testFile);
      expect(importedHistory).toHaveLength(0);
    });

    it('should throw error for non-existent file', async () => {
      await expect(importFromCSV('nonexistent.csv')).rejects.toThrow();
    });
  });
}); 