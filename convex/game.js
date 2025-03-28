import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new game room
export const createRoom = mutation({
  args: {
    hostId: v.string(),
    hostName: v.string(),
  },
  handler: async (ctx, args) => {
    const { hostId, hostName } = args;
    
    // Generate a 6-character room code
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const roomId = await ctx.db.insert("gameRooms", {
      roomCode,
      hostId,
      hostName,
      guestId: null,
      guestName: null,
      status: "waiting", // waiting, playing, finished
      board: Array(9).fill(null),
      currentTurn: "X", // X always starts
      winner: null,
      created: Date.now(),
      lastActivity: Date.now(),
    });
    
    return { roomId, roomCode };
  },
});

// Join an existing game room
export const joinRoom = mutation({
  args: {
    roomCode: v.string(),
    guestId: v.string(),
    guestName: v.string(),
  },
  handler: async (ctx, args) => {
    const { roomCode, guestId, guestName } = args;
    
    // Find the room with this code
    const room = await ctx.db
      .query("gameRooms")
      .filter((q) => q.eq(q.field("roomCode"), roomCode))
      .first();
    
    if (!room) {
      throw new Error("Room not found");
    }
    
    if (room.status !== "waiting") {
      throw new Error("Room is not accepting new players");
    }
    
    // Update the room with the guest info and change status to playing
    await ctx.db.patch(room._id, {
      guestId,
      guestName,
      status: "playing",
      lastActivity: Date.now(),
    });
    
    return { roomId: room._id, roomCode };
  },
});

// Get a room by its code
export const getRoomByCode = query({
  args: {
    roomCode: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("gameRooms")
      .filter((q) => q.eq(q.field("roomCode"), args.roomCode))
      .first();
  },
});

// Get a room by its ID
export const getRoom = query({
  args: {
    roomId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.roomId);
  },
});

// Make a move in the game
export const makeMove = mutation({
  args: {
    roomId: v.string(),
    playerId: v.string(),
    position: v.number(),
  },
  handler: async (ctx, args) => {
    const { roomId, playerId, position } = args;
    
    const room = await ctx.db.get(roomId);
    
    if (!room) {
      throw new Error("Room not found");
    }
    
    if (room.status !== "playing") {
      throw new Error("Game is not in progress");
    }
    
    // Check if it's this player's turn
    const playerMark = room.hostId === playerId ? "X" : "O";
    if (playerMark !== room.currentTurn) {
      throw new Error("Not your turn");
    }
    
    // Check if the position is valid and empty
    if (position < 0 || position > 8 || room.board[position] !== null) {
      throw new Error("Invalid move");
    }
    
    // Create a new board with the move
    const newBoard = [...room.board];
    newBoard[position] = playerMark;
    
    // Check for a winner
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    
    let winner = null;
    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (
        newBoard[a] &&
        newBoard[a] === newBoard[b] &&
        newBoard[a] === newBoard[c]
      ) {
        winner = newBoard[a];
        break;
      }
    }
    
    // Check for a draw (if no winner and board is full)
    const isDraw = !winner && newBoard.every(cell => cell !== null);
    
    // Update the room
    await ctx.db.patch(roomId, {
      board: newBoard,
      currentTurn: room.currentTurn === "X" ? "O" : "X",
      status: winner || isDraw ? "finished" : "playing",
      winner: winner ? winner : (isDraw ? "draw" : null),
      lastActivity: Date.now(),
    });
    
    return { success: true };
  },
});

// Reset the game for a rematch
export const resetGame = mutation({
  args: {
    roomId: v.string(),
    playerId: v.string(),
  },
  handler: async (ctx, args) => {
    const { roomId, playerId } = args;
    
    const room = await ctx.db.get(roomId);
    
    if (!room) {
      throw new Error("Room not found");
    }
    
    // Only host or guest can reset the game
    if (room.hostId !== playerId && room.guestId !== playerId) {
      throw new Error("Not authorized");
    }
    
    // Reset the game state
    await ctx.db.patch(roomId, {
      board: Array(9).fill(null),
      currentTurn: "X",
      status: "playing",
      winner: null,
      lastActivity: Date.now(),
    });
    
    return { success: true };
  },
});

// Leave a game room
export const leaveRoom = mutation({
  args: {
    roomId: v.string(),
    playerId: v.string(),
  },
  handler: async (ctx, args) => {
    const { roomId, playerId } = args;
    
    const room = await ctx.db.get(roomId);
    
    if (!room) {
      throw new Error("Room not found");
    }
    
    if (room.hostId === playerId) {
      // If the host leaves, delete the room
      await ctx.db.delete(roomId);
      return { success: true };
    } else if (room.guestId === playerId) {
      // If the guest leaves, set the room back to waiting status
      await ctx.db.patch(roomId, {
        guestId: null,
        guestName: null,
        status: "waiting",
        board: Array(9).fill(null),
        currentTurn: "X",
        winner: null,
        lastActivity: Date.now(),
      });
      return { success: true };
    } else {
      throw new Error("Player not in this room");
    }
  },
});

// List all waiting rooms
export const listWaitingRooms = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("gameRooms")
      .filter((q) => q.eq(q.field("status"), "waiting"))
      .order("desc", (q) => q.field("created"))
      .collect();
  },
});