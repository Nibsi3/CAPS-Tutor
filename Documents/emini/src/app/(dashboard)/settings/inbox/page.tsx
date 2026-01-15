"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Copy,
    Trash2,
    RefreshCcw,
    Mail,
    ChevronDown,
    Plus
} from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

export default function InboxSettings() {
    const [email] = useState("kvg2mzdsau@inbox.midday.ai")

    const copyToClipboard = () => {
        navigator.clipboard.writeText(email)
        toast.success("Email address copied to clipboard")
    }

    return (
        <div className="space-y-12">
            {/* Email Address Section */}
            <div className="space-y-4">
                <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-medium text-white">Email Address</h3>
                    <p className="text-sm text-neutral-500 max-w-xl">
                        Use this unique email address for online purchases and receipts. Emails sent to this address will automatically appear in your Inbox and can be matched against transactions.
                    </p>
                </div>
                <div className="flex items-center gap-2 max-w-md">
                    <div className="flex-1 bg-black border border-white/5 rounded-lg px-4 py-2.5 text-sm font-mono text-neutral-400">
                        {email}
                    </div>
                    <Button variant="ghost" size="icon" className="border border-white/5 bg-black hover:bg-white/5" onClick={copyToClipboard}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Blocklist Section */}
            <div className="space-y-6 pt-10 border-t border-white/5">
                <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-medium text-white">Blocklist</h3>
                    <p className="text-sm text-neutral-500 max-w-xl">
                        Block specific email addresses or domains from appearing in your inbox. For example, block "netflix.com" to prevent Netflix receipts from showing up.
                    </p>
                </div>

                <div className="flex items-center gap-3 max-w-md">
                    <Input placeholder="example.com" className="bg-black border-white/5 h-10 focus-visible:ring-white/10" />
                    <Select defaultValue="domain">
                        <SelectTrigger className="w-32 bg-black border-white/5 h-10 focus:ring-white/10">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#09090b] border-white/10 text-white">
                            <SelectItem value="domain">Domain</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 h-10 px-6">
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                </Button>

                <div className="flex justify-end pt-4">
                    <Button className="bg-white text-black hover:bg-neutral-200 h-10">
                        Save changes
                    </Button>
                </div>
            </div>

            {/* Email Connections Section */}
            <div className="space-y-6 pt-10 border-t border-white/5">
                <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-medium text-white">Email Connections</h3>
                    <p className="text-sm text-neutral-500 max-w-xl">
                        Manage your connected email accounts or connect a new one.
                    </p>
                </div>

                <div className="bg-black/50 border border-white/5 rounded-xl p-4 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center">
                            <img src="https://www.google.com/favicon.ico" className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" alt="Gmail" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-white">cameronfalck03@gmail.com</span>
                            <span className="text-[11px] text-neutral-500">Last accessed about 5 hours ago</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-neutral-500 hover:text-white hover:bg-white/5 rounded-lg border border-transparent hover:border-white/10">
                            <RefreshCcw className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/10">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <Button variant="outline" className="w-full h-11 border-white/5 bg-transparent hover:bg-white/5 transition-colors border-dashed border-2">
                    Connect email
                </Button>
            </div>
        </div>
    )
}
