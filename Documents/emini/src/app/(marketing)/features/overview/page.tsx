import Link from "next/link"
import { Button } from "@/components/ui/button"
import { IconArrowRight, IconTrendingUp, IconWallet, IconChartBar } from "@tabler/icons-react"

export default function OverviewFeaturePage() {
    return (
        <div className="bg-black">
            {/* Hero Section */}
            <section className="relative py-24 md:py-32 text-center">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent" />
                <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4">
                        <span className="font-serif italic text-white/70">Financial</span>
                        <br />
                        Overview
                    </h1>
                    <p className="text-white/50 max-w-xl mx-auto text-lg mb-8">
                        Track your business income and expenses at a glance.
                        Get a comprehensive view of your financial health with real-time data.
                    </p>
                    <Button
                        asChild
                        className="bg-white text-black hover:bg-white/90 rounded-full px-8 h-12"
                    >
                        <Link href="/login">
                            Get Started
                            <IconArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </section>

            {/* Dashboard Mockup */}
            <section className="py-16">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="relative border border-white/10 rounded-3xl bg-black/50 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />

                        <div className="p-8">
                            {/* Top bar mock */}
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-white/10" />
                                    <div className="text-sm text-white/50">Dashboard</div>
                                </div>
                                <div className="text-sm text-white/50">Jan 2024 - Dec 2024</div>
                            </div>

                            {/* Balance display */}
                            <div className="mb-8">
                                <div className="text-xs uppercase tracking-wider text-white/50 mb-2">Balance</div>
                                <div className="text-5xl font-serif font-bold text-white">R 19,546.58</div>
                            </div>

                            {/* Chart placeholder */}
                            <div className="h-48 border-b border-white/10 mb-8 flex items-end">
                                <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                                    <path
                                        d="M0,150 Q100,120 200,140 T400,100 T600,130 T800,80"
                                        fill="none"
                                        stroke="rgba(255,255,255,0.3)"
                                        strokeWidth="2"
                                    />
                                    <path
                                        d="M0,180 Q100,160 200,170 T400,150 T600,165 T800,140"
                                        fill="none"
                                        stroke="rgba(255,255,255,0.15)"
                                        strokeWidth="2"
                                    />
                                </svg>
                            </div>

                            {/* Stats grid */}
                            <div className="grid grid-cols-3 gap-8">
                                <div>
                                    <div className="text-xs uppercase tracking-wider text-white/50 mb-1">Income</div>
                                    <div className="text-2xl font-serif font-bold text-white">R 245,000</div>
                                    <div className="text-sm text-green-400">+18.2%</div>
                                </div>
                                <div>
                                    <div className="text-xs uppercase tracking-wider text-white/50 mb-1">Expenses</div>
                                    <div className="text-2xl font-serif font-bold text-white">R 128,400</div>
                                    <div className="text-sm text-red-400">+5.1%</div>
                                </div>
                                <div>
                                    <div className="text-xs uppercase tracking-wider text-white/50 mb-1">Spending</div>
                                    <div className="text-2xl font-serif font-bold text-white">R 42,600</div>
                                    <div className="text-sm text-white/50">This month</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Cards */}
            <section className="py-24 border-t border-white/5">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
                            <IconTrendingUp className="h-10 w-10 text-white/70 mb-6" />
                            <h3 className="text-xl font-bold text-white mb-3">Track income</h3>
                            <p className="text-white/50">
                                Monitor all revenue streams in real-time. See where your money is coming from.
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
                            <IconWallet className="h-10 w-10 text-white/70 mb-6" />
                            <h3 className="text-xl font-bold text-white mb-3">Manage expenses</h3>
                            <p className="text-white/50">
                                Keep track of every expense. Categorize and analyze your spending patterns.
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
                            <IconChartBar className="h-10 w-10 text-white/70 mb-6" />
                            <h3 className="text-xl font-bold text-white mb-3">Spending analysis</h3>
                            <p className="text-white/50">
                                Get detailed insights into your spending with beautiful visualizations.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Chart Section */}
            <section className="py-24 border-t border-white/5">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-4">From revenue to spending</h2>
                        <p className="text-white/50">See the complete picture of your business finances.</p>
                    </div>

                    <div className="border border-white/10 rounded-3xl bg-black/50 p-8">
                        <div className="flex items-end justify-center gap-4 h-64">
                            {[
                                { label: "Jan", value: 60 },
                                { label: "Feb", value: 75 },
                                { label: "Mar", value: 45 },
                                { label: "Apr", value: 90 },
                                { label: "May", value: 70 },
                                { label: "Jun", value: 85 },
                                { label: "Jul", value: 65 },
                                { label: "Aug", value: 95 },
                                { label: "Sep", value: 80 },
                                { label: "Oct", value: 70 },
                                { label: "Nov", value: 88 },
                                { label: "Dec", value: 92 },
                            ].map((month, i) => (
                                <div key={i} className="flex flex-col items-center gap-2">
                                    <div
                                        className="w-8 md:w-12 bg-gradient-to-t from-white/20 to-white/40 rounded-t"
                                        style={{ height: `${month.value * 2}px` }}
                                    />
                                    <span className="text-xs text-white/50">{month.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
