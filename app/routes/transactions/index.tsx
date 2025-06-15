import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTransition, useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { debounce } from 'lodash';
import { MoreVertical, Pencil, Trash2, X } from 'lucide-react';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
};

type SearchParams = {
    search?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
};

const initialDateRange = {
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
}

export const Route = createFileRoute('/transactions/')({
    validateSearch: (search): SearchParams => ({
        search: typeof search.search === 'string' ? search.search : undefined,
        type: typeof search.type === 'string' ? search.type : 'all',
        startDate: typeof search.startDate === 'string' ? search.startDate : initialDateRange.startDate.toISOString(),
        endDate: typeof search.endDate === 'string' ? search.endDate : initialDateRange.endDate.toISOString(),
    }),
    component: RouteComponent,
});

function RouteComponent() {
    const navigate = useNavigate();
    const { search: searchInput, type = 'all', startDate, endDate } = Route.useSearch();
    const [isPending, startTransition] = useTransition();
    const [searchValue, setSearchValue] = useState(searchInput ?? '');
    const [draftStartDate, setDraftStartDate] = useState<Date | undefined>(startDate ? new Date(startDate) : undefined);
    const [draftEndDate, setDraftEndDate] = useState<Date | undefined>(endDate ? new Date(endDate) : undefined);
    const [deleteId, setDeleteId] = useState<Id<"transactions"> | null>(null);

    const deleteTransaction = useMutation(api.transactions.remove);

    const handleDelete = async () => {
        if (!deleteId) return;
        await deleteTransaction({ id: deleteId });
        setDeleteId(null);
    };

    // Create a memoized debounced search function
    const debouncedSearchNavigate = useMemo(
        () =>
            debounce((value: string) => {
                startTransition(() => {
                    navigate({
                        to: '/transactions',
                        search: (current) => ({
                            ...current,
                            search: value || undefined,
                        }),
                        replace: true
                    });
                });
            }, 500),
        [navigate]
    );

    useEffect(() => {
        setDraftStartDate(startDate ? new Date(startDate) : undefined);
        setDraftEndDate(endDate ? new Date(endDate) : undefined);
    }, [startDate, endDate]);

    // Cancel debounced search on unmount
    useEffect(() => {

        return () => {
            debouncedSearchNavigate.cancel();
        };
    }, [debouncedSearchNavigate]);

    const handleSearch = useCallback((value: string) => {
        setSearchValue(value);
        debouncedSearchNavigate(value.trim());
    }, [debouncedSearchNavigate]);

    const partialNavigate = useCallback((search: Partial<SearchParams> | ((current: SearchParams) => SearchParams)) => {
        navigate({
            to: '/transactions',
            search,
            replace: true
        });
    }, [navigate]);

    const clearSearch = () => {
        setSearchValue('');
        startTransition(() => {
            partialNavigate((current) => ({
                ...current,
                search: undefined,
            }));
        });
    };

    const transactions = useQuery(api.transactions.list, {
        search: searchInput,
        type: type === 'all' ? undefined : type,
        startDate: startDate ?? (draftStartDate ? draftStartDate.toISOString() : initialDateRange.startDate.toISOString()),
        endDate: endDate ?? (draftEndDate ? draftEndDate.toISOString() : initialDateRange.endDate.toISOString()),
    }) ?? [];

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const updateSearchParams = (updates: Partial<SearchParams>) => {
        const cleanedUpdates = { ...updates };
        Object.keys(cleanedUpdates).forEach(key => {
            if (cleanedUpdates[key as keyof typeof cleanedUpdates] === undefined) {
                delete cleanedUpdates[key as keyof typeof cleanedUpdates];
            }
        });

        startTransition(() => {
            navigate({
                to: '/transactions',
                search: (current: Record<string, string | undefined>) => ({
                    ...current,
                    ...cleanedUpdates,
                }),
            });
        });
    };

    const handleDateChange = (newStartDate: Date | undefined, newEndDate: Date | undefined) => {
        if (newStartDate !== undefined) {
            setDraftStartDate(newStartDate);
            setDraftEndDate(undefined);
            // Clear both dates from the URL when changing start date
            updateSearchParams({
                startDate: undefined,
                endDate: undefined
            });
        }
        if (newEndDate !== undefined) {
            setDraftEndDate(newEndDate);
            // Only update URL params when both dates are selected
            if (draftStartDate) {
                updateSearchParams({
                    startDate: draftStartDate.toISOString(),
                    endDate: newEndDate.toISOString(),
                });
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Transactions (upto 31 days)</h1>
                <Button
                    onClick={() => navigate({
                        to: '/transactions/add',
                        search: {
                            search: searchInput,
                            type,
                            date: undefined,
                            startDate,
                            endDate,
                        }
                    })}
                    disabled={isPending}
                >
                    Add Transaction
                </Button>
            </div>

            <div className="space-y-4">
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                    <h2 className="text-lg font-semibold leading-none tracking-tight mb-4 sm:hidden">
                        Filters
                    </h2>
                    <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:gap-4">
                        <Select
                            value={type}
                            onValueChange={(value) => updateSearchParams({ type: value })}
                            disabled={isPending}                        >
                            <SelectTrigger className="w-full sm:w-[150px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="income">Income</SelectItem>
                                <SelectItem value="expense">Expense</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            <DatePicker
                                value={draftStartDate}
                                onChange={(date) => handleDateChange(date, undefined)}
                                datePlaceholder="Start Date"
                                disabled={isPending}
                                className="w-full sm:w-auto"
                            />
                            <span className="block sm:inline mx-auto sm:mx-0">to</span>
                            <DatePicker
                                value={draftEndDate}
                                onChange={(date) => handleDateChange(undefined, date)}
                                datePlaceholder="End Date"
                                minDate={draftStartDate ?? initialDateRange.startDate}
                                maxDate={draftStartDate
                                    ? new Date(Math.min(
                                        new Date(draftStartDate.getTime() + 30 * 24 * 60 * 60 * 1000).getTime(),
                                        today.getTime()
                                    ))
                                    : today
                                }
                                defaultMonth={draftStartDate
                                    ? new Date(draftStartDate.getTime() + 15 * 24 * 60 * 60 * 1000)
                                    : new Date()
                                }
                                disabled={isPending}
                                className="w-full sm:w-auto"
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full">
                            <div className="relative flex-1">
                                <Input
                                    className="pr-12 w-full"
                                    placeholder="Search transactions by name, description or amount"
                                    value={searchValue}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    disabled={isPending}
                                />
                                {searchValue && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                        onClick={clearSearch}
                                        disabled={isPending}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {isPending ? (
                    <div className="text-center text-muted-foreground">Loading...</div>
                ) : transactions.length === 0 ? (
                    <div className="text-center text-muted-foreground">No transactions found</div>
                ) : (
                    <div className="rounded-md border">
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
                                        <TableCell>{transaction.description}</TableCell>
                                        <TableCell>{transaction.name}</TableCell>
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
                )}

                <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
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
            </div>
        </div>
    );
}
