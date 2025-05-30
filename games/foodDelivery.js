/**
 * Food Delivery Game Configuration
 * 
 * This game models the decision-making process around food choices across different timeframes.
 * Each timeframe represents a different decision-making context with unique actions and outcomes.
 * 
 * Payoff Matrix Structure:
 * - Each action has two possible outcomes [worse, better]
 * - Negative numbers represent costs/regrets
 * - Positive numbers represent benefits/satisfaction
 * - Higher absolute values indicate stronger outcomes
 */
module.exports = {
  timeframes: {
    /**
     * Minute Timeframe: Impulse Control
     * Models the immediate decision to order food or wait
     * 
     * Actions:
     * - "Order Now": Impulse decision to order immediately
     * - "Delay 10min": Decision to wait and reconsider
     * 
     * Payoffs:
     * Order Now: [-3, -1]
     *   - -3: Strong regret (impulse purchase, unhealthy choice)
     *   - -1: Mild regret (convenient but expensive)
     * 
     * Delay 10min: [1, 2]
     *   - 1: Moderate satisfaction (made a better choice)
     *   - 2: High satisfaction (avoided impulse, saved money)
     */
    minute: { 
      actions: ["Order Now", "Delay 10min"], 
      payoffs: [[-3, -1], [1, 2]]
    },

    /**
     * Day Timeframe: Meal Planning
     * Models the daily decision between convenience and health/economics
     * 
     * Actions:
     * - "Order Takeout": Convenience-focused choice
     * - "Cook Meal": Health and economic choice
     * 
     * Payoffs:
     * Order Takeout: [-5, -2]
     *   - -5: Strong negative (expensive, unhealthy, guilt)
     *   - -2: Mild negative (convenient but costly)
     * 
     * Cook Meal: [3, 5]
     *   - 3: Moderate positive (healthy, economical)
     *   - 5: High positive (satisfying, healthy, saved money)
     */
    day: { 
      actions: ["Order Takeout", "Cook Meal"], 
      payoffs: [[-5, -2], [3, 5]]
    },

    /**
     * Month Timeframe: Subscription Management
     * Models the long-term decision about food delivery subscriptions
     * 
     * Actions:
     * - "Subscribe to Service": Commitment to regular delivery
     * - "Cancel Subscriptions": Decision to stop using services
     * 
     * Payoffs:
     * Subscribe: [-30, -10]
     *   - -30: Strong negative (wasted money, unused subscription)
     *   - -10: Mild negative (some value but overpriced)
     * 
     * Cancel: [50, 100]
     *   - 50: Strong positive (significant savings)
     *   - 100: Very strong positive (major lifestyle improvement)
     */
    month: { 
      actions: ["Subscribe to Service", "Cancel Subscriptions"], 
      payoffs: [[-30, -10], [50, 100]]
    }
  }
}; 