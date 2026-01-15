"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Clock, Calendar, ArrowRight, MoreHorizontal, User, RefreshCw } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const mockRecurring = [
    { id: 1, client: "Acme Corp", amount: 1500, frequency: "monthly", nextDate: "2024-02-01", status: "active" },
    { id: 2, client: "Globex Corporation", amount: 2500, frequency: "weekly", nextDate: "2024-01-21", status: "active" },
    { id: 3, client: "Initech", amount: 800, frequency: "monthly", nextDate: "2024-02-15", status: "paused" },
]

export default function RecurringInvoicesPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    return (
        <div className="flex flex-col gap-y-8 animate-in fade-in duration-500 pb-20 px-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-serif">Recurring</h1>
                    <p className="text-muted-foreground mt-2">Automate your billing with scheduled invoice generation.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="rounded-full px-6 bg-primary text-primary-foreground hover:bg-primary/90">
                            <Plus className="mr-2 h-4 w-4" />
                            New Schedule
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <RefreshCw className="h-5 w-5" />
                                Create Recurring Schedule
                            </DialogTitle>
                            <DialogDescription>
                                Set up an automated invoice that generates on a schedule.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="client">Client</Label>
                                <Select>
                                    <SelectTrigger className="bg-muted/30">
                                        <SelectValue placeholder="Select a client" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Acme Corp</SelectItem>
                                        <SelectItem value="2">Globex Corporation</SelectItem>
                                        <SelectItem value="3">Initech</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="frequency">Frequency</Label>
                                <Select defaultValue="monthly">
                                    <SelectTrigger className="bg-muted/30">
                                        <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="quarterly">Quarterly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="start-date">First Invoice Date</Label>
                                <Input id="start-date" type="date" className="bg-muted/30" defaultValue={new Date().toISOString().split('T')[0]} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="amount">Base Amount ($)</Label>
                                <Input id="amount" type="number" placeholder="0.00" className="bg-muted/30" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="w-full rounded-full" onClick={() => setIsDialogOpen(false)}>Start Automation</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6">
                {mockRecurring.map((item) => (
                    <Card key={item.id} className="border-none shadow-none bg-muted/10 hover:bg-muted/20 transition-all group overflow-hidden rounded-2xl">
                        <CardContent className="p-0">
                            <div className="flex flex-col sm:flex-row sm:items-center">
                                <div className="p-6 flex items-center gap-4 flex-1">
                                    <div className="w-12 h-12 rounded-xl bg-background border flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                        <Clock className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{item.client}</h3>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <span className="capitalize">{item.frequency}</span>
                                            <span className="mx-2">·</span>
                                            <span>Next: {item.nextDate}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 py-4 sm:py-0 border-t sm:border-t-0 sm:border-l border-muted-foreground/10 flex items-center gap-8">
                                    <div className="text-right sm:min-w-[120px]">
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Amount</div>
                                        <div className="text-xl font-mono font-bold">${item.amount.toLocaleString()}</div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                            item.status === 'active' ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
                                        )}>
                                            {item.status}
                                        </span>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuItem>Edit Schedule</DropdownMenuItem>
                                                <DropdownMenuItem>{item.status === 'active' ? 'Pause' : 'Resume'}</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">Stop Schedule</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {mockRecurring.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-muted/5 rounded-3xl border-2 border-dashed border-muted-foreground/10">
                    <Clock className="h-12 w-12 text-muted-foreground/20 mb-4" />
                    <h2 className="text-xl font-serif">No recurring invoices yet</h2>
                    <p className="text-muted-foreground mt-2">Create a schedule to automate your monthly billing.</p>
                    <Button variant="outline" className="mt-6 rounded-full" onClick={() => setIsDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create your first schedule
                    </Button>
                </div>
            )}
        </div>
    )
}
