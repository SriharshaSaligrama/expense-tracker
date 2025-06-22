import { z } from "zod";

export const transactionSchema = z.object({
    name: z.string().trim().min(3, "Name must be at least 3 characters long"),
    amount: z.coerce.number().min(1, "Amount must be at least 1"),
    type: z.enum(["income", "expense"], { errorMap: () => ({ message: "Type must be income or expense" }) }),
    date: z.string().min(1, "Date is required"),
    description: z.string().optional(),
});
