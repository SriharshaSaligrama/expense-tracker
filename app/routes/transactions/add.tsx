import { TransactionForm } from '@/components/transaction-form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/transactions/add')({
    validateSearch: (search) => ({
        page: search.page ? Number(search.page) : 1,
        search: typeof search.search === 'string' ? search.search : '',
        type: typeof search.type === 'string' ? search.type : 'all',
        date: typeof search.date === 'string' ? search.date : undefined,
    }),
    component: RouteComponent,
})

function RouteComponent() {
    const { page, search: searchStr, type, date } = Route.useSearch()
    return <TransactionForm mode="add" page={page} search={searchStr} type={type} date={date} />
}
