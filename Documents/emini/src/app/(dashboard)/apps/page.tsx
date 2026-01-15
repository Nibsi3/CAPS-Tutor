"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { IconBrandGoogle, IconBrandOffice, IconBrandSlack, IconBrandWhatsapp, IconBrandStripe, IconLayoutGrid } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

const apps = [
    {
        name: "Gmail",
        description: "Automatically capture receipts and invoices from your Gmail inbox. Documents are extracted and matched to transactions in real-time.",
        icon: <IconBrandGoogle className="w-6 h-6 text-red-500" />,
        installed: true,
        bg: "bg-red-500/10",
        action: "Installed",
    },
    {
        name: "Outlook",
        description: "Automatically capture receipts and invoices from your Outlook inbox. Documents are extracted and matched to transactions in real-time.",
        icon: <IconBrandOffice className="w-6 h-6 text-blue-500" />,
        installed: false,
        bg: "bg-blue-500/10",
        action: "Install",
    },
    {
        name: "Slack",
        description: "Get transaction notifications and upload receipts directly from Slack. Midday automatically extracts data and matches them to transactions.",
        icon: <IconBrandSlack className="w-6 h-6 text-purple-500" />,
        installed: false,
        bg: "bg-purple-500/10",
        action: "Install",
    },
    {
        name: "WhatsApp",
        description: "Forward receipts and invoices directly from WhatsApp. Midday automatically extracts data and matches them to transactions.",
        icon: <IconBrandWhatsapp className="w-6 h-6 text-green-500" />,
        installed: false,
        bg: "bg-green-500/10",
        action: "Install",
    },
    {
        name: "Stripe Payments",
        description: "Accept credit card and other payments on your invoices.",
        icon: <IconBrandStripe className="w-6 h-6 text-[#635BFF]" />,
        installed: false,
        bg: "bg-[#635BFF]/10",
        action: "Install",
    },
    {
        name: "Midday Desktop",
        description: "With Midday on Mac you have everything accessible just one click away. Track time, manage invoices, and run your business smarter.",
        icon: <IconLayoutGrid className="w-6 h-6 text-white" />,
        installed: false,
        bg: "bg-white/10",
        action: "Download",
    }
]

export default function AppsPage() {
    return (
        <div className="flex flex-col gap-8 pb-20">
            <div>
                <h1 className="text-4xl font-serif font-medium mb-1">Apps</h1>
                <p className="text-muted-foreground">Manage your installed apps and integrations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {apps.map((app) => (
                    <Card key={app.name} className="bg-[#09090b] border-white/5 flex flex-col">
                        <CardHeader className="flex-row items-center gap-4 space-y-0 pb-4">
                            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", app.bg)}>
                                {app.icon}
                            </div>
                            {app.installed && (
                                <div className="ml-auto">
                                    <span className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                        Installed
                                    </span>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="flex-1">
                            <CardTitle className="text-lg font-medium mb-2">{app.name}</CardTitle>
                            <CardDescription className="text-xs leading-relaxed">
                                {app.description}
                            </CardDescription>
                        </CardContent>
                        <CardFooter className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                            <Button variant="ghost" className="w-full text-xs font-medium text-muted-foreground hover:text-white">
                                Details
                            </Button>
                            <Button variant="outline" className={cn(
                                "w-full text-xs font-bold border-white/10 hover:bg-white/5",
                                app.installed && "text-red-400 hover:text-red-300 hover:bg-red-950/30 border-red-900/30"
                            )}>
                                {app.installed ? "Disconnect" : app.action}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
