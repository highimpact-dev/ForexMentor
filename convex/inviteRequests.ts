import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

// Invite request management functions - fixed query builder types

/**
 * Submit an invite request
 */
export const submitRequest = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    tradingExperience: v.union(
      v.literal("never"),
      v.literal("less_than_3_months"),
      v.literal("3_to_12_months"),
      v.literal("1_plus_years")
    ),
    primaryChallenge: v.union(
      v.literal("emotional_decisions"),
      v.literal("lack_of_discipline"),
      v.literal("no_accountability"),
      v.literal("information_overload")
    ),
    motivation: v.string(),
    canCommit: v.boolean(),
    referralSource: v.union(
      v.literal("social_media"),
      v.literal("friend"),
      v.literal("article"),
      v.literal("search"),
      v.literal("other")
    ),
    ipAddress: v.string(),
    userAgent: v.optional(v.string()),
  },
  returns: v.union(
    v.object({
      success: v.boolean(),
      requestId: v.id("inviteRequests"),
      status: v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("flagged")
      ),
      message: v.string(),
    }),
    v.object({
      success: v.boolean(),
      error: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();
    const ipAddress = args.ipAddress.trim();

    // Check if email already exists
    const existingRequest = await ctx.db
      .query("inviteRequests")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existingRequest) {
      return {
        success: false,
        error: "An invite request with this email already exists",
      };
    }

    // Check if IP is blocked
    const ipBlock = await ctx.db
      .query("securityBlocks")
      .withIndex("by_type_and_value", (q) =>
        q.eq("type", "ip").eq("value", ipAddress)
      )
      .first();

    if (ipBlock) {
      return {
        success: false,
        error: "Your request cannot be processed at this time",
      };
    }

    // Check if email is blocked
    const emailBlock = await ctx.db
      .query("securityBlocks")
      .withIndex("by_type_and_value", (q) =>
        q.eq("type", "email").eq("value", email)
      )
      .first();

    if (emailBlock) {
      return {
        success: false,
        error: "Your request cannot be processed at this time",
      };
    }

    // Check rate limit
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const recentRequests = await ctx.db
      .query("inviteRequests")
      .withIndex("by_ip_and_created", (q) => q.eq("ipAddress", ipAddress))
      .filter((q) => q.gte(q.field("createdAt"), oneDayAgo))
      .collect();

    const requestsLastHour = recentRequests.filter(
      (r) => r.createdAt >= oneHourAgo
    ).length;

    if (requestsLastHour >= 3) {
      return {
        success: false,
        error: "Too many requests. Please try again in an hour.",
      };
    }

    if (recentRequests.length >= 5) {
      return {
        success: false,
        error: "Too many requests. Please try again tomorrow.",
      };
    }

    // Determine initial status based on signals
    let status: "pending" | "approved" | "flagged" = "pending";

    // Auto-approve if good signals
    const hasGoodSignals =
      args.canCommit && // Willing to commit
      args.motivation.length >= 50 && // Decent motivation
      recentRequests.length === 0; // First request from this IP

    // Flag if suspicious
    const hasSuspiciousSignals =
      args.motivation.length < 30 || // Too short
      recentRequests.length >= 2 || // Multiple requests from same IP
      !args.canCommit; // Not willing to commit

    if (hasSuspiciousSignals) {
      status = "flagged";
    } else if (hasGoodSignals) {
      status = "approved";
    }

    // Create the request
    const requestId = await ctx.db.insert("inviteRequests", {
      email,
      name: args.name.trim(),
      tradingExperience: args.tradingExperience,
      primaryChallenge: args.primaryChallenge,
      motivation: args.motivation.trim(),
      canCommit: args.canCommit,
      referralSource: args.referralSource,
      ipAddress,
      userAgent: args.userAgent,
      status,
      createdAt: now,
    });

    // If auto-approved, generate invite code and send email
    if (status === "approved") {
      try {
        // Generate the invite code
        const { codeId, code } = await ctx.runMutation(internal.inviteCodes.createInviteCodeInternal, {
          requestId,
          maxUses: 5,
        });

        // Get the code details to send email - the expiresAt is 30 days from now
        const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;

        // Send email with invite code
        await ctx.scheduler.runAfter(0, internal.emails.sendInviteCodeEmail, {
          to: email,
          name: args.name.trim(),
          inviteCode: code,
          expiresAt,
        });
      } catch (error) {
        console.error("Error generating invite code or sending email:", error);
        // Don't fail the request, just log the error
      }
    } else {
      // Send confirmation email for pending/flagged requests
      await ctx.scheduler.runAfter(0, internal.emails.sendRequestReceivedEmail, {
        to: email,
        name: args.name.trim(),
        status,
      });
    }

    return {
      success: true,
      requestId,
      status,
      message:
        status === "approved"
          ? "Your request has been approved! Check your email for your invite code."
          : "Your request has been submitted and is under review. We'll email you soon!",
    };
  },
});

/**
 * Get all invite requests (admin only)
 */
