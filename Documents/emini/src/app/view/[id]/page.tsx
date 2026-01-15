"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Download, CreditCard, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data for the public view
const mockInvoice = {
    number: "INV-001",
    date: "Jan 14, 2024",
    customerName: "Acme Corp",
    customerEmail: "billing@acme.com",
    items: [
        { description: "Premium Design Services", quantity: 1, price: 1500 },
        { description: "Custom Development", quantity: 2, price: 500 },
    ],
    notes: "Please pay within 15 days of receiving this invoice. Thank you for your business!",
    status: "sent",
    brandColor: "#0070F3",
    logo: "https://emini.co.za/logo.png"
}

export default function PublicInvoicePage() {
    const subtotal = useMemo(() => mockInvoice.items.reduce((acc, item) => acc + (item.quantity * item.price), 0), [])
    const total = subtotal

    return (
        <div className="min-h-screen bg-muted/5 font-sans pb-20">
            {/* Premium Header */}
            <div className="bg-background border-b py-4">
                <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-serif font-bold">E</div>
                        <span className="font-serif text-lg font-bold tracking-tight">Emini</span>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                        Secure Invoice Delivery
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 mt-12 grid gap-8 lg:grid-cols-3">
                {/* Main Invoice Content */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-none shadow-xl overflow-hidden rounded-3xl">
                        <div
                            className="h-2 w-full"
                            style={{ backgroundColor: mockInvoice.brandColor }}
                        />
                        <CardContent className="p-12">
                            <div className="flex justify-between items-start mb-16">
                                <div>
                                    {mockInvoice.logo && <img src={mockInvoice.logo} alt="Logo" className="w-16 h-16 object-contain mb-4" />}
                                    <h2 className="text-4xl font-serif font-bold tracking-tight uppercase">Invoice</h2>
                                    <p className="text-muted-foreground mt-2">{mockInvoice.number}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1">Date</div>
                                    <div className="text-lg font-medium">{mockInvoice.date}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-12 mb-16">
                                <div>
                                    <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2">Billed To</div>
                                    <div className="text-lg font-bold">{mockInvoice.customerName}</div>
                                    <div className="text-muted-foreground">{mockInvoice.customerEmail}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2">Total Due</div>
                                    <div className="text-4xl font-serif font-bold text-primary">${total.toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-12 gap-4 pb-4 border-b text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    <div className="col-span-8">Description</div>
                                    <div className="col-span-1 text-right">Qty</div>
                                    <div className="col-span-3 text-right">Price</div>
                                </div>
                                {mockInvoice.items.map((item, i) => (
                                    <div key={i} className="grid grid-cols-12 gap-4 text-sm items-center">
                                        <div className="col-span-8 font-medium">{item.description}</div>
                                        <div className="col-span-1 text-right text-muted-foreground">{item.quantity}</div>
                                        <div className="col-span-3 text-right font-mono">${item.price.toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-12 pt-12 border-t flex justify-end">
                                <div className="w-full max-w-[240px] space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span className="font-medium">${subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total Due</span>
                                        <span style={{ color: mockInvoice.brandColor }}>${total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {mockInvoice.notes && (
                                <div className="mt-16 pt-8 border-t">
                                    <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-4">Notes</div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{mockInvoice.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Actions */}
                <div className="space-y-6">
                    <Card className="border-none shadow-lg rounded-3xl overflow-hidden">
                        <CardHeader className="bg-primary text-primary-foreground p-6">
                            <CardTitle className="text-xl font-serif">Secure Payment</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-2xl">
                                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <div className="text-sm">
                                    <div className="font-bold">Outstanding</div>
                                    <div className="text-muted-foreground text-xs">Awaiting payment</div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Button className="w-full h-12 rounded-full font-bold text-base bg-blue-600 hover:bg-blue-700">
                                    <CreditCard className="mr-2 h-5 w-5" />
                                    Pay with Stripe
                                </Button>
                                <Button variant="outline" className="w-full h-12 rounded-full font-semibold">
                                    <Download className="mr-2 h-5 w-5" />
                                    Download PDF
                                </Button>
                            </div>

                            <div className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold">
                                Protected by Emini Secure Pay
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-none bg-muted/10 rounded-3xl p-6">
                        <h4 className="font-bold text-sm mb-4">Need help?</h4>
                        <p className="text-sm text-muted-foreground mb-4">If you have any questions regarding this invoice, please contact the sender directly.</p>
                        <Button variant="ghost" className="w-full justify-start px-0 text-primary font-bold hover:bg-transparent">
                            Contact Support
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    )
}
