import { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { LayoutGrid, TableIcon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export function TransactionHeaderSection({
    searchInput,
    type,
    startDate,
    endDate,
    isPending,

    view,
    setView
}: {
    searchInput?: string;
    type: string;
    startDate?: string;
    endDate?: string;
    isPending: boolean;

    view: 'table' | 'grid';
    setView: Dispatch<SetStateAction<'table' | 'grid'>>;
}) {
    const navigate = useNavigate();

    return (
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Transactions (upto 31 days)</h1>
            <div className="flex items-center gap-2">
                <Button
                    variant={view === 'table' ? 'outline' : 'ghost'}
                    size="icon"
                    onClick={() => setView('table')}
                    aria-label="Table view"
                >
                    <TableIcon className={view === 'table' ? 'text-primary' : 'text-muted-foreground'} />
                </Button>
                <Button
                    variant={view === 'grid' ? 'outline' : 'ghost'}
                    size="icon"
                    onClick={() => setView('grid')}
                    aria-label="Grid view"
                >
                    <LayoutGrid className={view === 'grid' ? 'text-primary' : 'text-muted-foreground'} />
                </Button>
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
        </div>
    );
}