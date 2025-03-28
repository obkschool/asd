import { useQuery as convexUseQuery, useMutation as convexUseMutation, useAction as convexUseAction } from "convex/react";

// Export the hooks with proper fallbacks
export const useQuery = convexUseQuery;
export const useMutation = convexUseMutation;
export const useAction = convexUseAction; 