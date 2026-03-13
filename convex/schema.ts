import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  auditLog: defineTable({
    action: v.string(),
    details: v.string(),
    timestamp: v.number(),
    actor: v.string(),
  }).index("by_timestamp", ["timestamp"]),
});
