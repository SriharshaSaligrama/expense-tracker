import { useState, useRef, useEffect } from "react";
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Pencil, Trash } from 'lucide-react'
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export const Route = createFileRoute('/transactions/')({
    validateSearch: (search) => ({
        search: typeof search.search === 'string' ? search.search : undefined,
        type: typeof search.type === 'string' ? search.type : 'all',
        date: typeof search.date === 'string' ? search.date : undefined,
        cursor: typeof search.cursor === 'string' ? search.cursor : undefined,
    }),
    component: RouteComponent,
})

function useDebouncedValue<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value);
    // Use browser's setTimeout type for compatibility
    const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        if (timeout.current) clearTimeout(timeout.current);
        timeout.current = setTimeout(() => setDebounced(value), delay);
        return () => {
            if (timeout.current) clearTimeout(timeout.current);
        };
    }, [value, delay]);
    return debounced;
}

function RouteComponent() {
    const navigate = useNavigate({ from: '/transactions' });
    const { search: searchStr, type: typeParam, date: dateParam, cursor: routeCursor } = Route.useSearch();
    const pageSize = 10;
    const [search, setSearch] = useState(searchStr || "");
    const debouncedSearch = useDebouncedValue(search, 300);
    const [type, setType] = useState(typeParam || "all");
    const [date, setDate] = useState<Date | undefined>(dateParam ? new Date(dateParam) : undefined);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const deleteTransaction = useMutation(api.transactions.remove);

    // Cursor-based pagination state
    const [prevCursors, setPrevCursors] = useState<string[]>([]); // for Previous

    // Fetch transactions with cursor
    const transactions = useQuery(api.transactions.list, {
        pageSize,
        search: debouncedSearch.trim() ? debouncedSearch : undefined,
        type,
        date: date ? new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString() : undefined,
        cursor: routeCursor,
    });

    const isLoading = transactions === undefined;
    const error = null;
    const errorMessage = typeof error === 'string' ? error : error ? 'Failed to load transactions.' : null;
    const items = transactions?.items ?? [];
    const isDone = transactions?.isDone;
    const nextCursor = transactions?.cursor;

    function handleNext() {
        if (nextCursor) {
            if (routeCursor) {
                setPrevCursors(prev => [...prev, routeCursor]);
            }
            navigate({
                search: {
                    search: search.trim() || undefined,
                    type,
                    date: date ? new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString() : undefined,
                    cursor: nextCursor
                }
            });
        }
    }

    function handlePrev() {
        if (prevCursors.length > 0) {
            setPrevCursors(prev => {
                const newPrev = [...prev];
                const prevCursor = newPrev.pop();
                navigate({
                    search: {
                        search: search.trim() || undefined,
                        type,
                        date: date ? new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString() : undefined,
                        cursor: prevCursor
                    }
                });
                return newPrev;
            });
        } else {
            navigate({
                search: {
                    search: search.trim() || undefined,
                    type,
                    date: date ? new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString() : undefined,
                    cursor: undefined
                }
            });
            setPrevCursors([]);
        }
    }

    // Single effect to handle all URL updates and cursor state
    useEffect(() => {
        const currentSearch = searchStr;
        const currentType = typeParam;
        const currentDate = dateParam;
        const currentCursor = routeCursor;

        const searchChanged = search.trim() !== currentSearch;
        const typeChanged = type !== currentType;
        const dateChanged = date?.toISOString() !== currentDate;
        const shouldResetCursor = (
            searchChanged || // Only reset when search is complete
            typeChanged ||
            dateChanged
        );
        const cursorChanged = !shouldResetCursor && nextCursor !== currentCursor;

        if (searchChanged || typeChanged || dateChanged || cursorChanged) {
            navigate({
                search: {
                    search: search.trim() || undefined,
                    type,
                    date: date ? new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString() : undefined,
                    cursor: shouldResetCursor ? undefined : nextCursor || currentCursor
                },
                replace: true
            });

            if (shouldResetCursor) {
                setPrevCursors([]);
            }
        }
    }, [search, type]);

    async function handleDelete() {
        if (!deleteId) return;
        await deleteTransaction({ id: deleteId as Id<"transactions"> });
        setDeleteId(null);
    }

    return <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
            <Input id="search" placeholder='Search by name, description or amount' value={search} onChange={e => setSearch(e.target.value)} />
            <Select value={type} onValueChange={val => setType(val)}>
                <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select Transaction Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
            </Select>
            <DatePicker value={date} onChange={d => setDate(d)} datePlaceholder="Select date" />
            {date && (
                <Button variant="ghost" onClick={() => setDate(undefined)}>
                    Clear Date
                </Button>
            )}            <Button variant="default" onClick={() => navigate({ to: '/transactions/add', search: { cursor: routeCursor ? encodeURIComponent(routeCursor) : undefined, search, type, date: date ? new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString() : undefined } })}>
                Add Transaction
            </Button>
        </div>
        <Table>
            <TableCaption>A list of your recent transactions.</TableCaption>
            <TableHeader className='border-t '>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody className='border-b'>
                {isLoading && (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading transactions...</TableCell>
                    </TableRow>
                )}
                {errorMessage && (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-red-500 font-semibold bg-red-50 rounded">{errorMessage}</TableCell>
                    </TableRow>
                )}
                {!isLoading && !error && items.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No transactions found.</TableCell>
                    </TableRow>
                )}
                {!isLoading && !error && items.map((item) => (
                    <TableRow key={item._id} className="hover:bg-accent/40 transition-colors">
                        <TableCell>{item.name}</TableCell>
                        <TableCell>₹{item.amount}</TableCell>
                        <TableCell>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</TableCell>
                        <TableCell>{new Date(item.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="flex items-center justify-end gap-2">                            <Button variant="outline" size="icon" onClick={() => navigate({ to: `/transactions/edit/${item._id}`, search: { cursor: routeCursor ? encodeURIComponent(routeCursor) : undefined, search, type, date: date ? new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString() : undefined } })}>
                            <Pencil />
                        </Button>
                            <Dialog open={deleteId === item._id} onOpenChange={open => setDeleteId(open ? item._id : null)}>
                                <DialogTrigger asChild>
                                    <Button variant="destructive" size="icon">
                                        <Trash />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Are you sure to delete the transaction?</DialogTitle>
                                        <DialogDescription>
                                            This action cannot be undone. This will permanently remove this transaction data.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button type="button" variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
                                        <Button type="button" variant="destructive" onClick={handleDelete}>Delete</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious href="#" onClick={handlePrev} aria-disabled={prevCursors.length === 0} />
                </PaginationItem>
                <PaginationItem>
                    <PaginationNext href="#" onClick={handleNext} aria-disabled={isDone} />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    </div>;
}
