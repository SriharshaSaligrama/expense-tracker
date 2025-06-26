import { TransactionForm } from '@/components/transactions/transaction-form';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export const Route = createFileRoute('/transactions/edit/$id')({
    validateSearch: (search) => ({
        search: typeof search.search === 'string' ? search.search : undefined,
        type: typeof search.type === 'string' ? search.type : 'all',
        date: typeof search.date === 'string' ? search.date : undefined,
        startDate: typeof search.startDate === 'string' ? search.startDate : undefined,
        endDate: typeof search.endDate === 'string' ? search.endDate : undefined,
    }),
    component: function () {
        return <ErrorBoundary errorMessage="Oops, No transaction found. The data you are looking for might have been deleted or does not exist.">
            <RouteComponent />
        </ErrorBoundary>
    },
});

function RouteComponent() {
    const { id } = Route.useParams();
    const { search: searchStr, type, date } = Route.useSearch();
    const transaction = useQuery(api.transactions.get, { id: id as Id<"transactions"> });
    if (transaction == null) {
        return <div className="p-8 text-center text-muted-foreground">Loading transaction...</div>;
    }
    return <TransactionForm mode="edit" id={id} initialValues={transaction} search={searchStr} type={type} date={date} />;
}
