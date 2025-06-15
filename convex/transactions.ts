import { mutation, query } from "../convex/_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Query } from "convex/server";
import { Doc } from "./_generated/dataModel";

type TransactionTableInfo = {
    document: Doc<"transactions">;
    fieldPaths: string;
    indexes: {
        by_user_type_date: ["user", "type", "date", "_creationTime"];
        by_user_date: ["user", "date", "_creationTime"];
    };
    searchIndexes: {
        search_blob: {
            searchField: "search_blob";
            filterFields: string; // string[];
        };
    };
    vectorIndexes: Record<string, never>;
};

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
        search: v.optional(v.string()),
        type: v.optional(v.string()), // "income", "expense", or "all"
        startDate: v.optional(v.string()),
        endDate: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // --- SEARCH MODE ---
        if (args.search?.trim()) {
            let searchQuery = ctx.db
                .query("transactions")
                .withSearchIndex("search_blob", q =>
                    q.search("search_blob", args.search!.trim()).eq("user", userId)
                );

            if (args.type && args.type !== "all") {
                searchQuery = searchQuery.filter(q => q.eq(q.field("type"), args.type));
            }
            if (args.startDate) {
                searchQuery = searchQuery.filter(q => q.gte(q.field("date"), args.startDate as string));
            }
            if (args.endDate) {
                searchQuery = searchQuery.filter(q => q.lte(q.field("date"), args.endDate as string));
            }

            const allResults = await searchQuery.collect();
            return allResults
        }

        // --- INDEXED MODE ---
        let baseQuery: Query<TransactionTableInfo>;
        if (args.type && args.type !== "all") {
            baseQuery = ctx.db
                .query("transactions")
                .withIndex("by_user_type_date", q =>
                    q.eq("user", userId).eq("type", args.type as string)
                );
        } else {
            baseQuery = ctx.db
                .query("transactions")
                .withIndex("by_user_date", q =>
                    q.eq("user", userId)
                );
        }

        if (args.startDate) {
            baseQuery = baseQuery.filter(q => q.gte(q.field("date"), args.startDate as string));
        }
        if (args.endDate) {
            baseQuery = baseQuery.filter(q => q.lte(q.field("date"), args.endDate as string));
        }

        const allResults = await baseQuery
            .order("desc")
            .collect();

        return allResults;
    },
});

export const listRecent5 = query({
    args: {
        startDate: v.string(),
        endDate: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const recent5 = await ctx.db
            .query("transactions")
            .withIndex("by_user_date", q => q.eq("user", userId).gte("date", args.startDate).lte("date", args.endDate))
            .order("desc")
            .take(5)

        return recent5;
    }
});

export const stats = query({
    args: {
        startDate: v.string(),
        endDate: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const totalIncome = await ctx.db
            .query("transactions")
            .withIndex("by_user_type_date", q =>
                q
                    .eq("user", userId)
                    .eq("type", "income")
                    .gte("date", args.startDate)
                    .lte("date", args.endDate)
            )
            .collect();

        const totalExpense = await ctx.db
            .query("transactions")
            .withIndex("by_user_type_date", q =>
                q
                    .eq("user", userId)
                    .eq("type", "expense")
                    .gte("date", args.startDate)
                    .lte("date", args.endDate)
            )
            .collect();

        const totalIncomeAmount = totalIncome.reduce((sum, txn) => sum + txn.amount, 0);
        const totalExpenseAmount = totalExpense.reduce((sum, txn) => sum + txn.amount, 0);
        const balanceAmount = totalIncomeAmount - totalExpenseAmount;

        return { totalIncomeAmount, totalExpenseAmount, balanceAmount };
    }
});

export const remove = mutation({
    args: { id: v.id("transactions") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

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
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

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
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        return await ctx.db.get(args.id);
    },
});
