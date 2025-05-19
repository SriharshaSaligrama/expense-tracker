import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';
import { convexQuery } from '@convex-dev/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const Route = createFileRoute('/')({
    component: Home,
})

function getMonthName(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleString('default', { month: 'short', year: 'numeric' });
}

function Home() {
    const { data: transactionsData } = useSuspenseQuery(convexQuery(api.transactions.list, { page: 1, pageSize: 1000, type: 'all' }));
    const transactions = transactionsData?.items ?? [];

    // Analytics calculations
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    // Monthly summary
    const monthlyMap: Record<string, { income: number, expense: number }> = {};
    transactions.forEach(t => {
        const month = getMonthName(t.date);
        if (!monthlyMap[month]) monthlyMap[month] = { income: 0, expense: 0 };
        if (t.type === 'income') monthlyMap[month].income += t.amount;
        else monthlyMap[month].expense += t.amount;
    });
    const monthlyData = Object.entries(monthlyMap).map(([month, v]) => ({ month, ...v }));

    // Pie chart data
    const pieData = [
        { name: 'Income', value: totalIncome },
        { name: 'Expense', value: totalExpense },
    ];
    const COLORS = ['#22c55e', '#ef4444'];

    // Recent transactions
    const recent = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    return (
        <div className="p-6 flex flex-col gap-8">
            <div className="flex flex-col md:flex-row gap-6">
                <Card className="flex-1 bg-green-50">
                    <CardHeader>
                        <CardTitle className="text-green-700">Total Income</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">₹{totalIncome.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card className="flex-1 bg-red-50">
                    <CardHeader>
                        <CardTitle className="text-red-700">Total Expense</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-700">₹{totalExpense.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card className="flex-1 bg-blue-50">
                    <CardHeader>
                        <CardTitle className="text-blue-700">Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700">₹{balance.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                <Card className="flex-1">
                    <CardHeader>
                        <CardTitle>Monthly Summary</CardTitle>
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
                    <CardTitle>Recent Transactions</CardTitle>
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
                            {recent.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">No transactions yet.</TableCell>
                                </TableRow>
                            )}
                            {recent.map((t) => (
                                <TableRow key={t._id}>
                                    <TableCell>{t.name}</TableCell>
                                    <TableCell>₹{t.amount}</TableCell>
                                    <TableCell>{t.type.charAt(0).toUpperCase() + t.type.slice(1)}</TableCell>
                                    <TableCell>{new Date(t.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
                                    <TableCell>{t.description}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
