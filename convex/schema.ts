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
    // {
    //     name: "string",
    //     amount: "number",
    //     type: "string",
    //     date: "date",
    //     description: "string",
    // },
    // Your other tables...
});

export default schema;