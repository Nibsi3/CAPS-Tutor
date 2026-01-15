import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
    IconFileInvoice,
    IconFolder,
    IconSparkles,
    IconArrowRight,
    IconCheck,
    IconLayoutDashboard,
    IconMail,
    IconWallet,
    IconFileExport,
} from "@tabler/icons-react"

const stats = [
    { label: "Invoices sent", value: "15,000+" },
    { label: "Active users", value: "2,500+" },
    { label: "Transactions", value: "1.2M" },
    { label: "Total value", value: "R412M" },
]

const invoicingFeatures = [
    "Create Customers",
    "Add VAT & Sales tax",
    "Add discount",
    "Add Logo",
    "Send web invoices",
    "Export as PDF",
    "See if invoice is viewed",
]

const inboxFeatures = [
    "Personalized email",
    "Smart search receipts and invoices content",
    "Automatically saves invoices and receipt in your vault",
]

export default function LandingPage() {
    return (
        <div className="bg-black font-sans text-white">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center overflow-hidden">
                <div className="relative mx-auto max-w-7xl px-6 lg:px-8 w-full pt-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 text-sm text-white/50 mb-6">
                                <span className="text-white/70">Emini v1.1</span>
                                <IconArrowRight className="h-4 w-4" />
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-[60px] leading-[1.2] text-[#fafafa] mb-8 font-sans font-medium">
                                Invoicing & Finance for South Africa,{" "}
                                <span className="text-[#878787]">that simplifies your business.</span>
                            </h1>

                            <div className="flex flex-col sm:flex-row gap-4 mb-12">
                                <Button
                                    asChild
                                    variant="outline"
                                    className="rounded-lg px-8 h-12 border-white/20 text-white hover:bg-white/5 font-sans"
                                >
                                    <Link href="/login">Get Started</Link>
                                </Button>
                            </div>

                            <p className="text-sm text-[#878787] mb-12 font-sans">
                                14 day trial (No credit card required)
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-white/5">
                                {stats.map((stat, i) => (
                                    <div key={i}>
                                        <div className="text-[10px] uppercase tracking-wider text-[#878787] mb-1 font-sans">
                                            {stat.label}
                                        </div>
                                        <div className="text-xl font-medium text-[#fafafa]">
                                            {stat.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div
                                className="relative"
                                style={{
                                    transform: "perspective(1200px) rotateY(-12deg) rotateX(4deg)",
                                    transformOrigin: "center center",
                                }}
                            >
                                <div className="border border-white/10 rounded-2xl bg-[#0a0a0a] overflow-hidden shadow-2xl">
                                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/10" />
                                            <div className="text-sm text-white/80">Morning, <span className="font-serif italic text-white">User</span></div>
                                        </div>
                                    </div>
                                    <div className="p-8">
                                        <div className="text-4xl font-serif text-white mb-8">R 5,278.50</div>
                                        <div className="h-32 flex items-end gap-1.5 mb-8">
                                            {[20, 35, 25, 50, 30, 45, 40, 60, 50, 65, 40, 75, 55, 70, 60, 80].map((h, i) => (
                                                <div key={i} className="flex-1 bg-white/[0.08] rounded-t hover:bg-white/20 transition-colors" style={{ height: `${h}%` }} />
                                            ))}
                                        </div>
                                        <div className="space-y-3">
                                            {[
                                                { client: "Acme Corp", amount: "R 2,500.00", status: "Paid" },
                                                { client: "TechStart", amount: "R 1,800.00", status: "Pending" },
                                            ].map((invoice, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                                    <span className="text-sm text-white/60">{invoice.client}</span>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-sm text-white">{invoice.amount}</span>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-wider ${invoice.status === "Paid" ? "bg-white/10 text-white/80" : "bg-white/5 text-white/40"
                                                            }`}>
                                                            {invoice.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Everything you need - Boxed Sections */}
            <section className="py-24 border-t border-white/5">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mb-16">
                        <h2 className="text-[60px] font-medium text-[#fafafa] mb-4 font-sans leading-none">Everything you need</h2>
                        <p className="text-[#878787] text-lg font-sans">From automated invoicing to conversing with your financials and consolidating all your files.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {/* Financial Overview - Large Box */}
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
                            <div className="p-8 lg:p-12 bg-zinc-950/50 flex items-center justify-center border-r border-white/5">
                                <div className="relative w-full max-w-md aspect-video rounded-xl border border-white/10 bg-black overflow-hidden shadow-2xl">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                                    <div className="p-4 border-b border-white/5">
                                        <div className="w-1/3 h-2 bg-white/10 rounded" />
                                    </div>
                                    <div className="p-8 flex flex-col justify-center h-full">
                                        <div className="text-2xl font-serif text-white mb-2">R 19,548.52</div>
                                        <div className="h-24 flex items-end gap-1">
                                            {[30, 50, 40, 70, 45, 60, 55, 80, 60, 75].map((h, i) => (
                                                <div key={i} className="flex-1 bg-white/10 rounded-t" style={{ height: `${h}%` }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 lg:p-12 flex flex-col justify-center">
                                <h3 className="text-2xl font-medium text-white mb-6">Financial overview</h3>
                                <p className="text-[#878787] text-sm mb-8 leading-relaxed">
                                    Keep tabs on your expenses and income, and gain a clearer picture of your business's financial track record and current situation.
                                </p>
                                <ul className="space-y-4">
                                    {["Revenue", "Burnrate", "Expenses", "Unified currency overview across all your accounts"].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm text-white/80">
                                            <IconCheck className="h-4 w-4 text-white/40" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Invoicing & Inbox - Two Boxes */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Invoicing */}
                            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 lg:p-12 relative overflow-hidden">
                                <h3 className="text-2xl font-medium text-white mb-6">Invoicing</h3>
                                <p className="text-[#878787] text-sm mb-8 leading-relaxed">
                                    Create and send invoices to your customers, monitor your sent balance, track overdue payments and send reminders.
                                </p>
                                <ul className="space-y-4 mb-12">
                                    {invoicingFeatures.map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm text-white/80">
                                            <IconCheck className="h-4 w-4 text-white/40" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/features/invoice" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
                                    Send your first invoice in seconds
                                    <IconArrowRight className="h-4 w-4" />
                                </Link>

                                {/* Invoice Mini Preview float */}
                                <div className="absolute bottom-0 right-0 w-64 h-64 translate-x-12 translate-y-12 opacity-50">
                                    <div className="w-full h-full bg-white rounded-t-xl p-4 shadow-2xl">
                                        <div className="w-1/2 h-4 bg-zinc-200 rounded mb-4" />
                                        <div className="space-y-2">
                                            <div className="w-full h-2 bg-zinc-100 rounded" />
                                            <div className="w-full h-2 bg-zinc-100 rounded" />
                                            <div className="w-2/3 h-2 bg-zinc-100 rounded" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Inbox */}
                            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 lg:p-12">
                                <h3 className="text-2xl font-medium text-white mb-6">Inbox</h3>
                                <p className="text-[#878787] text-sm mb-8 leading-relaxed">
                                    Use your personalized email address for your invoices and receipts. Emini gives you a transaction suggestion to match it with.
                                </p>
                                <ul className="space-y-4 mb-12">
                                    {inboxFeatures.map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm text-white/80">
                                            <IconCheck className="h-4 w-4 text-white/40" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Reorganized Vault Section */}
            <section className="py-24 border-t border-white/5">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Folder cards */}
                        <div className="lg:col-span-1 space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                {["Company", "Contracts", "Office"].map((folder, i) => (
                                    <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                                            <IconFolder className="h-5 w-5 text-white/30" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-white">{folder}</div>
                                            <div className="text-[10px] text-[#878787]">89.17 kb</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2 pt-4">
                                {["Exports", "Brand.jpeg", "Client.txt"].map((file, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-colors">
                                        <IconFolder className="h-4 w-4 text-white/20" />
                                        <div className="flex-1">
                                            <div className="text-sm text-white/70">{file}</div>
                                            <div className="text-[10px] text-[#878787]">89.17 kb</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Vault Main Info */}
                        <div className="lg:col-span-2 p-8 lg:p-12 flex flex-col justify-center">
                            <h2 className="text-3xl font-medium text-white mb-6">Vault</h2>
                            <p className="text-[#878787] text-sm mb-6 max-w-md">Store your files securely in Emini.</p>
                            <p className="text-[#878787] text-sm mb-8 leading-relaxed max-w-md">
                                There's no need to scramble for things across different drives. Keep all of your files, such as contracts and agreements safe in one place.
                            </p>
                            <ul className="space-y-4 mb-10">
                                {["Automatic classification of documents for easy search & find", "Smart search"].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-white/80">
                                        <IconCheck className="h-4 w-4 text-white/40" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <Link href="/features/vault" className="text-sm text-white/50 hover:text-white inline-flex items-center gap-2">
                                Centralize Your Files now
                                <IconArrowRight className="h-3 w-3" />
                            </Link>
                        </div>

                        {/* Seamless export Box */}
                        <div className="lg:col-span-1 p-8 rounded-2xl bg-[#0a0a0a] border border-white/10 flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-medium text-white mb-4">Seamless export</h3>
                                <p className="text-[#878787] text-xs leading-relaxed mb-8">
                                    Take the hassle out of preparing exports for your accountant. Just select any time period or transaction you want and hit export.
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                <div className="flex items-center gap-3 text-sm text-white/70">
                                    <div className="w-4 h-4 rounded-full border border-white/20 border-t-white/80 animate-spin" />
                                    Exporting transactions
                                </div>
                                <div className="text-[10px] text-[#878787] mt-2">Please do not close browser until completed</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
