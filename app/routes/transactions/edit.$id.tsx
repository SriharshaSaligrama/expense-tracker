import { TransactionForm } from '@/components/transaction-form';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';

export const Route = createFileRoute('/transactions/edit/$id')({
    validateSearch: (search) => ({
        page: search.page ? Number(search.page) : 1,
        search: typeof search.search === 'string' ? search.search : '',
        type: typeof search.type === 'string' ? search.type : 'all',
        date: typeof search.date === 'string' ? search.date : undefined,
    }),
    component: RouteComponent,
});

function RouteComponent() {
    const { id } = Route.useParams();
    const { page, search: searchStr, type, date } = Route.useSearch()
    const transaction = useQuery(api.transactions.get, { id: id as Id<"transactions"> });
    if (!transaction) {
        return <div className="p-8 text-center text-muted-foreground">Loading transaction...</div>;
    }
    return <TransactionForm mode="edit" id={id} initialValues={transaction} page={page} search={searchStr} type={type} date={date} />;
}
