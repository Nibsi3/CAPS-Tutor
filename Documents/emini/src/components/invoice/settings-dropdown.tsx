"use client"

import * as React from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
    Settings,
    Calendar,
    Layers,
    Percent,
    Calculator,
    DollarSign,
    Mail,
    Users,
    Hash,
    QrCode,
    Clock,
    Link,
    Edit,
    Copy,
    Trash2,
    FileText
} from "lucide-react"

export function InvoiceSettings() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-xl bg-muted/20 border-none">
                    <Settings className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 rounded-2xl p-2" align="start">
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="rounded-xl py-2.5">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>Date format</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent className="rounded-xl">
                            <DropdownMenuItem className="rounded-lg">DD/MM/YYYY</DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg">MM/DD/YYYY</DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg">YYYY-MM-DD</DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg">dd.MM.yyyy</DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="rounded-xl py-2.5">
                        <Layers className="mr-2 h-4 w-4" />
                        <span>Invoice size</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent className="rounded-xl">
                            <DropdownMenuItem className="rounded-lg">A4</DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg">Letter</DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuItem className="rounded-xl py-2.5">
                    <Percent className="mr-2 h-4 w-4" />
                    <span>Add sales tax</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="rounded-xl py-2.5">
                    <Percent className="mr-2 h-4 w-4" />
                    <span>Line item tax</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="rounded-xl py-2.5">
                    <Calculator className="mr-2 h-4 w-4" />
                    <span>Add VAT</span>
                </DropdownMenuItem>

                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="rounded-xl py-2.5">
                        <DollarSign className="mr-2 h-4 w-4" />
                        <span>Currency</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent className="rounded-xl max-h-60 overflow-y-auto">
                            <DropdownMenuItem className="rounded-lg">ZAR (R)</DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg">USD ($)</DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg">EUR (€)</DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg">GBP (£)</DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuItem className="rounded-xl py-2.5">
                    <Percent className="mr-2 h-4 w-4" />
                    <span>Add discount</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="rounded-xl py-2.5">
                    <Mail className="mr-2 h-4 w-4" />
                    <span>Attach PDF in email</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="rounded-xl py-2.5">
                    <Users className="mr-2 h-4 w-4" />
                    <span>Send copy (BCC)</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="rounded-xl py-2.5">
                    <Layers className="mr-2 h-4 w-4" />
                    <span>Add units</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="rounded-xl py-2.5">
                    <Hash className="mr-2 h-4 w-4" />
                    <span>Decimals</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="rounded-xl py-2.5">
                    <QrCode className="mr-2 h-4 w-4" />
                    <span>Add QR code</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="rounded-xl py-2.5">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>Payment terms</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-2" />

                <DropdownMenuItem className="rounded-xl py-2.5">
                    <Link className="mr-2 h-4 w-4" />
                    <span>Connect Stripe</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-2" />

                <DropdownMenuItem className="rounded-xl py-2.5">
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Rename template</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="rounded-xl py-2.5">
                    <Copy className="mr-2 h-4 w-4" />
                    <span>Duplicate template</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="rounded-xl py-2.5 text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete template</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
