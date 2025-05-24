import { TransactionForm } from '@/components/transaction-form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/transactions/add')({
    validateSearch: (search) => ({
        search: typeof search.search === 'string' ? search.search : undefined,
        type: typeof search.type === 'string' ? search.type : 'all',
        date: typeof search.date === 'string' ? search.date : undefined,
        cursor: typeof search.cursor === 'string' ? search.cursor : undefined,
    }),
    component: RouteComponent,
})

function RouteComponent() {
    const { search: searchStr, type, date, cursor } = Route.useSearch();
    return <TransactionForm mode="add" search={searchStr} type={type} date={date} cursor={cursor} />;
}
