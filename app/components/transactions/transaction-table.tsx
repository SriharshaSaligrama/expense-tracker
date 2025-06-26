import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Id } from "convex/_generated/dataModel";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { sentenceCase } from "@/lib/utils";
import { format } from 'date-fns';
import { useNavigate } from "@tanstack/react-router";
import { Dispatch, SetStateAction } from "react";

export function TransactionTable({
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

    return <div className="rounded-md border">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {transactions.map((transaction) => (
                    <TableRow key={transaction._id}>
                        <TableCell>{format(new Date(transaction.date), 'PP')}</TableCell>
                        <TableCell>{sentenceCase(transaction.description)}</TableCell>
                        <TableCell>{sentenceCase(transaction.name)}</TableCell>
                        <TableCell>
                            {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell className="capitalize">{transaction.type}</TableCell>
                        <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem className='flex items-center justify-between' onClick={() => {
                                        navigate({
                                            to: '/transactions/edit/$id',
                                            params: { id: transaction._id },
                                            search: {
                                                search: searchInput,
                                                type,
                                                date: transaction.date,
                                                startDate,
                                                endDate,
                                            }
                                        });
                                    }}>
                                        Edit
                                        <Pencil className="h-4 w-4" />
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className='flex items-center justify-between text-destructive' onClick={() => setDeleteId(transaction._id as Id<"transactions">)}>
                                        Delete
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
}