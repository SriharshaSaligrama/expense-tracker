import { TransactionForm } from '@/components/transaction-form';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useParams, useNavigate, useSearch } from '@tanstack/react-router';

export const Route = createFileRoute('/transactions/edit/$id')({
    validateSearch: (search) => ({
        page: search.page ? Number(search.page) : 1,
    }),
    component: RouteComponent,
});

function RouteComponent() {
    const { id } = Route.useParams();
    const { page } = Route.useSearch();
    const transaction = useQuery(api.transactions.get, { id: id as any });
    if (!transaction) {
        return <div className="p-8 text-center text-muted-foreground">Loading transaction...</div>;
    }
    return <TransactionForm mode="edit" id={id} initialValues={transaction} page={page} />;
}
