import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Pencil, Trash } from 'lucide-react'
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { useSearch } from '@tanstack/react-router';

export const Route = createFileRoute('/transactions/')({
    validateSearch: (search) => ({
        page: search.page ? Number(search.page) : 1,
        search: typeof search.search === 'string' ? search.search : '',
        type: typeof search.type === 'string' ? search.type : 'all',
        date: typeof search.date === 'string' ? search.date : undefined,
    }),
    component: RouteComponent,
})

function useDebouncedValue<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value);
    const timeout = useRef<NodeJS.Timeout | null>(null);
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
    const { page: pageParam, search: searchStr, type: typeParam, date: dateParam } = Route.useSearch();
    const [page, setPage] = useState(Number(pageParam) || 1);
    const pageSize = 10;
    const [search, setSearch] = useState(searchStr || "");
    const debouncedSearch = useDebouncedValue(search, 300);
    const [type, setType] = useState(typeParam || "all");
    const [date, setDate] = useState<Date | undefined>(dateParam ? new Date(dateParam) : undefined);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const deleteTransaction = useMutation(api.transactions.remove);

    useEffect(() => {
        setSearch(searchStr || "");
        setType(typeParam || "all");
        setDate(dateParam ? new Date(dateParam) : undefined);
    }, [searchStr, typeParam, dateParam]);

    useEffect(() => {
        navigate({
            to: '/transactions',
            search: {
                page,
                search,
                type,
                date: date ? new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString() : undefined,
            },
            replace: true,
        });
    }, [page, search, type, date]);

    const transactions = useQuery(api.transactions.list, {
        page,
        pageSize,
        search: debouncedSearch.trim() ? debouncedSearch : undefined,
        type,
        date: date ? new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString() : undefined,
    });
    const isLoading = transactions === undefined;
    const error = null;
    const errorMessage = typeof error === 'string' ? error : error ? 'Failed to load transactions.' : null;
    const total = transactions?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const items = transactions?.items ?? [];

    async function handleDelete() {
        if (!deleteId) return;
        await deleteTransaction({ id: deleteId as any });
        setDeleteId(null);
    }

    return <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
            <Input id="search" placeholder='Search by name, description or amount' value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            <Select value={type} onValueChange={val => { setType(val); setPage(1); }}>
                <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select Transaction Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
            </Select>
            <DatePicker value={date} onChange={d => { setDate(d); setPage(1); }} datePlaceholder="Select date" />
            {date && (
                <Button variant="ghost" onClick={() => { setDate(undefined); setPage(1); }}>
                    Clear Date
                </Button>
            )}
            <Button variant="default" onClick={() => navigate({ to: '/transactions/add', search: { page, search, type, date: date ? new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString() : undefined } })}>
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
                        <TableCell className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="icon" onClick={() => navigate({ to: `/transactions/edit/${item._id}`, search: { page, search, type, date: date ? new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString() : undefined } })}>
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
                    <PaginationPrevious href="#" onClick={() => setPage((p) => Math.max(1, p - 1))} aria-disabled={page === 1} />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                        <PaginationLink href="#" isActive={page === i + 1} onClick={() => setPage(i + 1)}>
                            {i + 1}
                        </PaginationLink>
                    </PaginationItem>
                ))}
                <PaginationItem>
                    <PaginationNext href="#" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} aria-disabled={page === totalPages} />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    </div>;
}
