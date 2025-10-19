import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const joinWaitlist = mutation({
  args: {
    email: v.string(),
    name: v.string(),
  },
  returns: v.id("waitlist"),
  handler: async (ctx, args) => {
    // Check if email already exists
    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existing) {
      // Return existing ID if already on waitlist
      return existing._id;
    }

    // Add new entry to waitlist
    const waitlistId = await ctx.db.insert("waitlist", {
      email: args.email,
      name: args.name,
      joinedAt: Date.now(),
    });

    return waitlistId;
  },
});

export const getWaitlistCount = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const waitlist = await ctx.db.query("waitlist").collect();
    return waitlist.length;
  },
});

export const getAllWaitlistEntries = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("waitlist"),
      _creationTime: v.number(),
      email: v.string(),
      name: v.string(),
      joinedAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    const waitlist = await ctx.db.query("waitlist").collect();
    return waitlist;
  },
});
