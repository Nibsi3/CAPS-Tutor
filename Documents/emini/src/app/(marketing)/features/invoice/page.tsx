import Link from "next/link"
import { Button } from "@/components/ui/button"
import { IconArrowRight, IconCreditCard, IconClock, IconCheck } from "@tabler/icons-react"

const paymentMethods = [
    { name: "Stripe", logo: "S" },
    { name: "PayPal", logo: "P" },
    { name: "Yoco", logo: "Y" },
    { name: "Payfast", logo: "PF" },
]

const invoiceStats = [
    { label: "Paid", amount: "R 125,000.00", count: "24 invoices", color: "text-green-400" },
    { label: "Pending", amount: "R 18,500.00", count: "5 invoices", color: "text-yellow-400" },
    { label: "Overdue", amount: "R 4,200.00", count: "2 invoices", color: "text-red-400" },
]

export default function InvoiceFeaturePage() {
    return (
        <div className="bg-black">
            {/* Hero Section */}
            <section className="relative py-24 md:py-32 text-center">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent" />
                <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4">
                        <span className="font-serif italic text-white/70">Seamless</span>
                        <br />
                        Invoice
                    </h1>
                    <p className="text-white/50 max-w-xl mx-auto text-lg mb-8">
                        Create and send professional invoices in seconds. Track payments and get paid faster
                        with our streamlined invoicing system.
                    </p>
                    <Button
                        asChild
                        className="bg-white text-black hover:bg-white/90 rounded-full px-8 h-12"
                    >
                        <Link href="/login">
                            Start Invoicing
                            <IconArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </section>

            {/* Invoice Dashboard Mockup */}
            <section className="py-16">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Invoice List */}
                        <div className="border border-white/10 rounded-3xl bg-black/50 overflow-hidden">
                            <div className="p-6 border-b border-white/10">
                                <div className="text-sm font-medium text-white">Invoices</div>
                            </div>
                            <div className="divide-y divide-white/5">
                                {[
                                    { id: "INV-2024-042", client: "Acme Corp", amount: "R 4,500.00", status: "Paid" },
                                    { id: "INV-2024-041", client: "TechStart", amount: "R 2,800.00", status: "Pending" },
                                    { id: "INV-2024-040", client: "DesignCo", amount: "R 6,200.00", status: "Paid" },
                                    { id: "INV-2024-039", client: "MediaHub", amount: "R 1,500.00", status: "Overdue" },
                                    { id: "INV-2024-038", client: "CloudSoft", amount: "R 3,750.00", status: "Paid" },
                                ].map((invoice, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 hover:bg-white/[0.02]">
                                        <div>
                                            <div className="text-sm font-medium text-white">{invoice.id}</div>
                                            <div className="text-xs text-white/50">{invoice.client}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-white">{invoice.amount}</div>
                                            <div className={`text-xs ${invoice.status === "Paid" ? "text-green-400" :
                                                    invoice.status === "Pending" ? "text-yellow-400" : "text-red-400"
                                                }`}>
                                                {invoice.status}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Invoice Preview */}
                        <div className="border border-white/10 rounded-3xl bg-white/[0.02] overflow-hidden">
                            <div className="p-6 border-b border-white/10">
                                <div className="text-sm font-medium text-white">Invoice</div>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="flex justify-between">
                                    <div>
                                        <div className="text-xs text-white/50 uppercase tracking-wider mb-1">Bill to</div>
                                        <div className="text-sm text-white">Acme Corp</div>
                                        <div className="text-xs text-white/50">123 Business St</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-white/50 uppercase tracking-wider mb-1">Amount</div>
                                        <div className="text-2xl font-serif font-bold text-white">R 4,500.00</div>
                                    </div>
                                </div>

                                <div className="border-t border-white/10 pt-4">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-white/50 text-xs uppercase tracking-wider">
                                                <th className="text-left pb-2">Description</th>
                                                <th className="text-right pb-2">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-white">
                                            <tr>
                                                <td className="py-2">Web Design Services</td>
                                                <td className="text-right">R 3,500.00</td>
                                            </tr>
                                            <tr>
                                                <td className="py-2">Hosting (Annual)</td>
                                                <td className="text-right">R 1,000.00</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-white/10">
                                    <div className="text-right">
                                        <div className="text-xs text-white/50 mb-1">Total</div>
                                        <div className="text-xl font-bold text-white">R 4,500.00</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Fast and Easy Section */}
            <section className="py-24 border-t border-white/5">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Fast and easy</h2>
                    <p className="text-white/50 max-w-xl mx-auto mb-12">
                        Connect your favorite payment providers and get paid instantly.
                    </p>

                    <div className="flex items-center justify-center gap-8 mb-12">
                        {paymentMethods.map((method, i) => (
                            <div key={i} className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <span className="text-xl font-bold text-white/70">{method.logo}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-center gap-6 text-sm text-white/50">
                        <div className="flex items-center gap-2">
                            <IconCreditCard className="h-4 w-4" />
                            Multiple payment options
                        </div>
                        <div className="flex items-center gap-2">
                            <IconClock className="h-4 w-4" />
                            Instant notifications
                        </div>
                        <div className="flex items-center gap-2">
                            <IconCheck className="h-4 w-4" />
                            Automatic reconciliation
                        </div>
                    </div>
                </div>
            </section>

            {/* Payment Stats */}
            <section className="py-24 border-t border-white/5">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-4">Track payments and stay organized</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {invoiceStats.map((stat, i) => (
                            <div key={i} className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                                <div className={`text-sm font-medium ${stat.color} mb-2`}>{stat.label}</div>
                                <div className="text-3xl font-serif font-bold text-white mb-1">{stat.amount}</div>
                                <div className="text-sm text-white/50">{stat.count}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
