import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { presenceTable } from "./presence";

export default defineSchema({
  // Game rooms for Tic-Tac-Toe
  gameRooms: defineTable({
    roomCode: v.string(),
    hostId: v.string(),
    hostName: v.string(),
    guestId: v.union(v.string(), v.null()),
    guestName: v.union(v.string(), v.null()),
    status: v.string(), // waiting, playing, finished
    board: v.array(v.union(v.string(), v.null())),
    currentTurn: v.string(), // X or O
    winner: v.union(v.string(), v.null()),
    created: v.number(),
    lastActivity: v.number(),
  }).index("by_roomCode", ["roomCode"]).index("by_status", ["status"]),
  
  // Presence data for real-time user presence
  presence: defineTable(presenceTable)
    .index("by_room_user", ["room", "user"])
    .index("by_room", ["room"]),
}); 