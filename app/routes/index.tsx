import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { sentenceCase } from '@/lib/utils';
import { dateRange, useDashboardStats, useRecentTransactions, useTransactions3Months } from '@/hooks/use-dashboard-data';

export const Route = createFileRoute('/')({
    component: Home,
})

const COLORS = ['#22c55e', '#ef4444'];

function Home() {
    const navigate = useNavigate();

    const {
        totalIncome,
        totalExpense,
        balance,
        pieData
    } = useDashboardStats();

    const { recent5Transactions } = useRecentTransactions();

    const { monthlyData } = useTransactions3Months();

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
