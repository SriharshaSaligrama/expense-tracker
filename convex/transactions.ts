import { mutation, query } from "../convex/_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
    args: {
        name: v.string(),
        amount: v.number(),
        type: v.string(),
        date: v.string(),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");
        return await ctx.db.insert("transactions", {
            ...args,
            description: args.description ?? "",
            user: userId,
        });
    },
});

export const list = query({
    args: {
        pageSize: v.number(),
        search: v.optional(v.string()),
        type: v.string(),
        date: v.optional(v.string()),
        cursor: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const pageSize = args.pageSize ?? 10;

        const baseQuery = ctx.db
            .query("transactions")
            .withIndex("by_user")
            .filter(q => q.eq(q.field("user"), userId));

        // Add type and date filters if present
        let filtered = baseQuery;
        if (args.type && args.type !== "all") {
            filtered = filtered.filter(q => q.eq(q.field("type"), args.type));
        }
        if (args.date) {
            filtered = filtered.filter(q => q.eq(q.field("date"), args.date));
        }

        if (args.search?.trim()) {
            const search = args.search.trim();

            // Collect all matching records for text search
            const results = await filtered.collect();

            // Perform text search on collected results
            const searchResults = results.filter(item => {
                const searchableText = `${item.name} ${item.description}`.toLowerCase();
                if (searchableText.includes(search.toLowerCase())) {
                    return true;
                }
                // Search in amount if the search term is numeric
                if (search.match(/^\d+$/)) {
                    return item.amount.toString().includes(search);
                }
                return false;
            });

            // Sort by creation time (newest first)
            searchResults.sort((a, b) => b._creationTime - a._creationTime);

            // Manual pagination for search results
            const startIndex = args.cursor ? parseInt(args.cursor) : 0;
            const endIndex = startIndex + pageSize;
            const paginatedResults = searchResults.slice(startIndex, endIndex);

            return {
                items: paginatedResults,
                cursor: endIndex < searchResults.length ? endIndex.toString() : undefined,
                isDone: endIndex >= searchResults.length
            };
        }

        // If no search, use normal cursor-based pagination
        const { page, isDone, continueCursor } = await filtered
            .order("desc")
            .paginate({
                cursor: args.cursor ?? null,
                numItems: pageSize,
            });

        return { items: page, cursor: continueCursor, isDone };
    },
});

export const remove = mutation({
    args: { id: v.id("transactions") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
        return true;
    },
});

export const update = mutation({
    args: {
        id: v.id("transactions"),
        name: v.string(),
        amount: v.number(),
        type: v.string(),
        date: v.string(),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            name: args.name,
            amount: args.amount,
            type: args.type,
            date: args.date,
            description: args.description ?? "",
        });
        return true;
    },
});

export const get = query({
    args: { id: v.id("transactions") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});
