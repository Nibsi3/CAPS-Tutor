"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    ChevronLeft,
    X,
    Plus,
    Search,
    Globe,
    Building2,
    Mail,
    Phone,
    User,
    MapPin,
    Tag,
    Hash,
    FileText
} from "lucide-react"
import Link from "next/link"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"

export default function NewClientPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleCreate = () => {
        setIsLoading(true)
        // Simulate creation
        setTimeout(() => {
            setIsLoading(false)
            router.push("/clients")
        }, 1000)
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans pb-20">
            {/* Header (Matching Invoice Editor) */}
            <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 sticky top-0 bg-black/80 backdrop-blur-md z-50">
                <div className="flex items-center gap-6">
                    <Link href="/clients" className="text-neutral-500 hover:text-white transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Customer</span>
                        <span className="text-sm font-medium">New Customer</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        className="text-neutral-400 hover:text-white font-medium"
                        onClick={() => router.back()}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreate}
                        disabled={isLoading}
                        className="bg-white text-black hover:bg-neutral-200 transition-colors font-semibold px-8 rounded-lg"
                    >
                        {isLoading ? "Creating..." : "Create"}
                    </Button>
                </div>
            </header>

            {/* Form Content */}
            <main className="max-w-2xl mx-auto mt-12 px-6">
                <div className="flex items-center justify-between mb-10">
                    <h1 className="text-3xl font-serif italic text-white">Create Customer</h1>
                    <button onClick={() => router.back()} className="text-neutral-500 hover:text-white transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <Accordion type="multiple" defaultValue={["general", "details"]} className="space-y-6">
                    {/* General Section */}
                    <AccordionItem value="general" className="border border-white/5 bg-[#09090b] rounded-xl overflow-hidden px-6">
                        <AccordionTrigger className="hover:no-underline py-6">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold uppercase tracking-widest text-white">General</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-8 space-y-6 pt-2">
                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Name</Label>
                                    <Input placeholder="Acme Inc" className="bg-transparent border-white/10 h-11 focus-visible:ring-white/10" />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Email</Label>
                                        <Input placeholder="acme@example.com" className="bg-transparent border-white/10 h-11 focus-visible:ring-white/10" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Billing Email</Label>
                                        <Input placeholder="finance@example.com" className="bg-transparent border-white/10 h-11 focus-visible:ring-white/10" />
                                        <p className="text-[10px] text-neutral-500">This is an additional email that will be used to send invoices to.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Phone</Label>
                                        <Input placeholder="+1 (555) 123-4567" className="bg-transparent border-white/10 h-11 focus-visible:ring-white/10" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Website</Label>
                                        <Input placeholder="acme.com" className="bg-transparent border-white/10 h-11 focus-visible:ring-white/10" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Contact person</Label>
                                    <Input placeholder="John Doe" className="bg-transparent border-white/10 h-11 focus-visible:ring-white/10" />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Details Section */}
                    <AccordionItem value="details" className="border border-white/5 bg-[#09090b] rounded-xl overflow-hidden px-6">
                        <AccordionTrigger className="hover:no-underline py-6">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold uppercase tracking-widest text-white">Details</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-8 space-y-6 pt-2">
                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Address</Label>
                                    <div className="relative group">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500 group-focus-within:text-white transition-colors" />
                                        <Input placeholder="Search for an address" className="pl-10 bg-transparent border-white/10 h-11 focus-visible:ring-white/10" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Address Line 1</Label>
                                        <Input placeholder="123 Main St" className="bg-transparent border-white/10 h-11 focus-visible:ring-white/10" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Address Line 2</Label>
                                        <Input placeholder="Suite 100" className="bg-transparent border-white/10 h-11 focus-visible:ring-white/10" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Country</Label>
                                        <Select>
                                            <SelectTrigger className="bg-transparent border-white/10 h-11 focus:ring-white/10">
                                                <SelectValue placeholder="Select country" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#09090b] border-white/10 text-white">
                                                <SelectItem value="za">South Africa</SelectItem>
                                                <SelectItem value="us">United States</SelectItem>
                                                <SelectItem value="uk">United Kingdom</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-neutral-500">City</Label>
                                        <Input placeholder="New York" className="bg-transparent border-white/10 h-11 focus-visible:ring-white/10" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-neutral-500">State / Province</Label>
                                        <Input placeholder="NY" className="bg-transparent border-white/10 h-11 focus-visible:ring-white/10" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-neutral-500">ZIP / Postal Code</Label>
                                        <Input placeholder="10001" className="bg-transparent border-white/10 h-11 focus-visible:ring-white/10" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Expense Tags</Label>
                                    <Select>
                                        <SelectTrigger className="bg-transparent border-white/10 h-11 focus:ring-white/10">
                                            <SelectValue placeholder="Select tags" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#09090b] border-white/10 text-white">
                                            <SelectItem value="marketing">Marketing</SelectItem>
                                            <SelectItem value="sales">Sales</SelectItem>
                                            <SelectItem value="support">Support</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[10px] text-neutral-500">Tags help categorize and track customer expenses.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Tax ID / VAT Number</Label>
                                    <Input placeholder="Enter VAT number" className="bg-transparent border-white/10 h-11 focus-visible:ring-white/10" />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Note</Label>
                                    <textarea placeholder="Add a private note" className="w-full bg-transparent border border-white/10 rounded-lg p-3 h-32 focus:ring-1 focus:ring-white/10 transition-all text-sm resize-none outline-none" />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </main>
        </div>
    )
}
