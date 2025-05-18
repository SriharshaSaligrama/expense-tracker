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
        page: v.number(),
        pageSize: v.number(),
        search: v.optional(v.string()),
        type: v.string(),
        date: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");
        const page = args.page ?? 1;
        const pageSize = args.pageSize ?? 10;
        let queryBuilder = ctx.db.query("transactions").order("desc").filter(q => q.eq(q.field("user"), userId));
        if (args.type && args.type !== "all") {
            queryBuilder = queryBuilder.filter(q => q.eq(q.field("type"), args.type));
        }
        let all = await queryBuilder.collect();
        // In-memory search
        if (args.search) {
            const search = args.search.toLowerCase();
            all = all.filter(t =>
                t.name.toLowerCase().includes(search) ||
                t.description.toLowerCase().includes(search) ||
                t.amount.toString().includes(search)
            );
        }
        // In-memory date filter
        if (args.date) {
            function toLocalYMD(date: Date) {
                return date.getFullYear() + '-' +
                    String(date.getMonth() + 1).padStart(2, '0') + '-' +
                    String(date.getDate()).padStart(2, '0');
            }
            const filterDateStr = toLocalYMD(new Date(args.date!));
            all = all.filter(t => {
                const txDateStr = toLocalYMD(new Date(t.date));
                return txDateStr === filterDateStr;
            });
        }
        const total = all.length;
        const items = all.slice((page - 1) * pageSize, page * pageSize);
        return { items, total };
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
