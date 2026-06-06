import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  links: defineTable({
    slug: v.string(),
    originalUrl: v.string(),
    clicks: v.number(),
    isExpired: v.boolean(),
    expiresAt: v.union(v.number(), v.null()),
    createdAt: v.number(),
    userId: v.string(),
  }).index("by_slug", ["slug"])
    .index("by_user", ["userId"]),

  clicks: defineTable({
    linkId: v.id("links"),
    slug: v.string(),
    timestamp: v.number(),
    referrer: v.string(),
    country: v.string(),
    device: v.string(),
    browser: v.string(),
  }).index("by_link", ["linkId"]),
});