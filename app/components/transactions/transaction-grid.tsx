import { sentenceCase } from "@/lib/utils";
import { Id } from "convex/_generated/dataModel";
import { format } from "date-fns";
import { ArrowDownCircle, ArrowUpCircle, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Dispatch, SetStateAction } from "react";

export function TransactionGrid({
    transactions,
    searchInput,
    type,
    startDate,
    endDate,
    setDeleteId,
    formatCurrency
}: {
    transactions: {
        _id: Id<"transactions">;
        _creationTime: number;
        search_blob?: string | undefined;
        date: string;
        description: string;
        name: string;
        amount: number;
        type: string;
        user: Id<"users">;
    }[];
    searchInput: string;
    type: string;
    startDate?: string;
    endDate?: string;
    setDeleteId: Dispatch<SetStateAction<Id<"transactions"> | null>>;
    formatCurrency: (amount: number) => string;
}) {
    const navigate = useNavigate();
    return <div className="flex flex-col gap-4">
        {transactions.map((transaction) => (
            <div key={transaction._id} className="rounded-lg border bg-card shadow-sm p-4 w-full">
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
                    {transaction.type === 'income' ? (
                        <span title="Income"><ArrowDownCircle className="h-4 w-4 text-green-600" /></span>
                    ) : (
                        <span title="Expense"><ArrowUpCircle className="h-4 w-4 text-red-600" /></span>
                    )}
                    <span>{format(new Date(transaction.date), 'PP')}</span>
                </div>
                <div className="flex items-center justify-between ">
                    <div className={`font-bold text-xl ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(transaction.amount)}
                    </div>
                    <div className="flex gap-1">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="text-muted-foreground hover:text-primary"
                            onClick={() => navigate({
                                to: '/transactions/edit/$id',
                                params: { id: transaction._id },
                                search: {
                                    search: searchInput,
                                    type,
                                    date: transaction.date,
                                    startDate,
                                    endDate,
                                }
                            })}
                            aria-label="Edit"
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(transaction._id as Id<'transactions'>)}
                            aria-label="Delete"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <span className="font-semibold text-lg truncate">{sentenceCase(transaction.name)}</span>
                <div className="text-sm text-muted-foreground truncate mt-1">
                    {sentenceCase(transaction.description)}
                </div>

            </div>
        ))}
    </div>
}