export const getAllRequests = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected"),
        v.literal("flagged")
      )
    ),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("inviteRequests"),
      _creationTime: v.number(),
      email: v.string(),
      name: v.string(),
      tradingExperience: v.union(
        v.literal("never"),
        v.literal("less_than_3_months"),
        v.literal("3_to_12_months"),
        v.literal("1_plus_years")
      ),
      primaryChallenge: v.union(
        v.literal("emotional_decisions"),
        v.literal("lack_of_discipline"),
        v.literal("no_accountability"),
        v.literal("information_overload")
      ),
      motivation: v.string(),
      canCommit: v.boolean(),
      referralSource: v.union(
        v.literal("social_media"),
        v.literal("friend"),
        v.literal("article"),
        v.literal("search"),
        v.literal("other")
      ),
      ipAddress: v.string(),
      userAgent: v.optional(v.string()),
      status: v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected"),
        v.literal("flagged")
      ),
      reviewedBy: v.optional(v.string()),
      reviewedAt: v.optional(v.number()),
      adminNotes: v.optional(v.string()),
      inviteCodeId: v.optional(v.id("inviteCodes")),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Build the appropriate query based on status filter
    if (args.status) {
      const query = ctx.db
        .query("inviteRequests")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc");

      if (args.limit) {
        return await query.take(args.limit);
      }
      return await query.collect();
    } else {
      const query = ctx.db
        .query("inviteRequests")
        .withIndex("by_created")
        .order("desc");

      if (args.limit) {
        return await query.take(args.limit);
      }
      return await query.collect();
    }
  },
});

/**
 * Get a single invite request by ID (admin only)
 */
export const getRequestById = query({
  args: {
    requestId: v.id("inviteRequests"),
  },
  returns: v.union(
    v.object({
      _id: v.id("inviteRequests"),
      _creationTime: v.number(),
      email: v.string(),
      name: v.string(),
      tradingExperience: v.union(
        v.literal("never"),
        v.literal("less_than_3_months"),
        v.literal("3_to_12_months"),
        v.literal("1_plus_years")
      ),
      primaryChallenge: v.union(
        v.literal("emotional_decisions"),
        v.literal("lack_of_discipline"),
        v.literal("no_accountability"),
        v.literal("information_overload")
      ),
      motivation: v.string(),
      canCommit: v.boolean(),
      referralSource: v.union(
        v.literal("social_media"),
        v.literal("friend"),
        v.literal("article"),
        v.literal("search"),
        v.literal("other")
      ),
      ipAddress: v.string(),
      userAgent: v.optional(v.string()),
      status: v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected"),
        v.literal("flagged")
      ),
      reviewedBy: v.optional(v.string()),
      reviewedAt: v.optional(v.number()),
      adminNotes: v.optional(v.string()),
      inviteCodeId: v.optional(v.id("inviteCodes")),
      createdAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const request = await ctx.db.get(args.requestId);
    return request;
  },
});

/**
 * Approve an invite request and generate code (admin only)
 */
export const approveRequest = mutation({
  args: {
    requestId: v.id("inviteRequests"),
    adminNotes: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    inviteCodeId: v.id("inviteCodes"),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Request not found");
    }

    if (request.status === "approved") {
      throw new Error("Request is already approved");
    }

    // Update the status first
    await ctx.db.patch(args.requestId, {
      status: "approved",
      reviewedBy: identity.subject,
      reviewedAt: Date.now(),
      adminNotes: args.adminNotes,
    });

    // Generate invite code - use type assertion to avoid circular reference
    const codeResult = await ctx.runMutation(
      internal.inviteCodes.createInviteCodeInternal,
      {
        requestId: args.requestId,
        maxUses: 5,
        createdBy: identity.subject,
      }
    );
    const codeId = codeResult.codeId as Id<"inviteCodes">;
    const code = codeResult.code as string;

    // The expiresAt is 30 days from now
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;

    // Send email with invite code
    await ctx.scheduler.runAfter(0, internal.emails.sendInviteCodeEmail, {
      to: request.email,
      name: request.name,
      inviteCode: code,
      expiresAt,
    });

    return {
      success: true,
      inviteCodeId: codeId,
    };
  },
});

/**
 * Reject an invite request (admin only)
 */
export const rejectRequest = mutation({
  args: {
    requestId: v.id("inviteRequests"),
    adminNotes: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Request not found");
    }

    await ctx.db.patch(args.requestId, {
      status: "rejected",
      reviewedBy: identity.subject,
      reviewedAt: Date.now(),
      adminNotes: args.adminNotes,
    });

    // Send rejection email
    await ctx.scheduler.runAfter(0, internal.emails.sendRequestRejectedEmail, {
      to: request.email,
      name: request.name,
      reason: args.adminNotes,
    });

    return { success: true };
  },
});

/**
 * Get request statistics (admin only)
 */
export const getRequestStats = query({
  args: {},
  returns: v.object({
    total: v.number(),
    pending: v.number(),
    approved: v.number(),
    rejected: v.number(),
    flagged: v.number(),
  }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const allRequests = await ctx.db.query("inviteRequests").collect();

    return {
      total: allRequests.length,
      pending: allRequests.filter((r) => r.status === "pending").length,
      approved: allRequests.filter((r) => r.status === "approved").length,
      rejected: allRequests.filter((r) => r.status === "rejected").length,
      flagged: allRequests.filter((r) => r.status === "flagged").length,
    };
  },
});
