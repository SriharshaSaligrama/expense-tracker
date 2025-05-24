import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
    ...authTables,
    transactions: defineTable({
        name: v.string(),
        amount: v.number(),
        type: v.string(),
        date: v.string(),
        description: v.string(),
        user: v.id("users"),
    })
        .index("by_user", ["user"])
        .index("by_user_date", ["user", "date"])
        .index("by_user_type_date", ["user", "type", "date"])
        // Search indexes for efficient text search
        .searchIndex("search_name", {
            searchField: "name",
            filterFields: ["user", "type", "date"]
        })
        .searchIndex("search_description", {
            searchField: "description",
            filterFields: ["user", "type", "date"]
        })
});

export default schema;