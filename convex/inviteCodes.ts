import { mutation, query, action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Invite code generation and validation functions

// Referral reward configuration
const REFERRAL_BONUS_TRADES = 10; // Bonus trades per successful referral

/**
 * Generate a unique invite code
 */
function generateCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars[randomIndex];
  }
  return code;
}

/**
 * Internal mutation to create invite code (callable from other mutations)
 */
export const createInviteCodeInternal = internalMutation({
  args: {
    requestId: v.optional(v.id("inviteRequests")),
    maxUses: v.optional(v.number()),
    createdBy: v.optional(v.string()),
  },
  returns: v.object({
    codeId: v.id("inviteCodes"),
    code: v.string(),
  }),
  handler: async (ctx, args) => {
    // Generate unique code
    let code = generateCode();
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure code is unique
    while (attempts < maxAttempts) {
      const existing = await ctx.db
        .query("inviteCodes")
        .withIndex("by_code", (q) => q.eq("code", code))
        .first();

      if (!existing) break;
      code = generateCode();
      attempts++;
    }

    if (attempts === maxAttempts) {
      throw new Error("Failed to generate unique code");
    }

    // Create the code
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

    const codeId = await ctx.db.insert("inviteCodes", {
      code,
      maxUses: args.maxUses || 5,
      currentUses: 0,
      createdBy: args.createdBy,
      createdForRequestId: args.requestId,
      expiresAt,
      isActive: true,
      createdAt: Date.now(),
    });

    return { codeId, code };
  },
});

/**
 * Create a new invite code (admin only)
 */
export const createInviteCode = mutation({
  args: {
    requestId: v.optional(v.id("inviteRequests")),
    maxUses: v.optional(v.number()),
  },
  returns: v.object({
    codeId: v.id("inviteCodes"),
    code: v.string(),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    // Generate unique code
    let code = generateCode();
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure code is unique
    while (attempts < maxAttempts) {
      const existing = await ctx.db
        .query("inviteCodes")
        .withIndex("by_code", (q) => q.eq("code", code))
        .first();

      if (!existing) break;
      code = generateCode();
      attempts++;
    }

    if (attempts === maxAttempts) {
      throw new Error("Failed to generate unique code");
    }

    // Create the code
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

    const codeId = await ctx.db.insert("inviteCodes", {
      code,
      maxUses: args.maxUses || 5,
      currentUses: 0,
      createdBy: identity?.subject,
      createdForRequestId: args.requestId,
      expiresAt,
      isActive: true,
      createdAt: Date.now(),
    });

    // If this was for a request, update the request
    if (args.requestId) {
      await ctx.db.patch(args.requestId, {
        inviteCodeId: codeId,
        status: "approved",
        reviewedBy: identity?.subject,
        reviewedAt: Date.now(),
      });
    }

    return { codeId, code };
  },
});

/**
 * Validate an invite code
 */
export const validateCode = query({
  args: {
    code: v.string(),
  },
  returns: v.object({
    isValid: v.boolean(),
    reason: v.optional(v.string()),
    codeId: v.optional(v.id("inviteCodes")),
    usesRemaining: v.optional(v.number()),
  }),
  handler: async (ctx, args) => {
    const normalizedCode = args.code.toUpperCase().replace(/[-\s]/g, "");

    // Find the code
    const inviteCode = await ctx.db
      .query("inviteCodes")
      .withIndex("by_code", (q) => q.eq("code", normalizedCode))
      .first();

    if (!inviteCode) {
      return {
        isValid: false,
        reason: "Invalid invite code",
      };
    }

    // Check if expired
    if (Date.now() > inviteCode.expiresAt) {
      return {
        isValid: false,
        reason: "This invite code has expired",
      };
    }

    // Check if inactive
    if (!inviteCode.isActive) {
      return {
        isValid: false,
        reason: "This invite code is no longer active",
      };
    }

    // Check if all uses consumed
    if (inviteCode.currentUses >= inviteCode.maxUses) {
      return {
        isValid: false,
        reason: "This invite code has been fully used",
      };
    }

    return {
      isValid: true,
      codeId: inviteCode._id,
      usesRemaining: inviteCode.maxUses - inviteCode.currentUses,
    };
  },
});

/**
 * Use an invite code (called during sign-up)
 */
export const useInviteCode = mutation({
  args: {
    code: v.string(),
    userId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const normalizedCode = args.code.toUpperCase().replace(/[-\s]/g, "");

    // Find and validate the code
    const inviteCode = await ctx.db
      .query("inviteCodes")
      .withIndex("by_code", (q) => q.eq("code", normalizedCode))
      .first();

    if (!inviteCode) {
      return { success: false, error: "Invalid invite code" };
    }

    if (Date.now() > inviteCode.expiresAt) {
      return { success: false, error: "This invite code has expired" };
    }

    if (!inviteCode.isActive) {
      return { success: false, error: "This invite code is no longer active" };
    }

    if (inviteCode.currentUses >= inviteCode.maxUses) {
      return { success: false, error: "This invite code has been fully used" };
    }

    // Check if user already used this code
    const existingUsage = await ctx.db
      .query("inviteCodeUsage")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existingUsage) {
      return { success: false, error: "You have already used an invite code" };
    }

    // Find the owner of this invite code
    let referrerId: string | undefined;

    if (inviteCode.createdForRequestId) {
      // Code was created for a specific request - find that user
      const inviteRequest = await ctx.db.get(inviteCode.createdForRequestId);
      if (inviteRequest) {
        // Find the user profile by email
        const referrerProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_email", (q) =>
            q.eq("email", inviteRequest.email.toLowerCase())
          )
          .first();

        if (referrerProfile) {
          referrerId = referrerProfile.userId;
        }
      }
    }

    const now = Date.now();

    // Record the usage
    await ctx.db.insert("inviteCodeUsage", {
      inviteCodeId: inviteCode._id,
      code: normalizedCode,
      userId: args.userId,
      email: args.email.toLowerCase(),
      usedAt: now,
    });

    // Increment usage count
    await ctx.db.patch(inviteCode._id, {
      currentUses: inviteCode.currentUses + 1,
    });

    // Create user profile for the new user
    const userProfile = await ctx.db.insert("userProfiles", {
      userId: args.userId,
      email: args.email.toLowerCase(),
      name: args.name,
      inviteCodeUsed: normalizedCode,
      inviteCodeOwnerId: referrerId,
      subscriptionTier: "free",
      bonusTradeAllowance: 0,
      totalTradesUsed: 0,
      createdAt: now,
      updatedAt: now,
    });

    // If there's a referrer, process the referral reward
    if (referrerId) {
      try {
        await ctx.runMutation(internal.userProfiles.processReferralReward, {
          referrerId,
          referredUserId: args.userId,
          inviteCodeId: inviteCode._id,
          inviteCode: normalizedCode,
          rewardAmount: REFERRAL_BONUS_TRADES,
        });
      } catch (error) {
        console.error("Error processing referral reward:", error);
        // Don't fail the signup, just log the error
      }
    }

    return { success: true };
  },
});

