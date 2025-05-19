import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { useActionState, useState } from "react";
import { transactionSchema } from "@/hooks/transaction-schema";
import { api } from "../../convex/_generated/api";
import { useMutation } from "convex/react";
import { useNavigate } from '@tanstack/react-router';
import { Id } from "convex/_generated/dataModel";

type SearchParams = {
    page: number,
    search?: string,
    type: string,
    date?: string,
}

export function TransactionForm({
    mode = "add",
    initialValues,
    id,
    page,
    search,
    type,
    date: queryDate,
}: {
    mode?: "add" | "edit",
    initialValues?: {
        name: string,
        amount: number,
        type: string,
        date: string,
        description: string,
    },
    id?: string,
    page: number,
    search?: string,
    type: string,
    date?: string,
}) {
    const navigate = useNavigate();
    const createTransaction = useMutation(api.transactions.create);
    const updateTransaction = useMutation(api.transactions.update);
    const [date, setDate] = useState<Date | undefined>(initialValues?.date ? new Date(initialValues.date) : queryDate ? new Date(queryDate) : undefined);
    const initialState = { error: "", success: false };

    async function handleForm(_prevState: typeof initialState, formData: FormData) {
        // Get latest filters from the current URL (not just from props)
        const pageParam = page ?? 1;
        const searchParam = search ?? '';
        const typeParam = type ?? 'all';
        const dateParam = queryDate ?? '';
        const values = {
            name: (formData.get("name") as string) ?? "",
            amount: formData.get("amount") ?? "",
            type: (formData.get("type") as string) ?? "",
            date: date ? date.toISOString() : (formData.get("date") as string) ?? "",
            description: (formData.get("description") as string) ?? "",
        };
        const parsed = transactionSchema.safeParse(values);
        if (!parsed.success) {
            return { error: parsed.error.errors[0].message, success: false };
        }
        try {
            if (mode === "edit" && id) {
                await updateTransaction({ ...parsed.data, id: id as Id<"transactions"> });
            } else {
                await createTransaction(parsed.data);
            }
            // Redirect using the actual current URL filter state
            const searchParams: SearchParams = {
                page: pageParam,
                type: typeParam,
            }
            if (searchParam) {
                searchParams.search = searchParam;
            }
            if (dateParam) {
                searchParams.date = dateParam;
            }
            navigate({
                to: '/transactions',
                search: {
                    page: pageParam,
                    search: searchParam,
                    type: typeParam,
                    date: dateParam || '',
                },
            })
            return { error: "", success: true };
        } catch (err) {
            return { error: err.message || "Failed to save transaction", success: false };
        }
    }

    const [state, formAction, isPending] = useActionState(handleForm, initialState);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{mode === "edit" ? "Edit Transaction" : "Add Transaction"}</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent>
                <form action={formAction} className="flex flex-col gap-4">
                    <Label>Name</Label>
                    <Input name="name" minLength={3} required defaultValue={initialValues?.name} />
                    <Label>Amount</Label>
                    <Input type="number" name="amount" min={1} required defaultValue={initialValues?.amount} />
                    <Label>Transaction Type</Label>
                    <Select name="type" required defaultValue={initialValues?.type}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Transaction Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="income">Income</SelectItem>
                            <SelectItem value="expense">Expense</SelectItem>
                        </SelectContent>
                    </Select>
                    <Label>Transaction Date</Label>
                    <DatePicker className="w-full" datePlaceholder="Select date" value={date} onChange={setDate} />
                    <Label>Description</Label>
                    <Textarea name="description" defaultValue={initialValues?.description} />
                    {state.error && (
                        <div className="text-red-500 text-sm">{state.error}</div>
                    )}
                    {state.success && (
                        <div className="text-green-600 text-sm">Transaction saved!</div>
                    )}
                    <Button type="submit" disabled={isPending}>{mode === "edit" ? "Update" : "Submit"}</Button>
                </form>
            </CardContent>
        </Card>
    );
}