import Link from "next/link"
import { Button } from "@/components/ui/button"
import { IconArrowRight, IconSparkles, IconCheck, IconX } from "@tabler/icons-react"

const transactions = [
    { date: "Jan 15", description: "Payment from Acme Corp", amount: "+R 4,500.00", matched: true },
    { date: "Jan 14", description: "Office Supplies", amount: "-R 850.00", matched: true },
    { date: "Jan 13", description: "Software Subscription", amount: "-R 299.00", matched: true },
    { date: "Jan 12", description: "Client Lunch Meeting", amount: "-R 450.00", matched: false },
    { date: "Jan 11", description: "Payment from TechStart", amount: "+R 2,800.00", matched: true },
    { date: "Jan 10", description: "Uber Business", amount: "-R 185.00", matched: true },
]

export default function InboxFeaturePage() {
    return (
        <div className="bg-black">
            {/* Hero Section */}
            <section className="relative py-24 md:py-32 text-center">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent" />
                <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4">
                        <span className="font-serif italic text-white/70">Magic</span>
                        <br />
                        Inbox
                    </h1>
                    <p className="text-white/50 max-w-xl mx-auto text-lg mb-8">
                        Automatically match receipts and transactions. Let AI handle the tedious work
                        while you focus on growing your business.
                    </p>
                    <Button
                        asChild
                        className="bg-white text-black hover:bg-white/90 rounded-full px-8 h-12"
                    >
                        <Link href="/login">
                            Try Magic Inbox
                            <IconArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </section>

            {/* Inbox Mockup */}
            <section className="py-16">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Email/Receipt List */}
                        <div className="lg:col-span-2 border border-white/10 rounded-3xl bg-black/50 overflow-hidden">
                            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                                <div className="text-sm font-medium text-white">Inbox</div>
                                <div className="flex items-center gap-2 text-xs text-white/50">
                                    <IconSparkles className="h-4 w-4 text-blue-400" />
                                    AI matching enabled
                                </div>
                            </div>
                            <div className="divide-y divide-white/5">
                                {[
                                    { from: "Takealot", subject: "Your order receipt", time: "10:30 AM", matched: true },
                                    { from: "Uber", subject: "Trip receipt", time: "Yesterday", matched: true },
                                    { from: "Amazon AWS", subject: "Monthly invoice", time: "2 days ago", matched: true },
                                    { from: "Woolworths", subject: "Purchase confirmation", time: "3 days ago", matched: false },
                                    { from: "Microsoft 365", subject: "Subscription renewal", time: "1 week ago", matched: true },
                                ].map((email, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] cursor-pointer">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                            <span className="text-sm font-medium text-white">{email.from[0]}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-white">{email.from}</span>
                                                {email.matched && (
                                                    <IconCheck className="h-4 w-4 text-green-400" />
                                                )}
                                            </div>
                                            <div className="text-sm text-white/50 truncate">{email.subject}</div>
                                        </div>
                                        <div className="text-xs text-white/40">{email.time}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Receipt Preview */}
                        <div className="border border-white/10 rounded-3xl bg-white overflow-hidden">
                            <div className="p-6">
                                <div className="text-center mb-6">
                                    <div className="text-2xl font-bold text-gray-900">TAKEALOT</div>
                                    <div className="text-xs text-gray-500 mt-1">Tax Invoice</div>
                                </div>
                                <div className="text-xs text-gray-600 space-y-2 mb-6">
                                    <div className="flex justify-between">
                                        <span>Order Date:</span>
                                        <span>15 Jan 2024</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Order #:</span>
                                        <span>TAK-2024-001234</span>
                                    </div>
                                </div>
                                <div className="border-t border-gray-200 pt-4 space-y-2">
                                    <div className="flex justify-between text-xs text-gray-600">
                                        <span>Office Chair</span>
                                        <span>R 2,499.00</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-600">
                                        <span>Desk Lamp</span>
                                        <span>R 349.00</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-600">
                                        <span>Delivery</span>
                                        <span>R 0.00</span>
                                    </div>
                                </div>
                                <div className="border-t border-gray-200 mt-4 pt-4">
                                    <div className="flex justify-between font-bold text-gray-900">
                                        <span>Total</span>
                                        <span>R 2,848.00</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Auto Reconciliation */}
            <section className="py-24 border-t border-white/5">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Automatic reconciliation</h2>
                    <p className="text-white/50 max-w-xl mx-auto mb-12">
                        Our AI automatically matches receipts to bank transactions, saving you hours of manual work.
                    </p>

                    <div className="flex items-center justify-center gap-8">
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                            <div className="text-4xl font-serif font-bold text-white mb-2">95%</div>
                            <div className="text-sm text-white/50">Auto-match rate</div>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                            <div className="text-4xl font-serif font-bold text-white mb-2">10hrs</div>
                            <div className="text-sm text-white/50">Saved per month</div>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                            <div className="text-4xl font-serif font-bold text-white mb-2">0</div>
                            <div className="text-sm text-white/50">Errors per month</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Transaction Table */}
            <section className="py-24 border-t border-white/5">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-4">Keep track and find what you need</h2>
                    </div>

                    <div className="border border-white/10 rounded-3xl bg-black/50 overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/50">
                                    <th className="text-left p-4">Date</th>
                                    <th className="text-left p-4">Description</th>
                                    <th className="text-right p-4">Amount</th>
                                    <th className="text-center p-4">Matched</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {transactions.map((tx, i) => (
                                    <tr key={i} className="hover:bg-white/[0.02]">
                                        <td className="p-4 text-sm text-white/50">{tx.date}</td>
                                        <td className="p-4 text-sm text-white">{tx.description}</td>
                                        <td className={`p-4 text-sm text-right ${tx.amount.startsWith("+") ? "text-green-400" : "text-white"
                                            }`}>
                                            {tx.amount}
                                        </td>
                                        <td className="p-4 text-center">
                                            {tx.matched ? (
                                                <IconCheck className="h-5 w-5 text-green-400 mx-auto" />
                                            ) : (
                                                <IconX className="h-5 w-5 text-white/30 mx-auto" />
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    )
}
