import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { TransactionTable } from '@/components/transactions/transaction-table';
import { TransactionGrid } from '@/components/transactions/transaction-grid';
import { TransactionFilters } from '@/components/transactions/transaction-filters';
import { TransactionDeleteDialog } from '@/components/transactions/transaction-delete-dialog';
import { TransactionHeaderSection } from '@/components/transactions/transaction-header-section';
import { useHandleDates, useHandleSearch } from '@/hooks/use-transaction-filters';
import { useDeleteTransaction } from '@/hooks/use-transaction-actions';
import { SearchParams } from '@/types';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
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
    const { search: searchInput, type = 'all', startDate, endDate } = Route.useSearch();
    const {
        searchValue,
        isPending,
        handleSearch,
        clearSearch,
        updateSearchParams,
    } = useHandleSearch({ searchInput });

    const {
        draftStartDate,
        draftEndDate,
        handleDateChange
    } = useHandleDates({
        startDate,
        endDate,
        updateSearchParams
    });

    const {
        deleteId,
        setDeleteId,
        handleDelete
    } = useDeleteTransaction();

    const [view, setView] = useState<'table' | 'grid'>('table');

    const transactions = useQuery(api.transactions.list, {
        search: searchInput,
        type: type === 'all' ? undefined : type,
        startDate: startDate ?? (draftStartDate ? draftStartDate.toISOString() : initialDateRange.startDate.toISOString()),
        endDate: endDate ?? (draftEndDate ? draftEndDate.toISOString() : initialDateRange.endDate.toISOString()),
    }) ?? [];

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    return (
        <div className="space-y-4">
            <TransactionHeaderSection
                view={view}
                setView={setView}
                searchInput={searchInput}
                type={type}
                startDate={startDate}
                endDate={endDate}
                isPending={isPending}
            />

            <div className="space-y-4">
                <TransactionFilters
                    type={type}
                    updateSearchParams={updateSearchParams}
                    isPending={isPending}
                    draftStartDate={draftStartDate}
                    draftEndDate={draftEndDate}
                    handleDateChange={handleDateChange}
                    initialDateRange={initialDateRange}
                    searchValue={searchValue}
                    handleSearch={handleSearch}
                    clearSearch={clearSearch}
                    today={today}
                />

                {isPending ? (
                    <div className="text-center text-muted-foreground">Loading...</div>
                ) : transactions.length === 0 ? (
                    <div className="text-center text-muted-foreground">No transactions found</div>
                ) : view === 'table' ? (
                    <TransactionTable
                        transactions={transactions}
                        searchInput={searchValue}
                        type={type}
                        startDate={startDate}
                        endDate={endDate}
                        setDeleteId={setDeleteId}
                        formatCurrency={formatCurrency}
                    />
                ) : (
                    <TransactionGrid
                        transactions={transactions}
                        searchInput={searchValue}
                        type={type}
                        startDate={startDate}
                        endDate={endDate}
                        setDeleteId={setDeleteId}
                        formatCurrency={formatCurrency}
                    />
                )}

                <TransactionDeleteDialog
                    deleteId={deleteId}
                    setDeleteId={setDeleteId}
                    handleDelete={handleDelete}
                />
            </div>
        </div>
    );
}
