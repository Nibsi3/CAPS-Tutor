"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    IconSettings,
    IconInbox,
    IconUsers,
    IconCreditCard,
    IconShieldLock,
    IconBell
} from "@tabler/icons-react"

const sidebarNavItems = [
    {
        title: "General",
        href: "/settings",
        icon: <IconSettings className="h-4 w-4" />,
    },
    {
        title: "Inbox",
        href: "/settings/inbox",
        icon: <IconInbox className="h-4 w-4" />,
    },
    {
        title: "Team",
        href: "/settings/team",
        icon: <IconUsers className="h-4 w-4" />,
    },
    {
        title: "Billing",
        href: "/settings/billing",
        icon: <IconCreditCard className="h-4 w-4" />,
    },
    {
        title: "Security",
        href: "/settings/security",
        icon: <IconShieldLock className="h-4 w-4" />,
    },
    {
        title: "Notifications",
        href: "/settings/notifications",
        icon: <IconBell className="h-4 w-4" />,
    },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    return (
        <div className="flex flex-col space-y-8 animate-in fade-in duration-500 pb-20 max-w-6xl mx-auto">
            <div className="space-y-0.5">
                <h2 className="text-3xl font-serif text-white tracking-tight italic">Settings</h2>
                <p className="text-neutral-500">Manage your account settings and preferences.</p>
            </div>

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                <aside className="lg:w-1/5">
                    <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
                        {sidebarNavItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                                    pathname === item.href
                                        ? "bg-white/5 text-white border border-white/5"
                                        : "text-neutral-500 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {item.icon}
                                {item.title}
                            </Link>
                        ))}
                    </nav>
                </aside>
                <div className="flex-1 lg:max-w-screen-md">
                    <div className="bg-[#09090b] border border-white/5 rounded-2xl p-8 min-h-[600px]">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}
