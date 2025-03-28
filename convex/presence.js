import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Table schema definition for presence
export const presenceTable = {
  room: v.string(),
  user: v.string(),
  data: v.any(),
  updated: v.number(),
  created: v.number(),
};

// Get all presence data for a specific room
export const getPresence = query({
  args: { room: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("presence")
      .filter((q) => q.eq(q.field("room"), args.room))
      .collect();
  },
});

// Update a user's presence data in a room
export const updatePresence = mutation({
  args: {
    room: v.string(),
    user: v.string(),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const { room, user, data } = args;
    const now = Date.now();
    
    // Try to find the existing presence record
    const existingPresence = await ctx.db
      .query("presence")
      .filter((q) => 
        q.and(
          q.eq(q.field("room"), room),
          q.eq(q.field("user"), user)
        )
      )
      .first();
    
    if (existingPresence) {
      // Update existing record
      await ctx.db.patch(existingPresence._id, {
        data: { ...existingPresence.data, ...data },
        updated: now,
      });
      return existingPresence._id;
    } else {
      // Create new record
      return await ctx.db.insert("presence", {
        room,
        user,
        data,
        updated: now,
        created: now,
      });
    }
  },
});

// Send heartbeat to update the "updated" timestamp
export const heartbeat = mutation({
  args: {
    room: v.string(),
    user: v.string(),
  },
  handler: async (ctx, args) => {
    const { room, user } = args;
    const now = Date.now();
    
    const existingPresence = await ctx.db
      .query("presence")
      .filter((q) => 
        q.and(
          q.eq(q.field("room"), room),
          q.eq(q.field("user"), user)
        )
      )
      .first();
    
    if (existingPresence) {
      await ctx.db.patch(existingPresence._id, {
        updated: now,
      });
      return existingPresence._id;
    }
    return null;
  },
}); 