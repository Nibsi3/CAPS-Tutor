"use client"

import * as React from "react"
import { Drawer } from "vaul"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { X, Globe, Phone, Mail, User, MapPin, Hash, FileText } from "lucide-react"

interface CustomerDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CustomerDrawer({ open, onOpenChange }: CustomerDrawerProps) {
    return (
        <Drawer.Root open={open} onOpenChange={onOpenChange} direction="right">
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50 transition-opacity duration-300" />
                <Drawer.Content className="bg-background flex flex-col rounded-l-[2rem] h-full w-full max-w-lg fixed bottom-0 right-0 z-50 shadow-2xl transition-transform duration-300 ease-in-out">
                    <div className="p-8 flex-1 overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <Drawer.Title className="text-3xl font-serif font-bold tracking-tight">
                                Create Customer
                            </Drawer.Title>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full"
                                onClick={() => onOpenChange(false)}
                            >
                                <X className="h-6 w-6" />
                            </Button>
                        </div>

                        <Accordion type="multiple" defaultValue={["general"]} className="w-full">
                            <AccordionItem value="general" className="border-none">
                                <AccordionTrigger className="text-xl font-serif font-bold py-6 hover:no-underline">
                                    General
                                </AccordionTrigger>
                                <AccordionContent className="pt-2 pb-6 space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="cust-name" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Name</Label>
                                        <Input id="cust-name" placeholder="Acme Inc" className="h-12 rounded-xl bg-muted/20 border-none shadow-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cust-email" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Email</Label>
                                        <Input id="cust-email" type="email" placeholder="acme@example.com" className="h-12 rounded-xl bg-muted/20 border-none shadow-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cust-billing" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Billing Email</Label>
                                        <Input id="cust-billing" type="email" placeholder="finance@example.com" className="h-12 rounded-xl bg-muted/20 border-none shadow-sm" />
                                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight pl-1">This is an additional email that will be used to send invoices to.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cust-phone" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Phone</Label>
                                        <Input id="cust-phone" placeholder="+1 (555) 123-4567" className="h-12 rounded-xl bg-muted/20 border-none shadow-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cust-website" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Website</Label>
                                        <Input id="cust-website" placeholder="acme.com" className="h-12 rounded-xl bg-muted/20 border-none shadow-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cust-contact" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Contact person</Label>
                                        <Input id="cust-contact" placeholder="John Doe" className="h-12 rounded-xl bg-muted/20 border-none shadow-sm" />
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="details" className="border-none mt-2">
                                <AccordionTrigger className="text-xl font-serif font-bold py-6 hover:no-underline">
                                    Details
                                </AccordionTrigger>
                                <AccordionContent className="pt-2 pb-6 space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="cust-address-search" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Address Search</Label>
                                        <Input id="cust-address-search" placeholder="Search for an address" className="h-12 rounded-xl bg-muted/20 border-none shadow-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cust-address-1" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Address Line 1</Label>
                                        <Input id="cust-address-1" placeholder="123 Main St" className="h-12 rounded-xl bg-muted/20 border-none shadow-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cust-address-2" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Address Line 2</Label>
                                        <Input id="cust-address-2" placeholder="Suite 100" className="h-12 rounded-xl bg-muted/20 border-none shadow-sm" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">City</Label>
                                            <Input placeholder="New York" className="h-12 rounded-xl bg-muted/20 border-none shadow-sm" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">State / Province</Label>
                                            <Input placeholder="NY" className="h-12 rounded-xl bg-muted/20 border-none shadow-sm" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">ZIP Code</Label>
                                            <Input placeholder="10001" className="h-12 rounded-xl bg-muted/20 border-none shadow-sm" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cust-tax-id" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Tax ID / VAT Number</Label>
                                        <Input id="cust-tax-id" placeholder="Enter VAT number" className="h-12 rounded-xl bg-muted/20 border-none shadow-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cust-note" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Note</Label>
                                        <textarea
                                            id="cust-note"
                                            placeholder="Additional information..."
                                            className="w-full min-h-[120px] p-4 rounded-xl bg-muted/20 border-none shadow-sm resize-none focus:ring-0 text-sm"
                                        />
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                    <div className="p-8 border-t bg-background/50 backdrop-blur-md flex items-center justify-end gap-3 sticky bottom-0">
                        <Button variant="ghost" className="rounded-xl px-6 h-12 font-bold" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button className="rounded-xl px-8 h-12 font-bold shadow-lg" onClick={() => onOpenChange(false)}>
                            Create
                        </Button>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    )
}
