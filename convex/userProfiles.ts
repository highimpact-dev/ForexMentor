import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// User profile and referral reward management

/**
 * Create or get user profile
 */
export const getOrCreateUserProfile = mutation({
  args: {
    userId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  returns: v.object({
    _id: v.id("userProfiles"),
    userId: v.string(),
    email: v.string(),
    name: v.string(),
    inviteCodeUsed: v.optional(v.string()),
    inviteCodeOwnerId: v.optional(v.string()),
    subscriptionTier: v.union(
      v.literal("free"),
      v.literal("premium"),
      v.literal("pro")
    ),
    bonusTradeAllowance: v.number(),
    totalTradesUsed: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  handler: async (ctx, args) => {
    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (existingProfile) {
      return existingProfile;
    }

    // Create new profile
    const now = Date.now();
    const profileId = await ctx.db.insert("userProfiles", {
      userId: args.userId,
      email: args.email,
      name: args.name,
      subscriptionTier: "free",
      bonusTradeAllowance: 0,
      totalTradesUsed: 0,
      createdAt: now,
      updatedAt: now,
    });

    const profile = await ctx.db.get(profileId);
    if (!profile) {
      throw new Error("Failed to create profile");
    }

    return profile;
  },
});

/**
 * Get user profile by user ID
 */
export const getUserProfile = query({
  args: {
    userId: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("userProfiles"),
      userId: v.string(),
      email: v.string(),
      name: v.string(),
      inviteCodeUsed: v.optional(v.string()),
      inviteCodeOwnerId: v.optional(v.string()),
      subscriptionTier: v.union(
        v.literal("free"),
        v.literal("premium"),
        v.literal("pro")
      ),
      bonusTradeAllowance: v.number(),
      totalTradesUsed: v.number(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    return profile || null;
  },
});

/**
 * Get referral statistics for a user
 */
export const getReferralStats = query({
  args: {
    userId: v.string(),
  },
  returns: v.object({
    totalReferrals: v.number(),
    totalBonusTrades: v.number(),
    pendingRewards: v.number(),
    referrals: v.array(
      v.object({
        referredUserEmail: v.string(),
        inviteCode: v.string(),
        rewardAmount: v.number(),
        createdAt: v.number(),
        isProcessed: v.boolean(),
      })
    ),
  }),
  handler: async (ctx, args) => {
    // Get all referral rewards for this user
    const rewards = await ctx.db
      .query("referralRewards")
      .withIndex("by_referrer", (q) => q.eq("referrerId", args.userId))
      .collect();

    const processedRewards = rewards.filter((r) => r.isProcessed);
    const pendingRewards = rewards.filter((r) => !r.isProcessed);

    const totalBonusTrades = processedRewards.reduce(
      (sum, r) => sum + r.rewardAmount,
      0
    );

    // Get user profiles for referred users to show their emails
    const referralDetails = await Promise.all(
      rewards.map(async (reward) => {
        const referredProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user_id", (q) => q.eq("userId", reward.referredUserId))
          .first();

        return {
          referredUserEmail: referredProfile?.email || "Unknown",
          inviteCode: reward.inviteCode,
          rewardAmount: reward.rewardAmount,
          createdAt: reward.createdAt,
          isProcessed: reward.isProcessed,
        };
      })
    );

    return {
      totalReferrals: rewards.length,
      totalBonusTrades,
      pendingRewards: pendingRewards.length,
      referrals: referralDetails,
    };
  },
});

/**
 * Process a referral reward (internal mutation)
 */
export const processReferralReward = internalMutation({
  args: {
    referrerId: v.string(),
    referredUserId: v.string(),
    inviteCodeId: v.id("inviteCodes"),
    inviteCode: v.string(),
    rewardAmount: v.number(),
  },
  returns: v.object({
    success: v.boolean(),
    rewardId: v.id("referralRewards"),
  }),
  handler: async (ctx, args) => {
    const now = Date.now();

    // Create referral reward record
    const rewardId = await ctx.db.insert("referralRewards", {
      referrerId: args.referrerId,
      referredUserId: args.referredUserId,
      inviteCodeId: args.inviteCodeId,
      inviteCode: args.inviteCode,
      rewardType: "bonus_trades",
      rewardAmount: args.rewardAmount,
      isProcessed: false,
      createdAt: now,
    });

    // Get referrer's profile
    const referrerProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", args.referrerId))
      .first();

    if (referrerProfile) {
      // Add bonus trades to their allowance
      await ctx.db.patch(referrerProfile._id, {
        bonusTradeAllowance:
          referrerProfile.bonusTradeAllowance + args.rewardAmount,
        updatedAt: now,
      });

      // Mark reward as processed
      await ctx.db.patch(rewardId, {
        isProcessed: true,
        processedAt: now,
      });
    }

    return {
      success: true,
      rewardId,
    };
  },
});

/**
 * Get invite code for the current user
 */
export const getMyInviteCode = query({
  args: {},
  returns: v.union(
    v.object({
      code: v.string(),
      usesRemaining: v.number(),
      totalReferrals: v.number(),
      expiresAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Find the invite request for this user's email
    const inviteRequest = await ctx.db
      .query("inviteRequests")
      .withIndex("by_email", (q) =>
        q.eq("email", identity.email?.toLowerCase() || "")
      )
      .first();

    if (!inviteRequest || !inviteRequest.inviteCodeId) {
      return null;
    }

    // Get the invite code
    const inviteCode = await ctx.db.get(inviteRequest.inviteCodeId);
    if (!inviteCode) {
      return null;
    }

    // Count how many people used this code
    const usage = await ctx.db
      .query("inviteCodeUsage")
      .withIndex("by_invite_code", (q) => q.eq("inviteCodeId", inviteCode._id))
      .collect();

    return {
      code: inviteCode.code,
      usesRemaining: inviteCode.maxUses - inviteCode.currentUses,
      totalReferrals: usage.length,
      expiresAt: inviteCode.expiresAt,
    };
  },
});
