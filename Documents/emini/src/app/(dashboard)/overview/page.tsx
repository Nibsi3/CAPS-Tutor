"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    IconTrendingUp,
    IconWallet,
    IconCalendarStats,
    IconChartBar,
    IconClock,
    IconReceipt,
    IconUsers,
    IconLayoutGrid,
    IconFileAnalytics,
    IconArrowUpRight,
    IconPlus,
    IconSparkles,
    IconChevronDown
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import React, { useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { calculateMetrics } from "@/lib/metrics"
import { toast } from "sonner"

export default function DashboardPage() {
    const [view, setView] = useState<"overview" | "metrics">("overview");
    const [period, setPeriod] = useState("1 year");
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Real metrics state
    const metrics = calculateMetrics();

    const handleChatSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query.trim() || isLoading) return;

        setIsLoading(true);
        const userQuery = query;
        setQuery("");

        try {
            const response = await fetch("/api/assistant", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [{ role: "user", content: userQuery }]
                })
            });

            if (!response.ok) throw new Error("Failed to call assistant");

            const data = await response.json();
            toast.success("Emini Assistant", {
                description: data.content,
                duration: 10000,
            });
        } catch (error) {
            toast.error("Assistant Error", {
                description: "Failed to process your request."
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col gap-y-6 animate-in fade-in duration-700 pb-32 font-serif -mt-6">
            {/* Header: Greeting (Left) & Controls (Right) */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
                <div className="flex flex-col gap-y-1">
                    <h1 className="text-3xl font-serif font-bold tracking-tight italic">Afternoon <span className="text-muted-foreground not-italic">Cameron,</span></h1>
                    <p className="text-muted-foreground text-xs font-sans tracking-wide">here's a quick look at how things are going.</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-[#0c0c0c] border border-white/10 p-1">
                        <Button
                            variant="ghost"
                            onClick={() => setView("overview")}
                            className={cn(
                                "h-7 px-4 rounded-none text-[8px] uppercase font-bold tracking-widest transition-all",
                                view === "overview" ? "bg-white text-black" : "text-muted-foreground hover:text-white"
                            )}
                        >
                            Overview
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setView("metrics")}
                            className={cn(
                                "h-7 px-4 rounded-none text-[8px] uppercase font-bold tracking-widest transition-all",
                                view === "metrics" ? "bg-white text-black" : "text-muted-foreground hover:text-white"
                            )}
                        >
                            Metrics
                        </Button>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="flex items-center gap-2 px-3 h-9 bg-[#0c0c0c] border border-white/10 rounded-none text-[9px] uppercase font-bold tracking-widest text-white cursor-pointer hover:bg-white/5 transition-colors">
                                <IconCalendarStats className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{period}</span>
                                <IconChevronDown className="h-3 w-3 opacity-50" />
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#0b0b0b] border-white/10 rounded-none text-white w-48 p-2 shadow-2xl">
                            <DropdownMenuLabel className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground px-2 py-1">Period</DropdownMenuLabel>
                            {["3 months", "6 months", "1 year", "2 years", "5 years", "Fiscal year", "Custom"].map((p) => (
                                <DropdownMenuItem
                                    key={p}
                                    onClick={() => setPeriod(p)}
                                    className="text-xs focus:bg-white/5 px-2 py-2 rounded-none flex items-center justify-between cursor-pointer"
                                >
                                    <span>{p}</span>
                                    {period === p && <div className="h-1 w-1 bg-white rounded-full" />}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {view === "overview" ? (
                /* Compact Overview Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-white/5 border border-white/5 rounded-none overflow-hidden">
                    {/* Grid items use #0c0c0c */}
                    <Card className="bg-[#0c0c0c] border-none rounded-none p-6 hover:bg-white/[0.01] transition-colors group h-[220px]">
                        <div className="flex flex-col justify-between h-full">
                            <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-bold text-muted-foreground">
                                <IconClock className="h-3 w-3" />
                                Cash Runway
                            </div>
                            <div className="space-y-2">
                                <div className="text-[11px] text-muted-foreground">Your cash runway in months</div>
                                <div className="text-3xl font-serif font-bold tracking-tight italic">{metrics.runway}</div>
                                <Button variant="ghost" className="p-0 h-auto text-[9px] uppercase font-bold text-muted-foreground/50 hover:bg-transparent hover:text-white transition-colors">View runway</Button>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-[#0c0c0c] border-none rounded-none p-6 hover:bg-white/[0.01] transition-colors group h-[220px]">
                        <div className="flex flex-col justify-between h-full">
                            <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-bold text-muted-foreground">
                                <IconWallet className="h-3 w-3" />
                                Cash Flow
                            </div>
                            <div className="space-y-2">
                                <div className="text-[11px] text-muted-foreground">Net cash position - {period}</div>
                                <div className="text-3xl font-serif font-bold tracking-tight italic">ZAR {metrics.cashFlow.toLocaleString()}</div>
                                <Button variant="ghost" className="p-0 h-auto text-[9px] uppercase font-bold text-muted-foreground/50 hover:bg-transparent hover:text-white transition-colors">View analysis</Button>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-[#0c0c0c] border-none rounded-none p-6 hover:bg-white/[0.01] transition-colors group h-[220px]">
                        <div className="flex flex-col justify-between h-full">
                            <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-bold text-muted-foreground">
                                <IconWallet className="h-3 w-3" />
                                Account Balances
                            </div>
                            <div className="space-y-2">
                                <div className="text-[11px] text-muted-foreground">No accounts connected</div>
                                <div className="text-3xl font-serif font-bold tracking-tight italic">ZAR 0</div>
                                <Button variant="ghost" className="p-0 h-auto text-[9px] uppercase font-bold text-muted-foreground/50 hover:bg-transparent hover:text-white transition-colors">View balances</Button>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-[#0c0c0c] border-none rounded-none p-6 hover:bg-white/[0.01] transition-colors group h-[220px]">
                        <div className="flex flex-col justify-between h-full">
                            <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-bold text-muted-foreground">
                                <IconTrendingUp className="h-3 w-3" />
                                Profit & Loss
                            </div>
                            <div className="space-y-2">
                                <div className="text-3xl font-serif font-bold tracking-tight truncate italic">ZAR {metrics.revenue.toLocaleString()}</div>
                                <div className="text-[9px] uppercase font-bold text-muted-foreground/50">{period} · Net</div>
                                <Button variant="ghost" className="p-0 h-auto text-[9px] uppercase font-bold text-muted-foreground/50 hover:bg-transparent hover:text-white transition-colors block mt-2">See detailed analysis</Button>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-[#0c0c0c] border-none rounded-none p-6 hover:bg-white/[0.01] transition-colors group h-[220px]">
                        <div className="flex flex-col h-full justify-between">
                            <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-bold text-muted-foreground">
                                <IconChartBar className="h-3 w-3" />
                                Forecast
                            </div>
                            <div className="space-y-4">
                                <div className="text-[11px] text-muted-foreground">Revenue projection</div>
                                <div className="h-px w-full bg-white/10" />
                                <div className="text-[11px] font-bold">Next month <span className="text-primary ml-2">+ZAR 0.00</span></div>
                                <Button variant="ghost" className="p-0 h-auto text-[9px] uppercase font-bold text-muted-foreground/50 hover:bg-transparent hover:text-white transition-colors">View forecast</Button>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-[#0c0c0c] border-none rounded-none p-6 hover:bg-white/[0.01] transition-colors group h-[220px]">
                        <div className="flex flex-col justify-between h-full">
                            <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-bold text-muted-foreground">
                                <IconChartBar className="h-3 w-3" />
                                Revenue Summary
                            </div>
                            <div className="space-y-2">
                                <div className="text-[11px] text-muted-foreground">Net revenue - {period}</div>
                                <div className="text-3xl font-serif font-bold tracking-tight italic">ZAR {metrics.revenue.toLocaleString()}</div>
                                <Button variant="ghost" className="p-0 h-auto text-[9px] uppercase font-bold text-muted-foreground/50 hover:bg-transparent hover:text-white transition-colors">View trends</Button>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-[#0c0c0c] border-none rounded-none p-6 hover:bg-white/[0.01] transition-colors group h-[220px]">
                        <div className="flex flex-col justify-between h-full">
                            <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-bold text-muted-foreground">
                                <IconTrendingUp className="h-3 w-3" />
                                Growth Rate
                            </div>
                            <div className="space-y-2">
                                <div className="text-[11px] text-muted-foreground">Net growth - {period}</div>
                                <div className="text-3xl font-serif font-bold tracking-tight italic">{metrics.growth.toFixed(1)}%</div>
                                <Button variant="ghost" className="p-0 h-auto text-[9px] uppercase font-bold text-muted-foreground/50 hover:bg-transparent hover:text-white transition-colors">View growth analysis</Button>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-[#0c0c0c] border-none rounded-none p-6 hover:bg-white/[0.01] transition-colors group h-[220px]">
                        <div className="flex flex-col justify-between h-full">
                            <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-bold text-muted-foreground">
                                <IconUsers className="h-3 w-3" />
                                Customer Value
                            </div>
                            <div className="space-y-3 pt-2">
                                <div className="text-2xl font-serif font-bold tracking-tight italic">ZAR {metrics.clv.toLocaleString()} <span className="text-[8px] uppercase font-bold text-muted-foreground font-sans ml-1 not-italic">avg. CLV</span></div>
                                <div className="space-y-1 pt-2">
                                    <div className="flex justify-between text-[9px] uppercase text-muted-foreground"><span>Total</span><span className="text-white">1</span></div>
                                    <div className="flex justify-between text-[9px] uppercase text-muted-foreground"><span>Active</span><span className="text-white">1 (100%)</span></div>
                                </div>
                                <Button variant="ghost" className="p-0 h-auto text-[9px] uppercase font-bold text-muted-foreground/50 hover:bg-transparent hover:text-white transition-colors">View all</Button>
                            </div>
                        </div>
                    </Card>
                </div>
            ) : (
                /* Metrics View (Charts Placeholder) */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0d0d0d]">
                    {[
                        "Net Revenue", "Monthly Burn Rate", "Monthly Expenses",
                        "Profit & Loss", "Revenue Forecast", "Runway", "Expense Breakdown"
                    ].map((title) => (
                        <Card key={title} className="bg-[#0c0c0c] border border-white/5 rounded-none p-8 min-h-[350px]">
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{title === "Runway" ? "Runway" : "Revenue"}</span>
                                    <h3 className="text-3xl font-serif font-bold italic">ZAR 0</h3>
                                    {title === "Net Revenue" && (
                                        <div className="flex gap-4 mt-2">
                                            <div className="flex items-center gap-2"><div className="h-1 w-1 bg-white rounded-full" /><span className="text-[10px] text-muted-foreground">This Year</span></div>
                                            <div className="flex items-center gap-2"><div className="h-1 w-1 bg-white/20 rounded-full" /><span className="text-[10px] text-muted-foreground">Last Year</span></div>
                                            <div className="flex items-center gap-2"><div className="h-1 w-1 bg-primary rounded-full" /><span className="text-[10px] text-muted-foreground">Average</span></div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-h-[200px] flex items-end justify-between border-b border-white/5 pb-2">
                                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan"].map((m) => (
                                        <div key={m} className="flex flex-col items-center gap-2">
                                            <div className="w-[1px] h-32 border-l border-dashed border-white/5" />
                                            <span className="text-[8px] text-muted-foreground">{m}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* AI Assistant Chat Input - Fixed at Bottom (Pic 3) */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 z-40">
                {/* Action Buttons Row */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                    {[
                        { label: "Burn rate analysis", icon: IconChartBar },
                        { label: "Latest transactions", icon: IconLayoutGrid },
                        { label: "Expense Breakdown", icon: IconFileAnalytics },
                        { label: "Balance Sheet", icon: IconFileAnalytics },
                        { label: "Spending Analysis", icon: IconTrendingUp },
                        { label: "Runway", icon: IconClock },
                    ].map((action) => (
                        <Button key={action.label} variant="outline" className="h-11 rounded-none px-6 bg-[#0c0c0c] border border-white/10 hover:bg-white/5 hover:border-white/20 text-[10px] uppercase font-bold tracking-[0.2em] space-x-2.5 transition-all shadow-xl">
                            <action.icon className="h-4 w-4 text-muted-foreground" />
                            <span className="whitespace-nowrap">{action.label}</span>
                        </Button>
                    ))}
                </div>

                <form onSubmit={handleChatSubmit} className="bg-[#0d0d0d]/90 backdrop-blur-2xl border border-white/10 p-3 shadow-2xl flex items-center gap-4 group focus-within:border-white/20 transition-all rounded-none min-h-[72px]">
                    <div className="p-3 text-muted-foreground group-focus-within:text-white transition-colors">
                        <IconSparkles className={cn("h-5 w-5", isLoading && "animate-pulse text-primary")} />
                    </div>
                    <input
                        type="text"
                        placeholder="Ask anything..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        disabled={isLoading}
                        className="flex-1 bg-transparent border-none outline-none text-base text-white placeholder:text-muted-foreground/40 disabled:opacity-50"
                    />
                    <div className="flex items-center gap-3 pr-2">
                        <div className="flex items-center gap-1">
                            <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-white hover:bg-white/5 rounded-none">
                                <IconPlus className="h-5 w-5" />
                            </Button>
                            {/* Additional placeholders based on Pic 3 icons */}
                            <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-white hover:bg-white/5 rounded-none">
                                <IconFileAnalytics className="h-5 w-5" />
                            </Button>
                        </div>
                        <Button type="submit" variant="ghost" size="icon" disabled={isLoading} className="h-10 w-10 bg-white text-black hover:bg-neutral-200 rounded-none transition-colors">
                            <IconArrowUpRight className="h-5 w-5" />
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
