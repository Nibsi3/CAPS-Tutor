"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Plus, Trash2, ChevronDown, Sparkles, FileText, Calendar, Clock, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { EditableText, EditableNumber } from "@/components/invoice/inline-fields"
import { InvoiceSettings } from "@/components/invoice/settings-dropdown"
import { CustomerDrawer } from "@/components/customer-drawer"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"

export function InvoiceEditor({ onClose }: { onClose?: () => void }) {
    const [invoiceNumber, setInvoiceNumber] = useState("INV-0002")
    const [issueDate, setIssueDate] = useState("14/01/2026")
    const [dueDate, setDueDate] = useState("13/02/2026")
    const [fromEmail, setFromEmail] = useState("example@gmail.com")
    const [customerEmail, setCustomerEmail] = useState("example2@gmail.com")
    const [items, setItems] = useState([{ id: 1, description: "example", quantity: 3, price: 23 }])
    const [paymentDetails, setPaymentDetails] = useState("Example")
    const [note, setNote] = useState("Notes example")
    const [currency, setCurrency] = useState("ZAR")
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [selectedTemplate, setSelectedTemplate] = useState("Default")

    const addItem = () => {
        setItems([...items, { id: Date.now(), description: "", quantity: 1, price: 0 }])
    }

    const removeItem = (id: number) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id))
        }
    }

    const updateItem = (id: number, field: string, value: string | number) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item))
    }

    const subtotal = useMemo(() => items.reduce((acc, item) => acc + (item.quantity * item.price), 0), [items])
    const total = subtotal

    return (
        <div className="flex flex-col h-full bg-[#09090b] text-white selection:bg-primary/30 relative">
            <ScrollArea className="flex-1 w-full relative z-10 pb-32">
                <div className="p-8 md:p-12 mb-32 flex flex-col gap-8 max-w-4xl mx-auto">
                    {/* Header Controls for Sheet Mode */}
                    {onClose && (
                        <div className="flex items-center gap-4 mb-4 md:hidden">
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <span className="font-bold">New Invoice</span>
                        </div>
                    )}

                    <Card className="bg-[#121212] border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] rounded-[2.5rem] overflow-hidden min-h-[800px]">
                        <CardContent className="p-8 md:p-16 flex flex-col gap-16">
                            {/* Header Section */}
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col gap-3">
                                    <h2 className="text-4xl font-serif font-bold tracking-tight">Invoice</h2>
                                    <div className="flex flex-col text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <span>Invoice No:</span>
                                            <EditableText value={invoiceNumber} onChange={setInvoiceNumber} className="text-white font-bold" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span>Issue Date:</span>
                                            <EditableText value={issueDate} onChange={setIssueDate} className="text-white font-bold" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span>Due Date:</span>
                                            <EditableText value={dueDate} onChange={setDueDate} className="text-white font-bold" />
                                        </div>
                                    </div>
                                </div>
                                {/* Logo Placeholder / Uploader */}
                                <div className="w-32 h-20 bg-muted/5 border border-dashed border-muted-foreground/20 rounded-2xl flex items-center justify-center group cursor-pointer hover:border-primary/50 transition-colors">
                                    <Sparkles className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                            </div>

                            {/* From / Bill To Section */}
                            <div className="grid grid-cols-2 gap-20">
                                <div className="space-y-4">
                                    <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mb-4">From</div>
                                    <EditableText value={fromEmail} onChange={setFromEmail} className="text-lg font-bold" />
                                </div>
                                <div className="space-y-4">
                                    <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mb-4">Bill To</div>
                                    <EditableText value={customerEmail} onChange={setCustomerEmail} className="text-muted-foreground mb-1" />
                                    <Button
                                        variant="ghost"
                                        className="p-0 h-auto text-primary font-bold hover:bg-transparent flex items-center gap-1 group"
                                        onClick={() => setDrawerOpen(true)}
                                    >
                                        Select customer
                                        <ChevronDown className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
                                    </Button>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-12 gap-4 pb-4 border-b border-white/10 text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
                                    <div className="col-span-8">Description</div>
                                    <div className="col-span-1 text-right">Quantity</div>
                                    <div className="col-span-1 text-right">Price</div>
                                    <div className="col-span-2 text-right">Total</div>
                                </div>
                                <div className="space-y-8">
                                    {items.map((item) => (
                                        <div key={item.id} className="grid grid-cols-12 gap-4 group items-center">
                                            <div className="col-span-8">
                                                <EditableText
                                                    value={item.description}
                                                    onChange={(val) => updateItem(item.id, "description", val)}
                                                    className="text-lg font-medium"
                                                    placeholder="Enter description..."
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <EditableNumber
                                                    value={item.quantity}
                                                    onChange={(val) => updateItem(item.id, "quantity", val)}
                                                    className="text-muted-foreground"
                                                    step="1"
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <EditableNumber
                                                    value={item.price}
                                                    onChange={(val) => updateItem(item.id, "price", val)}
                                                    className="text-muted-foreground"
                                                />
                                            </div>
                                            <div className="col-span-2 text-right font-bold tabular-nums">
                                                {currency} {(item.quantity * item.price).toLocaleString()}
                                            </div>
                                            {/* Hidden remove button */}
                                            <div className="absolute -left-12 opacity-0 group-hover:opacity-100 transition-opacity hidden xl:block">
                                                <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => removeItem(item.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    variant="ghost"
                                    className="mt-4 p-0 h-auto text-muted-foreground hover:text-white font-bold hover:bg-transparent flex items-center gap-2"
                                    onClick={addItem}
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Item
                                </Button>
                            </div>

                            {/* Totals Section */}
                            <div className="flex justify-end pt-12">
                                <div className="w-full max-w-[320px] space-y-4">
                                    <div className="flex justify-between items-center text-muted-foreground">
                                        <span className="text-sm font-medium">Subtotal</span>
                                        <span className="font-bold tabular-nums">{currency} {subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-muted-foreground pb-4 border-b border-white/10">
                                        <span className="text-sm font-medium">VAT (0%)</span>
                                        <span className="font-bold tabular-nums">{currency} 0.00</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-4">
                                        <span className="text-sm uppercase tracking-widest font-bold text-muted-foreground">Total</span>
                                        <span className="text-4xl font-serif font-bold tabular-nums">{currency} {total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Notes Section */}
                            <div className="grid grid-cols-2 gap-20 mt-16 pt-16 border-t border-white/5">
                                <div className="space-y-4">
                                    <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mb-4">Payment Details</div>
                                    <EditableText
                                        value={paymentDetails}
                                        onChange={setPaymentDetails}
                                        className="text-sm font-bold"
                                        placeholder="Add payment instructions..."
                                        multiline
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mb-4">Note</div>
                                    <EditableText
                                        value={note}
                                        onChange={setNote}
                                        className="text-sm font-bold"
                                        placeholder="Add a note for the customer..."
                                        multiline
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </ScrollArea>

            {/* Sticky Actions Bar */}
            <div className="absolute bottom-10 left-0 right-0 p-8 flex justify-center z-50 pointer-events-none">
                <div className="bg-[#18181b]/90 backdrop-blur-2xl border border-white/10 p-2 rounded-[2.5rem] shadow-2xl flex items-center gap-2 pointer-events-auto">
                    <div className="flex items-center px-4 gap-3 bg-[#09090b] rounded-[2rem] border border-white/5 h-14 mr-2">
                        <InvoiceSettings />
                        <div className="w-px h-6 bg-white/10" />

                        {/* Template Picker */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-10 text-sm font-bold flex items-center gap-2 px-3 rounded-xl hover:bg-white/5">
                                    {selectedTemplate}
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 bg-[#121212] border-white/10">
                                <DropdownMenuLabel className="text-xs text-muted-foreground">Select Template</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/10" />
                                {["Default", "Minimal", "Corporate", "Noir"].map((template) => (
                                    <DropdownMenuItem
                                        key={template}
                                        onClick={() => setSelectedTemplate(template)}
                                        className="text-sm font-medium focus:bg-white/10 cursor-pointer"
                                    >
                                        {template}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="flex items-center overflow-hidden rounded-[2rem] bg-white text-black h-14 shadow-lg group">
                        <Button className="h-full px-8 rounded-none bg-white text-black hover:bg-neutral-200 font-bold transition-colors">
                            Create
                        </Button>
                        <div className="w-px h-8 bg-neutral-200" />

                        {/* Create Actions Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="icon" className="h-full w-12 rounded-none bg-white text-black hover:bg-neutral-200 transition-colors">
                                    <ChevronDown className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 bg-[#121212] border-white/10">
                                <DropdownMenuItem className="gap-2 p-3 font-medium cursor-pointer focus:bg-white/10">
                                    <FileText className="h-4 w-4" />
                                    <span>Create & Download PDF</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 p-3 font-medium cursor-pointer focus:bg-white/10">
                                    <Send className="h-4 w-4" />
                                    <span>Create & Send Email</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 p-3 font-medium cursor-pointer focus:bg-white/10">
                                    <Calendar className="h-4 w-4" />
                                    <span>Schedule Invoice</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem className="gap-2 p-3 font-medium cursor-pointer focus:bg-white/10">
                                    <Clock className="h-4 w-4" />
                                    <span>Create Recurring</span>
                                    <span className="ml-auto text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">BETA</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            <CustomerDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
        </div>
    )
}
