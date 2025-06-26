import { SearchParams } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import { debounce } from "lodash";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

export function useHandleSearch({ searchInput }: { searchInput?: string }) {
    const navigate = useNavigate();

    const [searchValue, setSearchValue] = useState(searchInput ?? '');
    const [isPending, startTransition] = useTransition();

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

    return {
        searchValue,
        isPending,

        handleSearch,
        clearSearch,
        updateSearchParams,
    }
}

export function useHandleDates({
    startDate,
    endDate,
    updateSearchParams
}: {
    startDate?: string;
    endDate?: string,
    updateSearchParams: (updates: Partial<SearchParams>) => void
}) {
    const [draftStartDate, setDraftStartDate] = useState<Date | undefined>(startDate ? new Date(startDate) : undefined);
    const [draftEndDate, setDraftEndDate] = useState<Date | undefined>(endDate ? new Date(endDate) : undefined);

    useEffect(() => {
        setDraftStartDate(startDate ? new Date(startDate) : undefined);
        setDraftEndDate(endDate ? new Date(endDate) : undefined);
    }, [startDate, endDate]);

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

    return {
        draftStartDate,
        draftEndDate,
        handleDateChange
    }
}
