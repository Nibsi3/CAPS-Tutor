"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mail, ChevronDown, ChevronUp, Copy, Check } from "lucide-react"
import { IconBrandGoogle, IconBrandOffice, IconBrandSlack, IconBrandWhatsapp } from "@tabler/icons-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function InboxPage() {
    const [isExpanded, setIsExpanded] = useState(false)
    const [copied, setCopied] = useState(false)
    const inboxEmail = "kvg2mzdsau@inbox.midday.ai"

    const copyEmail = () => {
        navigator.clipboard.writeText(inboxEmail)
        setCopied(true)
        toast.success("Copied to clipboard")
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col items-center text-center gap-y-6 max-w-lg w-full px-4">
                <div className="space-y-2">
                    <h1 className="text-2xl font-medium tracking-tight bg-gradient-to-br from-white to-neutral-400 bg-clip-text text-transparent">
                        Connect Your Inbox
                    </h1>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
                        Connect your email or messaging apps to automatically import receipts and invoices.
                        We&apos;ll extract the data and match it to your transactions.
                    </p>
                </div>

                <div className="flex flex-col gap-3 w-full max-w-xs pt-4">
                    <Button
                        variant="outline"
                        className="h-12 rounded-xl justify-center gap-3 text-sm font-medium bg-[#121212] border-white/5 hover:bg-[#1A1A1A] hover:text-white transition-all w-full"
                    >
                        <IconBrandGoogle className="h-5 w-5" />
                        Connect Gmail
                    </Button>
                    <Button
                        variant="outline"
                        className="h-12 rounded-xl justify-center gap-3 text-sm font-medium bg-[#121212] border-white/5 hover:bg-[#1A1A1A] hover:text-white transition-all w-full"
                    >
                        <IconBrandOffice className="h-5 w-5 text-blue-500" />
                        Connect Outlook
                    </Button>
                </div>

                <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-white text-xs font-medium flex items-center gap-1 mt-2"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    More options
                    {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </Button>

                {isExpanded && (
                    <div className="flex flex-col gap-3 w-full max-w-xs animate-in fade-in slide-in-from-top-2 duration-300">
                        <Button
                            variant="outline"
                            className="h-12 rounded-xl justify-center gap-3 text-sm font-medium bg-[#121212] border-white/5 hover:bg-[#1A1A1A] hover:text-white transition-all w-full"
                        >
                            <IconBrandSlack className="h-5 w-5 text-purple-500" />
                            Connect Slack
                        </Button>
                        <Button
                            variant="outline"
                            className="h-12 rounded-xl justify-center gap-3 text-sm font-medium bg-[#121212] border-white/5 hover:bg-[#1A1A1A] hover:text-white transition-all w-full"
                        >
                            <IconBrandWhatsapp className="h-5 w-5 text-green-500" />
                            Connect WhatsApp
                        </Button>

                        <div className="flex items-center gap-2 h-12 px-4 rounded-xl bg-[#121212] border border-white/5 mt-2">
                            <span className="flex-1 text-sm text-muted-foreground font-mono truncate text-left">
                                {inboxEmail}
                            </span>
                            <button
                                onClick={copyEmail}
                                className="text-muted-foreground hover:text-white transition-colors"
                            >
                                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-12 text-xs text-muted-foreground/50 font-medium">
                    You can also just drag and drop files here for automatic reconciliation
                </div>
            </div>
        </div>
    )
}
