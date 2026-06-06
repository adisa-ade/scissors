import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internalMutation } from './_generated/server';

export const getMyLinks = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db
      .query("links")
      .withIndex("by_user", q => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

export const createLink = mutation({
  args: {
    slug: v.string(),
    originalUrl: v.string(),
    expiresAt: v.union(v.number(), v.null()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('You must be signed in to create links.');
    }
    // rate limit all users to 50 links per day
    const oneDayAgo = Date.now() - 86400000;
    const recentLinks = await ctx.db
      .query('links')
      .withIndex('by_user', q => q.eq('userId', identity.subject))
      .filter(q => q.gte(q.field('createdAt'), oneDayAgo))
      .collect();

    if (recentLinks.length >= 50) {
      throw new Error('Daily limit reached. You can create up to 50 links per day.');
    }

    // check slug not taken
    const existing = await ctx.db
      .query("links")
      .withIndex("by_slug", q => q.eq("slug", args.slug))
      .first();
    if (existing) throw new Error("Slug already taken");

    return await ctx.db.insert("links", {
      slug: args.slug,
      originalUrl: args.originalUrl,
      clicks: 0,
      isExpired: false,
      expiresAt: args.expiresAt,
      createdAt: Date.now(),
      userId: identity.subject,
    });
  },
});

export const deleteLinks = mutation({
  args: { ids: v.array(v.id("links")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    for (const id of args.ids) {
      await ctx.db.delete(id);
    }
  },
});

export const expireLinks = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const links = await ctx.db.query('links').collect();
    for (const link of links) {
      if (!link.isExpired && link.expiresAt && link.expiresAt < now) {
        await ctx.db.patch(link._id, { isExpired: true });
      }
    }
  },
});

export const recordClick = mutation({
  args: {
    linkId: v.id("links"),
    slug: v.string(),
    referrer: v.string(),
    device: v.string(),
    browser: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("clicks", {
      linkId: args.linkId,
      slug: args.slug,
      timestamp: Date.now(),
      referrer: args.referrer,
      country: "NG",
      device: args.device,
      browser: args.browser,
    });
    const link = await ctx.db.get(args.linkId);
    if (link) {
      await ctx.db.patch(args.linkId, { clicks: link.clicks + 1 });
    }
  },
});

export const getClicksByUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const links = await ctx.db
      .query("links")
      .withIndex("by_user", q => q.eq("userId", identity.subject))
      .collect();
    const linkIds = new Set(links.map(l => l._id));
    const allClicks = await ctx.db.query("clicks").collect();
    return allClicks.filter(c => linkIds.has(c.linkId));
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("links")
      .withIndex("by_slug", q => q.eq("slug", args.slug))
      .first();
  },
});
