import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

/**
 * Scheduled job to monitor all open trades and automatically close them
 * when stop loss or take profit levels are hit.
 *
 * Runs every 5 seconds
 */
crons.interval(
  "monitor-trades",
  { seconds: 5 }, // Run every 5 seconds
  internal.tradeMonitoring.checkOpenTrades
);

export default crons;
