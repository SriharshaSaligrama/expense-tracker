import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { api } from 'convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useQuery } from 'convex/react';
import { format } from 'date-fns';
import { sentenceCase } from '@/lib/utils';

export const Route = createFileRoute('/')({
    component: Home,
})

function getMonthName(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleString('default', { month: 'short', year: 'numeric' });
}

const dateRange = {
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    endDate: new Date().toISOString()
};

const dateRange3Months = {
    startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1).toISOString(),
    endDate: new Date().toISOString()
};

function Home() {
    const navigate = useNavigate();

    const statistics = useQuery(api.transactions.stats, {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
    });

    const totalIncome = statistics?.totalIncomeAmount ?? 0;
    const totalExpense = statistics?.totalExpenseAmount ?? 0;
    const balance = statistics?.balanceAmount ?? 0;
    const incomePercentage = statistics?.incomePercentage ?? 0;
    const expensePercentage = statistics?.expensePercentage ?? 0;

    const recent5data = useQuery(api.transactions.listRecent5, {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
    });

    const recent5Transactions = recent5data ?? [];

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

    // Pie chart data
    const pieData = [
        { name: `Income (${incomePercentage.toFixed(2)}%)`, value: totalIncome },
        { name: `Expense (${expensePercentage.toFixed(2)}%)`, value: totalExpense },
    ];
    const COLORS = ['#22c55e', '#ef4444'];

    return (
        <div className=" flex flex-col gap-8">
            <h6 className="text-xl font-bold">Stats this month - {format(dateRange.startDate, 'dd MMM yyyy')} to {format(dateRange.endDate, 'dd MMM yyyy')}</h6>
            <div className="flex flex-col md:flex-row gap-6">
                <Card className="flex-1 bg-green-50">
                    <CardHeader>
                        <CardTitle className="text-green-700">Total Income</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">₹{totalIncome}</div>
                    </CardContent>
                </Card>
                <Card className="flex-1 bg-red-50">
                    <CardHeader>
                        <CardTitle className="text-red-700">Total Expense</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-700">₹{totalExpense}</div>
                    </CardContent>
                </Card>
                <Card className="flex-1 bg-blue-50">
                    <CardHeader>
                        <CardTitle className="text-blue-700">Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700">₹{balance}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                <Card className="flex-1">
                    <CardHeader>
                        <CardTitle>Monthly Summary (Last 3 months)</CardTitle>
                    </CardHeader>
                    <CardContent style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="income" fill="#22c55e" name="Income" />
                                <Bar dataKey="expense" fill="#ef4444" name="Expense" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="flex-1">
                    <CardHeader>
                        <CardTitle>Income vs Expense</CardTitle>
                    </CardHeader>
                    <CardContent style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className='cursor-pointer hover:underline' onClick={() => navigate({ to: '/transactions' })}>Recent Transactions</CardTitle>
                </CardHeader>
                <Separator />
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recent5Transactions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">No transactions yet.</TableCell>
                                </TableRow>
                            )}
                            {recent5Transactions.map((t) => (
                                <TableRow key={t._id}>
                                    <TableCell>{sentenceCase(t.name)}</TableCell>
                                    <TableCell>₹{t.amount}</TableCell>
                                    <TableCell>{t.type.charAt(0).toUpperCase() + t.type.slice(1)}</TableCell>
                                    <TableCell>{new Date(t.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
                                    <TableCell>{sentenceCase(t.description)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
