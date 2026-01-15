"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Plus, RefreshCcw, Trash2 } from "lucide-react"
import { IconBrandGoogle } from "@tabler/icons-react"

export default function InboxSettingsPage() {
    return (
        <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-32">
            <div>
                <h1 className="text-4xl font-serif font-medium mb-1">Inbox Settings</h1>
                <p className="text-muted-foreground">Manage your inbox connections and preferences.</p>
            </div>

            {/* Email Address Section */}
            <div className="border border-white/5 rounded-xl bg-[#09090b] overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h2 className="font-medium text-lg mb-1">Email Address</h2>
                    <p className="text-sm text-muted-foreground">
                        Use this unique email address for online purchases and receipts. Emails sent to this address will automatically appear in your inbox and can be matched against transactions.
                    </p>
                </div>
                <div className="p-6">
                    <div className="flex items-center gap-2">
                        <div className="flex-1 bg-[#121212] border border-white/5 rounded-lg px-4 py-2.5 text-sm font-mono text-muted-foreground flex items-center justify-between">
                            <span>kvg2mzdsau@inbox.midday.ai</span>
                            <Copy className="h-4 w-4 cursor-pointer hover:text-white transition-colors" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Blocklist Section */}
            <div className="border border-white/5 rounded-xl bg-[#09090b] overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h2 className="font-medium text-lg mb-1">Blocklist</h2>
                    <p className="text-sm text-muted-foreground">
                        Block specific email addresses or domains from appearing in your inbox. For example, block "netflix.com" to prevent Netflix receipts from showing up.
                    </p>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex gap-2">
                        <Input placeholder="example.com" className="bg-[#121212] border-white/5" />
                        <div className="flex items-center px-4 border border-white/5 bg-[#121212] rounded-md text-sm text-muted-foreground">
                            Domain
                        </div>
                    </div>
                    <div>
                        <Button variant="outline" size="sm" className="bg-transparent border-white/10 hover:bg-white/5">
                            <Plus className="h-3 w-3 mr-2" />
                            Add
                        </Button>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button className="bg-white text-black hover:bg-neutral-200 font-medium">
                            Save changes
                        </Button>
                    </div>
                </div>
            </div>

            {/* Email Connections Section */}
            <div className="border border-white/5 rounded-xl bg-[#09090b] overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h2 className="font-medium text-lg mb-1">Email Connections</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage your connected email accounts or connect a new one.
                    </p>
                </div>
                <div className="p-6">
                    <div className="flex items-center justify-between p-4 border border-white/5 rounded-lg bg-[#121212] mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                                <IconBrandGoogle className="h-4 w-4 text-red-500" />
                            </div>
                            <div>
                                <div className="text-sm font-medium">cameronfalck03@gmail.com</div>
                                <div className="text-xs text-muted-foreground">Last accessed 2 minutes ago</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white">
                                <RefreshCcw className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button className="bg-white text-black hover:bg-neutral-200 font-medium">
                            Connect email
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
