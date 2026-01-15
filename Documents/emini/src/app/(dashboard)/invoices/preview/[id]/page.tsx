"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, Download, Printer, Share2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { use } from "react"

export default function InvoicePreviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans pb-20">
            {/* Action Header */}
            <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 sticky top-0 bg-black/80 backdrop-blur-md z-50">
                <div className="flex items-center gap-6">
                    <button onClick={() => router.back()} className="text-neutral-500 hover:text-white transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Preview</span>
                        <span className="text-sm font-medium">INV-2024-0001</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-10 border-white/10 bg-white/5 hover:bg-white/10">
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                    </Button>
                    <Button variant="outline" className="h-10 border-white/10 bg-white/5 hover:bg-white/10" onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </Button>
                    <Button className="h-10 bg-white text-black hover:bg-neutral-200 font-semibold px-6">
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                    </Button>
                </div>
            </header>

            {/* Invoice Paper Layout */}
            <main className="max-w-5xl mx-auto mt-12 px-6">
                <div className="bg-white text-black rounded-lg shadow-2xl p-20 min-h-[1120px] mx-auto overflow-hidden printable-area">
                    {/* Header: Logo & Title */}
                    <div className="flex justify-between items-start mb-20">
                        <div className="w-20 h-20 bg-black rounded-xl flex items-center justify-center">
                            <img src="/logo.png" alt="Logo" className="w-10 h-10 invert" />
                        </div>
                        <div className="text-right">
                            <h1 className="text-5xl font-serif italic mb-2">Invoice</h1>
                            <p className="text-neutral-500 font-mono text-sm tracking-widest">#INV-2024-0001</p>
                        </div>
                    </div>

                    {/* From / To */}
                    <div className="grid grid-cols-2 gap-20 mb-16 pb-16 border-b border-neutral-100">
                        <div className="flex flex-col gap-4">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">From</span>
                            <div className="space-y-1">
                                <p className="text-lg font-bold">My Professional Co.</p>
                                <p className="text-sm text-neutral-600 leading-relaxed">
                                    123 Business Avenue<br />
                                    Innovation District<br />
                                    Cape Town, 8001<br />
                                    South Africa
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4 text-right">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">To</span>
                            <div className="space-y-1">
                                <p className="text-lg font-bold">Acme Corp</p>
                                <p className="text-sm text-neutral-600 leading-relaxed">
                                    789 Client Tower<br />
                                    Financial Square<br />
                                    New York, NY 10001<br />
                                    USA
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="flex gap-16 mb-16">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Issue Date</span>
                            <p className="font-semibold text-sm italic font-serif">January 15, 2024</p>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Due Date</span>
                            <p className="font-semibold text-sm italic font-serif text-red-500">January 30, 2024</p>
                        </div>
                    </div>

                    {/* Line Items */}
                    <table className="w-full mb-16">
                        <thead className="border-b-2 border-black text-[10px] font-bold uppercase tracking-widest">
                            <tr>
                                <th className="py-4 text-left">Description</th>
                                <th className="py-4 text-right">Price</th>
                                <th className="py-4 text-right">Qty</th>
                                <th className="py-4 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            <tr className="text-sm">
                                <td className="py-6 font-medium">Brand Identity Design & Strategy</td>
                                <td className="py-6 text-right">$4,500.00</td>
                                <td className="py-6 text-right">1</td>
                                <td className="py-6 text-right font-bold">$4,500.00</td>
                            </tr>
                            <tr className="text-sm">
                                <td className="py-6 font-medium">Website Development (Next.js)</td>
                                <td className="py-6 text-right">$2,000.00</td>
                                <td className="py-6 text-right">4</td>
                                <td className="py-6 text-right font-bold">$8,000.00</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Footer: Notes & Totals */}
                    <div className="flex justify-between items-start pt-12 border-t-2 border-black">
                        <div className="w-1/2 flex flex-col gap-8">
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Note</span>
                                <p className="text-xs text-neutral-500 leading-relaxed">
                                    Thank you for your business. Please reach out if you have any questions regarding this invoice.
                                    Payment is expected within 15 days.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Payment Details</span>
                                <p className="text-[11px] text-neutral-500 leading-relaxed font-mono">
                                    BANK: FNB<br />
                                    ACCOUNT: Professional Branding<br />
                                    NUMBER: 123456789<br />
                                    CODE: 250655
                                </p>
                            </div>
                        </div>

                        <div className="w-1/3 flex flex-col gap-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-400">Subtotal</span>
                                <span>$12,500.00</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-400">Tax (0%)</span>
                                <span>$0.00</span>
                            </div>
                            <div className="flex justify-between items-center text-4xl font-serif italic font-bold mt-6 pt-6 border-t border-neutral-100">
                                <span className="text-neutral-400 text-2xl">Total</span>
                                <span>$12,500.00</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-40 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-300">www.emini.io</p>
                    </div>
                </div>
            </main>

            <style jsx global>{`
                @media print {
                    header { display: none !important; }
                    body { background: white !important; }
                    .printable-area { 
                        box-shadow: none !important; 
                        margin: 0 !important; 
                        padding: 0 !important; 
                        width: 100% !important;
                    }
                }
            `}</style>
        </div>
    )
}
