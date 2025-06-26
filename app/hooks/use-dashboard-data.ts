import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";

export const dateRange = {
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    endDate: new Date().toISOString()
};

const dateRange3Months = {
    startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1).toISOString(),
    endDate: new Date().toISOString()
};

function getMonthName(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleString('default', { month: 'short', year: 'numeric' });
}

export function useDashboardStats() {
    const statistics = useQuery(api.transactions.stats, {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
    });

    const totalIncome = statistics?.totalIncomeAmount ?? 0;
    const totalExpense = statistics?.totalExpenseAmount ?? 0;
    const balance = statistics?.balanceAmount ?? 0;
    const incomePercentage = statistics?.incomePercentage ?? 0;
    const expensePercentage = statistics?.expensePercentage ?? 0;

    // Pie chart data
    const pieData = [
        { name: `Income (${incomePercentage.toFixed(2)}%)`, value: totalIncome },
        { name: `Expense (${expensePercentage.toFixed(2)}%)`, value: totalExpense },
    ];

    return {
        totalIncome,
        totalExpense,
        balance,

        pieData
    };
}

export function useRecentTransactions() {
    const recent5data = useQuery(api.transactions.listRecent5, {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
    });

    const recent5Transactions = recent5data ?? [];

    return { recent5Transactions };
}

export function useTransactions3Months() {
    const transactions3MonthsData = useQuery(api.transactions.list, {
        startDate: dateRange3Months.startDate,
        endDate: dateRange3Months.endDate
    });

    const transactions3Months = transactions3MonthsData ?? [];

    // Monthly summary
    const monthlyMap: Record<string, { income: number, expense: number }> = {};

    transactions3Months.forEach(t => {
        const month = getMonthName(t.date);
        if (!monthlyMap[month]) monthlyMap[month] = { income: 0, expense: 0 };
        if (t.type === 'income') monthlyMap[month].income += t.amount;
        else monthlyMap[month].expense += t.amount;
    });

    const monthlyData = Object.entries(monthlyMap).map(([month, v]) => ({ month, ...v }));

    return { monthlyData };
}