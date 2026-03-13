import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const logAction = mutation({
  args: {
    action: v.string(),
    details: v.string(),
    actor: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("auditLog", {
      action: args.action,
      details: args.details,
      timestamp: Date.now(),
      actor: args.actor,
    });
  },
});

export const getRecentLogs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("auditLog")
      .withIndex("by_timestamp")
      .order("desc")
      .take(50);
  },
});
