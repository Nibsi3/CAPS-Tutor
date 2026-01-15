"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter, Download, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { Input } from "@/components/ui/input"

const transactions = [
    {
        id: "tx-728ed1",
        date: "2024-01-14",
        description: "Stripe Subscription",
        category: "Income",
        amount: "+$99.00",
        status: "Completed",
    },
    {
        id: "tx-482a93",
        date: "2024-01-13",
        description: "Vercel Hosting",
        category: "Marketing",
        amount: "-$20.45",
        status: "Completed",
    },
    {
        id: "tx-291b54",
        date: "2024-01-12",
        description: "Coffee Shop",
        category: "Meals",
        amount: "-$4.50",
        status: "Pending",
    },
]

export default function TransactionsPage() {
    return (
        <div className="flex flex-col gap-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-serif">Transactions</h1>
                    <p className="text-muted-foreground">Keep track of your spending and income across all accounts.</p>
                </div>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search transactions..." className="pl-10" />
                </div>
                <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                </Button>
            </div>

            <Card className="overflow-hidden border-none shadow-none bg-transparent">
                <CardContent className="p-0">
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-y bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Date</th>
                                    <th className="px-6 py-4 font-medium">Description</th>
                                    <th className="px-6 py-4 font-medium">Category</th>
                                    <th className="px-6 py-4 font-medium">Amount</th>
                                    <th className="px-6 py-4 font-medium text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y border-b">
                                {transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4 text-muted-foreground">{tx.date}</td>
                                        <td className="px-6 py-4 font-medium">{tx.description}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{tx.category}</td>
                                        <td className={`px-6 py-4 font-semibold ${tx.amount.startsWith('+') ? 'text-green-600' : 'text-foreground'}`}>
                                            <span className="flex items-center gap-1">
                                                {tx.amount.startsWith('+') ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownLeft className="h-3 w-3" />}
                                                {tx.amount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${tx.status === 'Completed' ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'
                                                }`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
