"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    ChevronLeft,
    Settings2,
    Eye,
    Plus,
    Trash2,
    ChevronDown,
    CalendarDays,
    Globe,
    FileText,
    CreditCard,
    Maximize,
    Scale,
    Percent,
    Banknote,
    Mail,
    Send,
    Hash,
    Clock,
    UserPlus,
    LayoutTemplate,
    Copy,
    Trash,
    QrCode,
    Check,
    Building2
} from "lucide-react"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

type TemplateType = "Classic" | "Minimal" | "Modern"

export default function NewInvoicePage() {
    const router = useRouter()
    const [template, setTemplate] = useState<TemplateType>("Classic")
    const [tasks, setTasks] = useState([
        { id: 1, description: "", price: 0, qty: 1 }
    ])

    const addTask = () => {
        setTasks([...tasks, { id: Date.now(), description: "", price: 0, qty: 1 }])
    }

    const removeTask = (id: number) => {
        if (tasks.length > 1) {
            setTasks(tasks.filter(t => t.id !== id))
        }
    }

    const calculateSubtotal = () => {
        return tasks.reduce((acc, task) => acc + (task.price * task.qty), 0)
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans pb-20">
            {/* Nav Header (Pic 5 Refined) */}
            <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 sticky top-0 bg-black/80 backdrop-blur-md z-50">
                <div className="flex items-center gap-6">
                    <Link href="/invoices" className="text-neutral-500 hover:text-white transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Invoice</span>
                        <span className="text-sm font-medium">Draft</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <Button
                        variant="ghost"
                        className="text-neutral-400 hover:text-white gap-2 font-medium"
                        onClick={() => router.push('/invoices/preview/1')}
                    >
                        <Eye className="h-4 w-4" />
                        Preview
                    </Button>

                    {/* Advanced Settings Dropdown (Pic 1) */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="text-neutral-400 hover:text-white gap-2 font-medium">
                                <Settings2 className="h-4 w-4" />
                                Settings
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[280px] bg-[#09090b] border-white/10 text-white p-2 rounded-xl shadow-2xl">
                            <DropdownMenuItem className="focus:bg-white/5 focus:text-white cursor-pointer px-3 py-2.5 rounded-lg flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <CalendarDays className="h-4 w-4 text-neutral-500 group-hover:text-white transition-colors" />
                                    <span>Date format</span>
                                </div>
                                <ChevronLeft className="h-4 w-4 text-neutral-700 rotate-180" />
                            </DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-white/5 focus:text-white cursor-pointer px-3 py-2.5 rounded-lg flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <Maximize className="h-4 w-4 text-neutral-500 group-hover:text-white transition-colors" />
                                    <span>Invoice size</span>
                                </div>
                                <ChevronLeft className="h-4 w-4 text-neutral-700 rotate-180" />
                            </DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-white/5 focus:text-white cursor-pointer px-3 py-2.5 rounded-lg flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <Scale className="h-4 w-4 text-neutral-500 group-hover:text-white transition-colors" />
                                    <span>Add sales tax</span>
                                </div>
                                <ChevronLeft className="h-4 w-4 text-neutral-700 rotate-180" />
                            </DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-white/5 focus:text-white cursor-pointer px-3 py-2.5 rounded-lg flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-4 w-4 text-neutral-500 group-hover:text-white transition-colors" />
                                    <span>Line item tax</span>
                                </div>
                                <ChevronLeft className="h-4 w-4 text-neutral-700 rotate-180" />
                            </DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-white/5 focus:text-white cursor-pointer px-3 py-2.5 rounded-lg flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <Scale className="h-4 w-4 text-neutral-500 group-hover:text-white transition-colors" />
                                    <span>Add VAT</span>
                                </div>
                                <ChevronLeft className="h-4 w-4 text-neutral-700 rotate-180" />
                            </DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-white/5 focus:text-white cursor-pointer px-3 py-2.5 rounded-lg flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <Banknote className="h-4 w-4 text-neutral-500 group-hover:text-white transition-colors" />
                                    <span>Currency</span>
                                </div>
                                <ChevronLeft className="h-4 w-4 text-neutral-700 rotate-180" />
                            </DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-white/5 focus:text-white cursor-pointer px-3 py-2.5 rounded-lg flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <Percent className="h-4 w-4 text-neutral-500 group-hover:text-white transition-colors" />
                                    <span>Add discount</span>
                                </div>
                                <ChevronLeft className="h-4 w-4 text-neutral-700 rotate-180" />
                            </DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-white/5 focus:text-white cursor-pointer px-3 py-2.5 rounded-lg flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-neutral-500 group-hover:text-white transition-colors" />
                                    <span>Attach PDF in email</span>
                                </div>
                                <ChevronLeft className="h-4 w-4 text-neutral-700 rotate-180" />
                            </DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-white/5 focus:text-white cursor-pointer px-3 py-2.5 rounded-lg flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <Send className="h-4 w-4 text-neutral-500 group-hover:text-white transition-colors" />
                                    <span>Send copy (BCC)</span>
                                </div>
                                <ChevronLeft className="h-4 w-4 text-neutral-700 rotate-180" />
                            </DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-white/5 focus:text-white cursor-pointer px-3 py-2.5 rounded-lg flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <Hash className="h-4 w-4 text-neutral-500 group-hover:text-white transition-colors" />
                                    <span>Add units</span>
                                </div>
                                <ChevronLeft className="h-4 w-4 text-neutral-700 rotate-180" />
                            </DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-white/5 focus:text-white cursor-pointer px-3 py-2.5 rounded-lg flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <Percent className="h-4 w-4 text-neutral-500 group-hover:text-white transition-colors" />
                                    <span>Decimals</span>
                                </div>
                                <ChevronLeft className="h-4 w-4 text-neutral-700 rotate-180" />
                            </DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-white/5 focus:text-white cursor-pointer px-3 py-2.5 rounded-lg flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <QrCode className="h-4 w-4 text-neutral-500 group-hover:text-white transition-colors" />
                                    <span>Add QR code</span>
                                </div>
                                <ChevronLeft className="h-4 w-4 text-neutral-700 rotate-180" />
                            </DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-white/5 focus:text-white cursor-pointer px-3 py-2.5 rounded-lg flex items-center justify-between group pb-4">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-4 w-4 text-neutral-500 group-hover:text-white transition-colors" />
                                    <span>Payment terms</span>
                                </div>
                                <ChevronLeft className="h-4 w-4 text-neutral-700 rotate-180" />
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="bg-white/5 mx-2" />

                            <DropdownMenuItem className="focus:bg-white/5 focus:text-white cursor-pointer px-3 py-2.5 rounded-lg flex items-center gap-3 py-4">
                                <Building2 className="h-4 w-4 text-neutral-500" />
                                <span>Connect Stripe</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="bg-white/5 mx-2" />

                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="focus:bg-white/5 focus:text-white cursor-pointer px-3 py-2.5 rounded-lg flex items-center gap-3 mt-2">
                                    <LayoutTemplate className="h-4 w-4 text-neutral-500" />
                                    <span>Template</span>
                                </DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                    <DropdownMenuSubContent className="bg-[#09090b] border-white/10 text-white p-2 rounded-xl min-w-[150px]">
                                        {(["Classic", "Minimal", "Modern"] as TemplateType[]).map((t) => (
                                            <DropdownMenuItem
                                                key={t}
                                                onClick={() => setTemplate(t)}
                                                className="focus:bg-white/5 focus:text-white cursor-pointer px-3 py-2 rounded-lg flex items-center justify-between"
                                            >
                                                <span>{t}</span>
                                                {template === t && <Check className="h-4 w-4" />}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                            </DropdownMenuSub>

                            <DropdownMenuItem className="focus:bg-white/5 focus:text-white cursor-pointer px-3 py-2.5 rounded-lg flex items-center gap-3">
                                <Copy className="h-4 w-4 text-neutral-500" />
                                <span>Duplicate template</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-white/5 focus:text-white cursor-pointer px-3 py-2.5 rounded-lg flex items-center gap-3 text-red-500 focus:bg-red-500/10 focus:text-red-500">
                                <Trash className="h-4 w-4" />
                                <span>Delete template</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Smart Create Button Dropdown (Pic 2) */}
                    <div className="flex items-center">
                        <Button className="bg-white text-black hover:bg-neutral-200 transition-colors font-medium rounded-r-none border-r border-black/10 h-10 px-6">
                            Create
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="bg-white text-black hover:bg-neutral-200 transition-colors px-2 rounded-l-none h-10 border-l border-black/5">
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[200px] bg-[#09090b] border-white/10 text-white p-2 rounded-xl shadow-2xl mt-1">
                                <DropdownMenuItem className="focus:bg-white/5 focus:text-white cursor-pointer px-3 py-2.5 rounded-lg flex items-center justify-between group">
                                    <span>Create</span>
                                    <Check className="h-4 w-4 text-white" />
                                </DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-white/5 focus:text-white cursor-pointer px-3 py-2.5 rounded-lg">
                                    Create & Send
                                </DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-white/5 focus:text-white cursor-pointer px-3 py-2.5 rounded-lg flex items-center justify-between group">
                                    <span>Schedule</span>
                                    <ChevronLeft className="h-4 w-4 text-neutral-700 rotate-180" />
                                </DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-white/5 focus:text-white cursor-pointer px-3 py-2.5 rounded-lg flex items-center justify-between group">
                                    <div className="flex items-center gap-2">
                                        <span>Recurring</span>
                                        <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-neutral-500 font-bold uppercase">Beta</span>
                                    </div>
                                    <ChevronLeft className="h-4 w-4 text-neutral-700 rotate-180" />
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            {/* Editor Content */}
            <main className="max-w-4xl mx-auto mt-12 px-6">
                <div className={cn(
                    "bg-[#09090b] border border-white/5 rounded-2xl shadow-2xl transition-all duration-500",
                    template === "Classic" && "p-12",
                    template === "Minimal" && "p-20 border-none shadow-none bg-transparent",
                    template === "Modern" && "p-0 overflow-hidden"
                )}>
                    {template === "Modern" && (
                        <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 w-full" />
                    )}

                    <div className={cn(template === "Modern" && "p-12")}>
                        {/* Top Row: Logo & Info */}
                        <div className={cn(
                            "flex justify-between items-start mb-20",
                            template === "Minimal" && "flex-col items-center gap-8 text-center"
                        )}>
                            <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-neutral-600 hover:text-neutral-400 hover:border-white/20 transition-all cursor-pointer group bg-black/20">
                                <Plus className="h-6 w-6 mb-1 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Logo</span>
                            </div>

                            <div className={cn(
                                "text-right",
                                template === "Minimal" && "text-center"
                            )}>
                                <h2 className={cn(
                                    "text-5xl font-serif text-white mb-2 italic",
                                    template === "Classic" && "italic",
                                    template === "Minimal" && "font-sans uppercase tracking-[0.3em] font-normal",
                                    template === "Modern" && "font-sans font-black tracking-tighter text-6xl uppercase"
                                )}>Invoice</h2>
                                <p className="text-neutral-500 font-mono text-sm tracking-widest">#INV-2024-0001</p>
                            </div>
                        </div>

                        {/* From / To Section */}
                        <div className={cn(
                            "grid grid-cols-2 gap-20 mb-16",
                            template === "Modern" && "bg-white/5 p-8 rounded-xl"
                        )}>
                            <div className="flex flex-col gap-4">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">From</span>
                                <div className="space-y-3">
                                    <Input placeholder="Your Name / Company" className="bg-transparent border-none p-0 h-auto text-white placeholder:text-neutral-800 text-lg font-medium focus-visible:ring-0" />
                                    <textarea placeholder="Address" className="w-full bg-transparent border-none p-0 h-20 text-neutral-400 placeholder:text-neutral-800 text-sm focus:ring-0 resize-none" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-4 text-right">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">To</span>
                                <div className="space-y-3">
                                    <Input placeholder="Add Client" className="bg-transparent border-none p-0 h-auto text-white placeholder:text-neutral-800 text-lg font-medium focus-visible:ring-0 text-right" />
                                    <textarea placeholder="Client Address" className="w-full bg-transparent border-none p-0 h-20 text-neutral-400 placeholder:text-neutral-800 text-sm focus:ring-0 resize-none text-right" />
                                </div>
                                <Button variant="ghost" size="sm" className="w-fit ml-auto text-[10px] uppercase font-bold text-blue-500 hover:text-blue-400 px-0">
                                    <UserPlus className="h-3 w-3 mr-1" />
                                    Save as New Client
                                </Button>
                            </div>
                        </div>

                        {/* Meta Details */}
                        <div className="flex flex-wrap gap-12 mb-16 pb-12 border-b border-white/5">
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Issue Date</span>
                                <input type="date" className="bg-transparent border-none p-0 text-white font-medium focus:ring-0 text-sm [color-scheme:dark]" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Due Date</span>
                                <input type="date" className="bg-transparent border-none p-0 text-white font-medium focus:ring-0 text-sm [color-scheme:dark]" />
                            </div>
                        </div>

                        {/* Tasks Table */}
                        <div className="mb-12">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                                        <th className="py-4 text-left font-medium w-1/2">Description</th>
                                        <th className="py-4 text-right font-medium">Price</th>
                                        <th className="py-4 text-right font-medium">Qty</th>
                                        <th className="py-4 text-right font-medium pr-10">Total</th>
                                        <th className="w-8"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {tasks.map((task) => (
                                        <tr key={task.id} className="group transition-colors outline-none">
                                            <td className="py-6">
                                                <Input
                                                    placeholder="What are you charging for?"
                                                    className="bg-transparent border-none p-0 h-auto text-white placeholder:text-neutral-800 focus-visible:ring-0 text-sm"
                                                    value={task.description}
                                                    onChange={(e) => {
                                                        const newTasks = [...tasks]
                                                        const idx = newTasks.findIndex(t => t.id === task.id)
                                                        newTasks[idx].description = e.target.value
                                                        setTasks(newTasks)
                                                    }}
                                                />
                                            </td>
                                            <td className="py-6 text-right">
                                                <Input
                                                    type="number"
                                                    className="bg-transparent border-none p-0 h-auto text-white text-right focus-visible:ring-0 text-sm"
                                                    value={task.price}
                                                    onChange={(e) => {
                                                        const newTasks = [...tasks]
                                                        const idx = newTasks.findIndex(t => t.id === task.id)
                                                        newTasks[idx].price = parseFloat(e.target.value) || 0
                                                        setTasks(newTasks)
                                                    }}
                                                />
                                            </td>
                                            <td className="py-6 text-right">
                                                <Input
                                                    type="number"
                                                    className="bg-transparent border-none p-0 h-auto text-white text-right focus-visible:ring-0 text-sm"
                                                    value={task.qty}
                                                    onChange={(e) => {
                                                        const newTasks = [...tasks]
                                                        const idx = newTasks.findIndex(t => t.id === task.id)
                                                        newTasks[idx].qty = parseInt(e.target.value) || 0
                                                        setTasks(newTasks)
                                                    }}
                                                />
                                            </td>
                                            <td className="py-6 text-right text-white font-medium pr-10">
                                                {(task.price * task.qty).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                            </td>
                                            <td className="py-6 text-right">
                                                <button
                                                    onClick={() => removeTask(task.id)}
                                                    className="text-neutral-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all outline-none"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <Button
                                variant="ghost"
                                className="mt-8 text-neutral-500 hover:text-white gap-2 px-0 hover:bg-transparent border border-dashed border-white/5 w-full h-12 rounded-xl group transition-all"
                                onClick={addTask}
                            >
                                <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Add line item</span>
                            </Button>
                        </div>

                        {/* Summary & Totals */}
                        <div className="flex justify-between items-start mt-20 pt-12 border-t border-white/5">
                            <div className="w-1/2 flex flex-col gap-6">
                                <div className="flex flex-col gap-4">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Note</span>
                                    <textarea placeholder="Add a note (visible to client)" className="w-full bg-transparent border-none p-0 h-24 text-neutral-400 placeholder:text-neutral-800 text-sm focus:ring-0 resize-none" />
                                </div>
                                <div className="flex flex-col gap-4">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Payment Info</span>
                                    <div className="space-y-1 text-sm text-neutral-400">
                                        <p>Account name: My Professional Co.</p>
                                        <p>Account number: 123456789</p>
                                        <p>Bank: FNB</p>
                                    </div>
                                </div>
                            </div>

                            <div className="w-1/3 flex flex-col gap-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-neutral-500">Subtotal</span>
                                    <span className="text-white font-medium">{calculateSubtotal().toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-neutral-500">Tax (0%)</span>
                                    <span className="text-white font-medium">$0.00</span>
                                </div>
                                <div className={cn(
                                    "flex justify-between items-center mt-6 pt-6 border-t border-white/5",
                                    template === "Modern" ? "text-4xl font-black uppercase tracking-tighter" : "text-2xl font-serif italic"
                                )}>
                                    <span className="text-neutral-400">Total</span>
                                    <span className="text-white font-bold">{calculateSubtotal().toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
