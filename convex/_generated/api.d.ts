/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as emails from "../emails.js";
import type * as forex from "../forex.js";
import type * as forexQueries from "../forexQueries.js";
import type * as indicators from "../indicators.js";
import type * as inviteCodes from "../inviteCodes.js";
import type * as inviteRequests from "../inviteRequests.js";
import type * as myFunctions from "../myFunctions.js";
import type * as security from "../security.js";
import type * as tradeHistory from "../tradeHistory.js";
import type * as tradeMonitoring from "../tradeMonitoring.js";
import type * as trades from "../trades.js";
import type * as userProfiles from "../userProfiles.js";
import type * as waitlist from "../waitlist.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  emails: typeof emails;
  forex: typeof forex;
  forexQueries: typeof forexQueries;
  indicators: typeof indicators;
  inviteCodes: typeof inviteCodes;
  inviteRequests: typeof inviteRequests;
  myFunctions: typeof myFunctions;
  security: typeof security;
  tradeHistory: typeof tradeHistory;
  tradeMonitoring: typeof tradeMonitoring;
  trades: typeof trades;
  userProfiles: typeof userProfiles;
  waitlist: typeof waitlist;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
