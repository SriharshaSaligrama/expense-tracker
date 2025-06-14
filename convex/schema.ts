import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
    ...authTables,
    transactions: defineTable({
        name: v.string(),
        amount: v.number(),
        type: v.string(), // "income" or "expense"
        date: v.string(),
        description: v.string(),
        user: v.id("users"),
        search_blob: v.optional(v.string()), // <-- new field for multi-field search
    })
        .index("by_user", ["user"])
        .index("by_user_date", ["user", "date"])
        .index("by_user_type_date", ["user", "type", "date"])
        .searchIndex("search_blob", {
            searchField: "search_blob",
            filterFields: ["user", "type", "date"],
        }),
});

export default schema;