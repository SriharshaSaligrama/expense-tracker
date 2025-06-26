import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { SearchParams } from "@/types";

export function TransactionFilters({
    type,
    updateSearchParams,
    isPending,
    draftStartDate,
    draftEndDate,
    handleDateChange,
    initialDateRange,
    searchValue,
    handleSearch,
    clearSearch,
    today
}: {
    type: string;
    updateSearchParams: (params: Partial<SearchParams>) => void;
    isPending: boolean;
    draftStartDate: Date | undefined;
    draftEndDate: Date | undefined;
    handleDateChange: (start: Date | undefined, end: Date | undefined) => void;
    initialDateRange: { startDate: Date; endDate: Date };
    searchValue: string;
    handleSearch: (value: string) => void;
    clearSearch: () => void;
    today: Date;
}) {
    return <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
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
}