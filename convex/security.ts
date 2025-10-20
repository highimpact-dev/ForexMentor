import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Security functions for invite system - queries do not delete

/**
 * Check if an IP address is blocked
 */
export const isIpBlocked = query({
  args: {
    ipAddress: v.string(),
  },
  returns: v.object({
    isBlocked: v.boolean(),
    reason: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const block = await ctx.db
      .query("securityBlocks")
      .withIndex("by_type_and_value", (q) =>
        q.eq("type", "ip").eq("value", args.ipAddress)
      )
      .first();

    if (!block) {
      return { isBlocked: false };
    }

    // Check if block has expired
    if (
      !block.isPermanent &&
      block.expiresAt &&
      block.expiresAt < Date.now()
    ) {
      // Block has expired - return false (we'll clean it up separately)
      return { isBlocked: false };
    }

    return { isBlocked: true, reason: block.reason };
  },
});

/**
 * Check if an email is blocked
 */
export const isEmailBlocked = query({
  args: {
    email: v.string(),
  },
  returns: v.object({
    isBlocked: v.boolean(),
    reason: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const block = await ctx.db
      .query("securityBlocks")
      .withIndex("by_type_and_value", (q) =>
        q.eq("type", "email").eq("value", args.email.toLowerCase())
      )
      .first();

    if (!block) {
      return { isBlocked: false };
    }

    // Check if block has expired
    if (
      !block.isPermanent &&
      block.expiresAt &&
      block.expiresAt < Date.now()
    ) {
      // Block has expired - return false (we'll clean it up separately)
      return { isBlocked: false };
    }

    return { isBlocked: true, reason: block.reason };
  },
});

/**
 * Check rate limit for IP address
 * Returns the number of requests in the last hour and day
 */
export const checkRateLimit = query({
  args: {
    ipAddress: v.string(),
  },
  returns: v.object({
    requestsLastHour: v.number(),
    requestsLastDay: v.number(),
    isLimited: v.boolean(),
    reason: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    // Get all requests from this IP in the last day
    const requests = await ctx.db
      .query("inviteRequests")
      .withIndex("by_ip_and_created", (q) =>
        q.eq("ipAddress", args.ipAddress)
      )
      .filter((q) => q.gte(q.field("createdAt"), oneDayAgo))
      .collect();

    const requestsLastHour = requests.filter(
      (r) => r.createdAt >= oneHourAgo
    ).length;
    const requestsLastDay = requests.length;

    // Rate limits: 3 per hour, 5 per day
    let isLimited = false;
    let reason: string | undefined;

    if (requestsLastHour >= 3) {
      isLimited = true;
      reason = "Too many requests in the last hour. Please try again later.";
    } else if (requestsLastDay >= 5) {
      isLimited = true;
      reason = "Too many requests in the last 24 hours. Please try again tomorrow.";
    }

    return {
      requestsLastHour,
      requestsLastDay,
      isLimited,
      reason,
    };
  },
});

/**
 * Check for duplicate/suspicious requests from same IP
 */
export const checkForDuplicates = query({
  args: {
    ipAddress: v.string(),
    email: v.string(),
  },
  returns: v.object({
    isDuplicate: v.boolean(),
    suspiciousScore: v.number(), // 0-100
    reason: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    // Check for existing request with same email
    const emailMatch = await ctx.db
      .query("inviteRequests")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (emailMatch) {
      return {
        isDuplicate: true,
        suspiciousScore: 100,
        reason: "An invite request with this email already exists",
      };
    }

    // Get recent requests from same IP
    const ipRequests = await ctx.db
      .query("inviteRequests")
      .withIndex("by_ip_and_created", (q) =>
        q.eq("ipAddress", args.ipAddress)
      )
      .filter((q) => q.gte(q.field("createdAt"), sevenDaysAgo))
      .collect();

    if (ipRequests.length === 0) {
      return { isDuplicate: false, suspiciousScore: 0 };
    }

    // Calculate suspicion score based on:
    // - Multiple requests from same IP
    // - Different emails from same IP
    let suspiciousScore = 0;

    if (ipRequests.length >= 3) {
      suspiciousScore += 50;
    } else if (ipRequests.length >= 2) {
      suspiciousScore += 25;
    }

    // Check for different emails from same IP
    const uniqueEmails = new Set(ipRequests.map((r) => r.email));
    if (uniqueEmails.size >= 3) {
      suspiciousScore += 40;
    } else if (uniqueEmails.size >= 2) {
      suspiciousScore += 20;
    }

    const isDuplicate = suspiciousScore >= 60;

    return {
      isDuplicate,
      suspiciousScore,
      reason: isDuplicate
        ? "Multiple requests detected from this location"
        : undefined,
    };
  },
});

/**
 * Block an IP address (admin only)
 */
export const blockIp = mutation({
  args: {
    ipAddress: v.string(),
    reason: v.string(),
    isPermanent: v.boolean(),
    durationDays: v.optional(v.number()),
  },
  returns: v.id("securityBlocks"),
  handler: async (ctx, args) => {
    // TODO: Add admin authentication check
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const expiresAt = args.isPermanent
      ? undefined
      : Date.now() + (args.durationDays || 30) * 24 * 60 * 60 * 1000;

    const blockId = await ctx.db.insert("securityBlocks", {
      type: "ip",
      value: args.ipAddress,
      reason: args.reason,
      blockedBy: identity.subject,
      expiresAt,
      isPermanent: args.isPermanent,
      createdAt: Date.now(),
    });

    return blockId;
  },
});

/**
 * Block an email address (admin only)
 */
export const blockEmail = mutation({
  args: {
    email: v.string(),
    reason: v.string(),
    isPermanent: v.boolean(),
    durationDays: v.optional(v.number()),
  },
  returns: v.id("securityBlocks"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const expiresAt = args.isPermanent
      ? undefined
      : Date.now() + (args.durationDays || 30) * 24 * 60 * 60 * 1000;

    const blockId = await ctx.db.insert("securityBlocks", {
      type: "email",
      value: args.email.toLowerCase(),
      reason: args.reason,
      blockedBy: identity.subject,
      expiresAt,
      isPermanent: args.isPermanent,
      createdAt: Date.now(),
    });

    return blockId;
  },
});

/**
 * Unblock an IP or email (admin only)
 */
export const unblock = mutation({
  args: {
    blockId: v.id("securityBlocks"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.blockId);
    return null;
  },
});

/**
 * Get all active blocks (admin only)
 */
export const getAllBlocks = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("securityBlocks"),
      _creationTime: v.number(),
      type: v.union(v.literal("ip"), v.literal("email")),
      value: v.string(),
      reason: v.string(),
      blockedBy: v.optional(v.string()),
      expiresAt: v.optional(v.number()),
      isPermanent: v.boolean(),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const blocks = await ctx.db.query("securityBlocks").collect();
    return blocks;
  },
});
