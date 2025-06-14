import { Migrations, } from "@convex-dev/migrations";
import { components, internal } from "./_generated/api.js";
import { DataModel } from "./_generated/dataModel.js";

export const migrations = new Migrations<DataModel>(components.migrations);
export const runSearchBlob = migrations.runner(internal.migrations.backfillSearchBlob);


export const backfillSearchBlob = migrations.define({
    table: "transactions",
    migrateOne: async (ctx, transaction) => {
        const search_blob = `${transaction.name} ${transaction.description} ${transaction.amount}`;
        await ctx.db.patch(transaction._id, { search_blob });
    },
});