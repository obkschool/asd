/* This file is auto-generated by Convex. It should not be edited manually. */

/**
 * This is the Convex API reference for your application.
 *
 * It is automatically generated from your Convex functions and schema.
 * To update this file, run:
 *
 *   npx convex codegen
 *
 * @module
 */

/**
 * A type describing your Convex deployment.
 *
 * This includes a union type for each of your Convex tables, as well as
 * a RecordByName type describing the TypeScript type corresponding to a given table name.
 *
 * To update this type as your tables change, run `npx convex codegen`.
 */
export type DataModel = {
  gameRooms: {
    roomCode: string;
    hostId: string;
    hostName: string;
    guestId: string | null;
    guestName: string | null;
    status: string;
    board: (string | null)[];
    currentTurn: string;
    winner: string | null;
    created: number;
    lastActivity: number;
  };
  presence: {
    room: string;
    user: string;
    data: any;
    updated: number;
    created: number;
  };
}; 