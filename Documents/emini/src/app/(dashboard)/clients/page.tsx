"use client"

import { Button } from "@/components/ui/button"
import { Plus, Search, Filter, MoreHorizontal, ChevronDown, Building2, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState } from "react"
import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"

const allClients = [
    {
        id: "1",
        name: "Acme Corp",
        contact: "John Doe",
        email: "billing@acme.com",
        status: "Active",
        totalInvoiced: "ZAR 12,500.00",
        lastActivity: "2 mins ago",
        tags: ["Gold", "Tech"],
        country: "South Africa",
        industry: "Technology",
        revenue: "ZAR 155,000.00",
        outstanding: "ZAR 0.00",
    },
    {
        id: "2",
        name: "Globex Corporation",
        contact: "Hank Scorpio",
        email: "finance@globex.co",
        status: "Active",
        totalInvoiced: "ZAR 8,400.00",
        lastActivity: "1 day ago",
        tags: ["Enterprise"],
        country: "USA",
        industry: "Global Domination",
        revenue: "ZAR 2M",
        outstanding: "ZAR 55,000.00",
    },
]

const customerColumns = [
    { label: "Name", id: "name" },
    { label: "Contact", id: "contact" },
    { label: "Email", id: "email" },
    { label: "Invoices", id: "invoices" },
    { label: "Projects", id: "projects" },
    { label: "Industry", id: "industry" },
    { label: "Country", id: "country" },
    { label: "Finance Email", id: "financeEmail" },
    { label: "Language", id: "language" },
    { label: "Revenue", id: "revenue" },
    { label: "Outstanding", id: "outstanding" },
    { label: "Last Invoice", id: "lastInvoice" },
    { label: "Website", id: "website" },
    { label: "Tags", id: "tags" },
]