/**
 * Get all invite codes (admin only)
 */
export const getAllCodes = query({
  args: {
    includeInactive: v.optional(v.boolean()),
  },
  returns: v.array(
    v.object({
      _id: v.id("inviteCodes"),
      _creationTime: v.number(),
      code: v.string(),
      maxUses: v.number(),
      currentUses: v.number(),
      createdBy: v.optional(v.string()),
      createdForRequestId: v.optional(v.id("inviteRequests")),
      expiresAt: v.number(),
      isActive: v.boolean(),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    let codes = await ctx.db.query("inviteCodes").collect();

    if (!args.includeInactive) {
      codes = codes.filter((c) => c.isActive);
    }

    return codes.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * Get code usage details (admin only)
 */
export const getCodeUsage = query({
  args: {
    codeId: v.id("inviteCodes"),
  },
  returns: v.array(
    v.object({
      _id: v.id("inviteCodeUsage"),
      _creationTime: v.number(),
      inviteCodeId: v.id("inviteCodes"),
      code: v.string(),
      userId: v.string(),
      email: v.string(),
      usedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const usage = await ctx.db
      .query("inviteCodeUsage")
      .withIndex("by_invite_code", (q) => q.eq("inviteCodeId", args.codeId))
      .collect();

    return usage;
  },
});

/**
 * Deactivate an invite code (admin only)
 */
export const deactivateCode = mutation({
  args: {
    codeId: v.id("inviteCodes"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.codeId, {
      isActive: false,
    });

    return null;
  },
});

/**
 * Reactivate an invite code (admin only)
 */
export const reactivateCode = mutation({
  args: {
    codeId: v.id("inviteCodes"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const code = await ctx.db.get(args.codeId);
    if (!code) {
      throw new Error("Code not found");
    }

    // Don't reactivate if expired
    if (Date.now() > code.expiresAt) {
      throw new Error("Cannot reactivate expired code");
    }

    await ctx.db.patch(args.codeId, {
      isActive: true,
    });

    return null;
  },
});

/**
 * Get invite code statistics (admin only)
 */
export const getCodeStats = query({
  args: {},
  returns: v.object({
    totalCodes: v.number(),
    activeCodes: v.number(),
    totalUses: v.number(),
    availableUses: v.number(),
  }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const allCodes = await ctx.db.query("inviteCodes").collect();
    const activeCodes = allCodes.filter(
      (c) => c.isActive && Date.now() <= c.expiresAt
    );

    const totalUses = allCodes.reduce((sum, code) => sum + code.currentUses, 0);
    const availableUses = activeCodes.reduce(
      (sum, code) => sum + (code.maxUses - code.currentUses),
      0
    );

    return {
      totalCodes: allCodes.length,
      activeCodes: activeCodes.length,
      totalUses,
      availableUses,
    };
  },
});

/**
 * Bulk create invite codes (admin only)
 */
export const bulkCreateCodes = mutation({
  args: {
    count: v.number(),
    maxUses: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      codeId: v.id("inviteCodes"),
      code: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    if (args.count > 100) {
      throw new Error("Cannot create more than 100 codes at once");
    }

    const codes: Array<{ codeId: Id<"inviteCodes">; code: string }> = [];
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;

    for (let i = 0; i < args.count; i++) {
      let code = generateCode();
      let attempts = 0;

      while (attempts < 10) {
        const existing = await ctx.db
          .query("inviteCodes")
          .withIndex("by_code", (q) => q.eq("code", code))
          .first();

        if (!existing) break;
        code = generateCode();
        attempts++;
      }

      const codeId = await ctx.db.insert("inviteCodes", {
        code,
        maxUses: args.maxUses || 5,
        currentUses: 0,
        createdBy: identity.subject,
        expiresAt,
        isActive: true,
        createdAt: Date.now(),
      });

      codes.push({ codeId, code });
    }

    return codes;
  },
});
