const {
  games,
  getAvailableGames,
  getGameTimeframes,
  getGameActions,
  getGameStrategies,
  makeDecision
} = require('../gameLogic');

describe('Game Logic Functions', () => {
  describe('getAvailableGames', () => {
    it('should return an array of available games', () => {
      const availableGames = getAvailableGames();
      expect(Array.isArray(availableGames)).toBe(true);
      expect(availableGames).toContain('foodDelivery');
      expect(availableGames).toContain('productivity');
    });
  });

  describe('getGameTimeframes', () => {
    it('should return timeframes for a valid game', () => {
      const timeframes = getGameTimeframes('foodDelivery');
      expect(Array.isArray(timeframes)).toBe(true);
      expect(timeframes).toContain('minute');
      expect(timeframes).toContain('day');
      expect(timeframes).toContain('month');
    });

    it('should return empty array for invalid game', () => {
      const timeframes = getGameTimeframes('invalidGame');
      expect(Array.isArray(timeframes)).toBe(true);
      expect(timeframes).toHaveLength(0);
    });
  });

  describe('getGameActions', () => {
    it('should return actions for valid game and timeframe', () => {
      const actions = getGameActions('foodDelivery', 'day');
      expect(Array.isArray(actions)).toBe(true);
      expect(actions).toContain('Order Takeout');
      expect(actions).toContain('Cook Meal');
    });

    it('should return empty array for invalid timeframe', () => {
      const actions = getGameActions('foodDelivery', 'invalidTimeframe');
      expect(Array.isArray(actions)).toBe(true);
      expect(actions).toHaveLength(0);
    });
  });

  describe('getGameStrategies', () => {
    it('should return strategies for a valid game', () => {
      const strategies = getGameStrategies('foodDelivery');
      expect(Array.isArray(strategies)).toBe(true);
      expect(strategies).toContain('minimax');
      expect(strategies).toContain('titForTat');
    });

    it('should return empty array for invalid game', () => {
      const strategies = getGameStrategies('invalidGame');
      expect(Array.isArray(strategies)).toBe(true);
      expect(strategies).toHaveLength(0);
    });
  });

  describe('makeDecision', () => {
    it('should make a valid decision for valid inputs', () => {
      const result = makeDecision('foodDelivery', 'day', 'minimax', []);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('decision');
      expect(result).toHaveProperty('action');
      expect(result).toHaveProperty('outcome');
      expect(result).toHaveProperty('history');
      expect(Array.isArray(result.history)).toBe(true);
    });

    it('should return null for invalid game', () => {
      const result = makeDecision('invalidGame', 'day', 'minimax', []);
      expect(result).toBeNull();
    });

    it('should return null for invalid timeframe', () => {
      const result = makeDecision('foodDelivery', 'invalidTimeframe', 'minimax', []);
      expect(result).toBeNull();
    });

    it('should return null for invalid strategy', () => {
      const result = makeDecision('foodDelivery', 'day', 'invalidStrategy', []);
      expect(result).toBeNull();
    });

    it('should maintain history correctly', () => {
      const history = [0, 1];
      const result = makeDecision('foodDelivery', 'day', 'minimax', history);
      expect(result.history).toHaveLength(history.length + 1);
      expect(result.history.slice(0, -1)).toEqual(history);
    });
  });
}); 