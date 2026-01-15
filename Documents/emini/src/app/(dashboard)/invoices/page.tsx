"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Search, Filter, MoreHorizontal, ChevronDown, Check, Download, X } from "lucide-react"
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
import { allInvoices } from "@/lib/mock-data"


const columnsList = [
    { label: "Invoice no.", id: "id" },
    { label: "Status", id: "status" },
    { label: "Due date", id: "dueDate" },
    { label: "Customer", id: "customer" },
    { label: "Amount", id: "amount" },
    { label: "VAT Rate", id: "vatRate" },
    { label: "VAT Amount", id: "vatAmount" },
    { label: "Tax Rate", id: "taxRate" },
    { label: "Tax Amount", id: "taxAmount" },
    { label: "Excl. VAT", id: "exclVat" },
    { label: "Excl. Tax", id: "exclTax" },
    { label: "Internal Note", id: "internalNote" },
    { label: "Issue date", id: "issueDate" },
    { label: "Type", id: "type" },
    { label: "Sent at", id: "sentAt" },
]

export default function InvoicesPage() {
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [filterStatus, setFilterStatus] = useState<string | null>(null)
    const [visibleColumns, setVisibleColumns] = useState<string[]>([
        "id", "status", "dueDate", "customer", "amount", "issueDate", "type"
    ])

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const toggleSelectAll = () => {
        if (selectedIds.length === allInvoices.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(allInvoices.map((i: any) => i.id))
        }
    }

    const filteredInvoices = filterStatus
        ? allInvoices.filter((inv: any) => inv.status.toLowerCase() === filterStatus.toLowerCase())
        : allInvoices

    return (
        <div className="flex flex-col gap-y-10 pb-32">
            {/* Status Cards (Pic 4) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Open", value: "ZAR 0", count: "2 invoices", status: "unpaid" },
                    { label: "Overdue", value: "ZAR 0", count: "No invoices", status: "overdue" },
                    { label: "Paid", value: "ZAR 0", count: "No invoices", status: "paid" },
                ].map((card) => (
                    <Card
                        key={card.label}
                        onClick={() => setFilterStatus(filterStatus === card.status ? null : card.status)}
                        className={cn(
                            "bg-transparent border-white/5 shadow-none overflow-hidden cursor-pointer transition-all hover:bg-white/5 rounded-none",
                            filterStatus === card.status && "bg-white/5 border-white/20"
                        )}
                    >
                        <CardContent className="p-6">
                            <h3 className="text-3xl font-serif text-white mb-4 italic">{card.value}</h3>
                            <p className="text-sm font-medium text-white">{card.label}</p>
                            <p className="text-xs text-neutral-500">{card.count}</p>
                        </CardContent>
                    </Card>
                ))}

                <Card className="bg-transparent border-white/5 shadow-none overflow-hidden relative rounded-none">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-3xl font-serif text-white mb-4 italic">Unknown</h3>
                                <p className="text-sm font-medium text-white">Payment score</p>
                                <p className="text-xs text-neutral-500">No payment history yet</p>
                            </div>
                            <div className="flex items-end gap-[2px] h-12 opacity-30 pt-2">
                                {[2, 4, 3, 6, 8, 10, 7, 5, 9, 6].map((h, i) => (
                                    <div key={i} className="w-[3px] bg-white rounded-none" style={{ height: `${h * 4}px` }} />
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
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
                        <DropdownMenuContent align="end" className="w-56 bg-[#0d0d0d] border-white/10 rounded-none">
                            {columnsList.map(col => (
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

                    <Link href="/invoices/new">
                        <Button className="h-11 bg-white text-black hover:bg-neutral-200 transition-colors font-medium rounded-none">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Invoice
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Invoices Table (Pic 4) */}
            <div className="rounded-none border border-white/5 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-white/5 bg-white/[0.01] text-neutral-500">
                        <tr>
                            <th className="px-6 py-4 w-10">
                                <div
                                    onClick={toggleSelectAll}
                                    className="w-4 h-4 rounded-none border border-white/10 flex items-center justify-center cursor-pointer"
                                >
                                    {selectedIds.length === allInvoices.length && <Check className="h-3 w-3 text-white" />}
                                </div>
                            </th>
                            {columnsList.filter(c => visibleColumns.includes(c.id)).map(col => (
                                <th key={col.id} className="px-6 py-4 font-medium uppercase text-[10px] tracking-widest">
                                    {col.label}
                                </th>
                            ))}
                            <th className="px-6 py-4 font-medium uppercase text-[10px] tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredInvoices.map((invoice) => (
                            <tr key={invoice.id} className="hover:bg-white/2 transition-colors group">
                                <td className="px-6 py-5">
                                    <div
                                        onClick={() => toggleSelect(invoice.id)}
                                        className={cn(
                                            "w-4 h-4 rounded-none border border-white/10 group-hover:border-white/30 transition-colors flex items-center justify-center cursor-pointer",
                                            selectedIds.includes(invoice.id) && "bg-white border-white"
                                        )}
                                    >
                                        {selectedIds.includes(invoice.id) && <Check className="h-3 w-3 text-black" />}
                                    </div>
                                </td>
                                {visibleColumns.includes("id") && <td className="px-6 py-5 font-medium text-white tracking-tight">{invoice.id}</td>}
                                {visibleColumns.includes("status") && (
                                    <td className="px-6 py-5">
                                        <span className={cn(
                                            "inline-flex items-center px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider",
                                            invoice.status === 'Draft' ? 'bg-white/5 text-neutral-400' : 'bg-white/10 text-white'
                                        )}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                )}
                                {visibleColumns.includes("dueDate") && (
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1 items-end">
                                            <div className="flex h-8 w-8 items-center justify-center bg-linear-to-tr from-[#3b82f6] to-[#6366f1] text-white rounded-none">
                                                {invoice.dueDate}</div>
                                            <div className="text-[9px] text-muted-foreground">In 28 days</div>
                                        </div>
                                    </td>
                                )}
                                {visibleColumns.includes("customer") && (
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-none bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-neutral-400">
                                                {invoice.customer.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-neutral-400">{invoice.customer}</span>
                                        </div>
                                    </td>
                                )}
                                {visibleColumns.includes("amount") && <td className="px-6 py-5 text-white font-medium">{invoice.amount}</td>}
                                {visibleColumns.includes("vatRate") && <td className="px-6 py-5 text-neutral-500">-</td>}
                                {visibleColumns.includes("vatAmount") && <td className="px-6 py-5 text-neutral-500">-</td>}
                                {visibleColumns.includes("taxRate") && <td className="px-6 py-5 text-neutral-500">-</td>}
                                {visibleColumns.includes("taxAmount") && <td className="px-6 py-5 text-neutral-500">-</td>}
                                {visibleColumns.includes("exclVat") && <td className="px-6 py-5 text-neutral-500">-</td>}
                                {visibleColumns.includes("exclTax") && <td className="px-6 py-5 text-neutral-500">-</td>}
                                {visibleColumns.includes("internalNote") && <td className="px-6 py-5 text-neutral-500">-</td>}
                                {visibleColumns.includes("issueDate") && <td className="px-6 py-5 text-neutral-400">{invoice.issueDate}</td>}
                                {visibleColumns.includes("type") && <td className="px-6 py-5 text-neutral-400">{invoice.type}</td>}
                                {visibleColumns.includes("sentAt") && <td className="px-6 py-5 text-neutral-500">-</td>}

                                <td className="px-6 py-5 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-white rounded-none">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 bg-black border-white/10 rounded-none shadow-2xl">
                                            <DropdownMenuItem className="focus:bg-white/5 focus:text-white rounded-none cursor-pointer">Edit</DropdownMenuItem>
                                            <DropdownMenuItem className="focus:bg-white/5 focus:text-white rounded-none cursor-pointer">Open</DropdownMenuItem>
                                            <DropdownMenuItem className="focus:bg-white/5 focus:text-white rounded-none cursor-pointer">Copy link</DropdownMenuItem>
                                            <DropdownMenuItem className="focus:bg-white/5 focus:text-white rounded-none cursor-pointer">Duplicate</DropdownMenuItem>
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

            {/* Selection Toolbar (Pic 4) */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5">
                    <div className="flex items-center gap-6 px-6 py-4 bg-black border border-white/10 shadow-2xl rounded-none min-w-[400px]">
                        <div className="flex items-center gap-3 border-r border-white/10 pr-6">
                            <span className="text-sm font-bold text-white tracking-tight">{selectedIds.length} selected</span>
                            <button
                                onClick={() => setSelectedIds([])}
                                className="text-xs text-neutral-500 hover:text-white transition-colors"
                            >
                                Deselect all
                            </button>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" className="h-9 text-xs font-bold text-white hover:bg-white/5 rounded-none gap-2">
                                <Download className="h-3.5 w-3.5" />
                                Download ZIP
                            </Button>
                        </div>
                        <button
                            onClick={() => setSelectedIds([])}
                            className="ml-auto p-1 text-neutral-500 hover:text-white transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