export default function ClientsPage() {
    const [visibleColumns, setVisibleColumns] = useState<string[]>([
        "name", "email", "status", "totalInvoiced", "lastActivity", "tags"
    ])

    return (
        <div className="flex flex-col gap-y-10 font-sans px-6 max-w-7xl mx-auto pb-20">
            {/* Header Section */}
            <div>
                <h1 className="text-4xl font-serif text-white tracking-tight italic">Clients</h1>
                <p className="text-neutral-500 mt-1">Manage your customer relationships and detailed billing information.</p>
            </div>

            {/* Filter & Actions Bar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 max-w-md">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500 group-focus-within:text-white transition-colors" />
                        <Input
                            placeholder="Search or filter"
                            className="pl-10 h-11 bg-transparent border-white/5 focus-visible:ring-offset-0 focus-visible:ring-white/10 rounded-none transition-all"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-50 pointer-events-none">
                            <ChevronDown className="h-4 w-4" />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-11 border-white/5 bg-transparent hover:bg-white/5 transition-colors rounded-none">
                                <Filter className="mr-2 h-4 w-4" />
                                Columns
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-black border-white/10 rounded-none">
                            {customerColumns.map(col => (
                                <DropdownMenuCheckboxItem
                                    key={col.id}
                                    checked={visibleColumns.includes(col.id)}
                                    onCheckedChange={(checked) => {
                                        setVisibleColumns(prev =>
                                            checked ? [...prev, col.id] : prev.filter(c => c !== col.id)
                                        )
                                    }}
                                    className="focus:bg-white/5 focus:text-white rounded-none"
                                >
                                    {col.label}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Link href="/clients/new">
                        <Button className="h-11 bg-white text-black hover:bg-neutral-200 transition-colors font-semibold rounded-none">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Customer
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Clients Table */}
            <div className="rounded-none border border-white/5 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-white/5 bg-white/[0.01] text-neutral-500 uppercase text-[10px] tracking-widest font-bold">
                        <tr>
                            <th className="px-6 py-4 w-10">
                                <div className="w-4 h-4 rounded-none border border-white/10" />
                            </th>
                            {customerColumns.filter(c => visibleColumns.includes(c.id)).map(col => (
                                <th key={col.id} className="px-6 py-4">{col.label}</th>
                            ))}
                            {visibleColumns.includes("status") && <th className="px-6 py-4">Status</th>}
                            {visibleColumns.includes("totalInvoiced") && <th className="px-6 py-4">Total Invoiced</th>}
                            {visibleColumns.includes("lastActivity") && <th className="px-6 py-4">Last Activity</th>}
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {allClients.map((client) => (
                            <tr key={client.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                                <td className="px-6 py-5">
                                    <div className="w-4 h-4 rounded-none border border-white/10 group-hover:border-white/30 transition-colors" />
                                </td>
                                {visibleColumns.includes("name") && (
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-none bg-neutral-900 border border-white/10 flex items-center justify-center">
                                                <Building2 className="h-5 w-5 text-neutral-400" />
                                            </div>
                                            <span className="font-semibold text-white">{client.name}</span>
                                        </div>
                                    </td>
                                )}
                                {visibleColumns.includes("contact") && <td className="px-6 py-5 text-neutral-400">{client.contact}</td>}
                                {visibleColumns.includes("email") && <td className="px-6 py-5 text-neutral-500">{client.email}</td>}
                                {visibleColumns.includes("invoices") && <td className="px-6 py-5 text-neutral-400">-</td>}
                                {visibleColumns.includes("projects") && <td className="px-6 py-5 text-neutral-400">-</td>}
                                {visibleColumns.includes("industry") && <td className="px-6 py-5 text-neutral-400">{client.industry}</td>}
                                {visibleColumns.includes("country") && <td className="px-6 py-5 text-neutral-400">{client.country}</td>}
                                {visibleColumns.includes("financeEmail") && <td className="px-6 py-5 text-neutral-500">-</td>}
                                {visibleColumns.includes("language") && <td className="px-6 py-5 text-neutral-400">-</td>}
                                {visibleColumns.includes("revenue") && <td className="px-6 py-5 text-white font-medium">{client.revenue}</td>}
                                {visibleColumns.includes("outstanding") && <td className="px-6 py-5 text-red-400">{client.outstanding}</td>}
                                {visibleColumns.includes("lastInvoice") && <td className="px-6 py-5 text-neutral-400">-</td>}
                                {visibleColumns.includes("website") && <td className="px-6 py-5 text-neutral-500">-</td>}
                                {visibleColumns.includes("tags") && (
                                    <td className="px-6 py-5">
                                        <div className="flex gap-1">
                                            {client.tags.map(tag => (
                                                <span key={tag} className="text-[10px] text-neutral-400 bg-white/5 px-1.5 py-0.5 rounded-none border border-white/5">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                )}

                                {visibleColumns.includes("status") && (
                                    <td className="px-6 py-5">
                                        <span className={cn(
                                            "inline-flex items-center px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider",
                                            client.status === 'Active' ? 'bg-white/10 text-white' : 'bg-white/5 text-neutral-500'
                                        )}>
                                            {client.status}
                                        </span>
                                    </td>
                                )}
                                {visibleColumns.includes("totalInvoiced") && <td className="px-6 py-5 font-mono text-white">{client.totalInvoiced}</td>}
                                {visibleColumns.includes("lastActivity") && <td className="px-6 py-5 text-neutral-500">{client.lastActivity}</td>}

                                <td className="px-6 py-5 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-white transition-colors rounded-none">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 bg-black border-white/10 rounded-none shadow-2xl">
                                            <DropdownMenuItem className="focus:bg-white/5 focus:text-white rounded-none cursor-pointer">Edit</DropdownMenuItem>
                                            <DropdownMenuItem className="focus:bg-white/5 focus:text-white rounded-none cursor-pointer">View Details</DropdownMenuItem>
                                            <DropdownMenuItem className="focus:bg-white/5 focus:text-white rounded-none cursor-pointer">Invoices</DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-white/5" />
                                            <DropdownMenuItem className="focus:bg-red-500/10 focus:text-red-500 text-red-500 rounded-none cursor-pointer">Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
