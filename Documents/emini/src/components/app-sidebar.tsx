"use client";

import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
    IconBrandTabler,
    IconSettings,
    IconReceipt,
    IconClock,
    IconInbox,
    IconUsers,
    IconSearch,
    IconBell,
    IconLogout,
    IconUserCircle,
    IconMessageCircle,
    IconUsersGroup,
    IconMoon,
    IconChevronDown,
    IconPlus,
} from "@tabler/icons-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";

export function AppSidebar({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [showSwitcher, setShowSwitcher] = useState(false);

    const links = [
        {
            label: "Overview",
            href: "/overview",
            icon: <IconBrandTabler className="h-6 w-6 shrink-0" />,
        },
        {
            label: "Invoices",
            href: "/invoices",
            icon: <IconReceipt className="h-6 w-6 shrink-0" />,
        },
        {
            label: "Inbox",
            href: "/inbox",
            icon: <IconInbox className="h-6 w-6 shrink-0" />,
        },
        {
            label: "Recurring",
            href: "/recurring",
            icon: <IconClock className="h-6 w-6 shrink-0" />,
        },
        {
            label: "Clients",
            href: "/clients",
            icon: <IconUsers className="h-6 w-6 shrink-0" />,
        },
        {
            label: "Apps",
            href: "/apps",
            icon: <IconBrandTabler className="h-6 w-6 shrink-0" />,
        },
        {
            label: "Settings",
            href: "/settings",
            icon: <IconSettings className="h-6 w-6 shrink-0" />,
        },
    ];

    return (
        <div className="flex h-screen bg-[#0d0d0d] text-white selection:bg-primary/30 overflow-hidden relative font-serif">
            {/* Sidebar Component */}
            <Sidebar open={open} setOpen={setOpen} animate={true}>
                <SidebarBody className="justify-between gap-10 bg-[#0d0d0d] border-r border-white/5 h-full py-6 transition-all duration-300 rounded-none overflow-hidden">
                    <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden pt-2 no-scrollbar">
                        {/* Logo Section */}
                        <div className="flex items-center px-4 mb-8">
                            <Link href="/overview" className="flex items-center hover:opacity-80 transition-opacity">
                                <img src="/logo.png" alt="Logo" className="w-11 h-11 object-contain shrink-0" />
                            </Link>
                        </div>

                        {/* Active Workspace Header */}
                        <div className="flex items-center px-4 mb-10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-none bg-neutral-900 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white shadow-[inset_0_1px_rgba(255,255,255,0.05)]">
                                    OR
                                </div>
                                {open && (
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-white whitespace-nowrap tracking-tight">orbify</span>
                                        <span className="text-[10px] text-muted-foreground/60 leading-none">Pro Plan</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="flex flex-col gap-1 px-4">
                            {links.map((link, idx) => (
                                <SidebarLink
                                    key={idx}
                                    link={link}
                                    className="text-neutral-500 hover:text-white transition-colors py-2.5 px-0 rounded-none hover:bg-white/5 w-full flex justify-start items-center gap-4 group/sidebar"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Organization Switcher at Bottom */}
                    <div className="flex flex-col gap-2 p-4 pt-10 border-t border-white/5 relative">
                        <AnimatePresence>
                            {showSwitcher && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="flex flex-col gap-2 mb-2"
                                >
                                    <Button variant="ghost" className="w-8 h-8 p-0 rounded-none bg-neutral-900 border border-white/10 hover:bg-white/5 text-white/50 hover:text-white transition-all shadow-lg">
                                        <IconPlus className="h-4 w-4" />
                                    </Button>
                                    <div className="w-8 h-8 rounded-none bg-neutral-900 border border-white/10 flex items-center justify-center text-[8px] font-bold text-white cursor-pointer hover:bg-white/5 transition-all shadow-lg">
                                        OR
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div
                            onClick={() => setShowSwitcher(!showSwitcher)}
                            className="flex items-center gap-3 cursor-pointer group/switcher"
                        >
                            <div className={cn(
                                "w-8 h-8 rounded-none border flex items-center justify-center text-[10px] font-bold transition-all shadow-md",
                                showSwitcher
                                    ? "bg-white text-black border-white"
                                    : "bg-neutral-900 text-white border-white/10 hover:border-white/20"
                            )}>
                                ED
                            </div>
                            {open && (
                                <span className={cn(
                                    "text-xs font-bold transition-colors",
                                    showSwitcher ? "text-white" : "text-white/60 group-hover/switcher:text-white"
                                )}>
                                    edwf
                                </span>
                            )}
                        </div>
                    </div>
                </SidebarBody>
            </Sidebar>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 relative z-10 overflow-hidden">
                {/* Dashboard Top Header (Pic 2 & 3) */}
                <header className="h-16 flex items-center justify-between px-8 bg-[#0d0d0d]/50 backdrop-blur-sm border-b border-white/5">
                    <div className="flex items-center gap-4 text-neutral-400 hover:text-white transition-colors cursor-pointer group">
                        <IconSearch className="h-4 w-4" />
                        <span className="text-sm font-medium">Find anything...</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Pro Trial Banner (Pic 2) */}
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111] border border-white/10 text-[10px] uppercase tracking-wider font-bold text-white">
                            Pro trial - 12 days left
                        </div>

                        <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white hover:bg-white/5 rounded-none">
                            <IconBell className="h-5 w-5" />
                        </Button>

                        {/* Interactive User Menu (Pic 3) */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-2 outline-none">
                                    <Avatar className="h-8 w-8 border border-white/10 shadow-lg rounded-full">
                                        <AvatarImage src="https://github.com/shadcn.png" className="rounded-full" />
                                        <AvatarFallback className="bg-gradient-to-tr from-purple-500 to-blue-500 text-[10px] text-white font-bold rounded-full">CA</AvatarFallback>
                                    </Avatar>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[240px] bg-[#09090b] border-white/10 text-white p-2 p-y-4 shadow-2xl rounded-none mt-2">
                                <DropdownMenuLabel className="px-3 pt-3 pb-4">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-bold leading-none">Cameron .F</p>
                                        <p className="text-xs leading-none text-neutral-500">cameron@example.com</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/5 mx-2" />
                                <div className="py-2">
                                    <DropdownMenuItem className="focus:bg-white/5 focus:text-white cursor-pointer px-3 py-2.5 rounded-none flex items-center gap-3">
                                        <IconUserCircle className="h-4 w-4 text-neutral-400" />
                                        <span>Account</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="focus:bg-white/5 focus:text-white cursor-pointer px-3 py-2.5 rounded-none flex items-center gap-3">
                                        <IconMessageCircle className="h-4 w-4 text-neutral-400" />
                                        <span>Support</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="focus:bg-white/5 focus:text-white cursor-pointer px-3 py-2.5 rounded-none flex items-center gap-3">
                                        <IconUsersGroup className="h-4 w-4 text-neutral-400" />
                                        <span>Teams</span>
                                    </DropdownMenuItem>
                                </div>
                                <DropdownMenuSeparator className="bg-white/5 mx-2" />
                                <div className="py-2">
                                    <div className="flex items-center justify-between px-3 py-2.5 text-sm text-neutral-400">
                                        <div className="flex items-center gap-3 text-white">
                                            <IconMoon className="h-4 w-4 text-neutral-400" />
                                            <span>Theme</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-none bg-white/5 border border-white/10 text-[11px] text-white">
                                            <IconMoon className="h-3 w-3" />
                                            <span>System</span>
                                            <IconChevronDown className="h-3 w-3 opacity-50" />
                                        </div>
                                    </div>
                                </div>
                                <DropdownMenuSeparator className="bg-white/5 mx-2" />
                                <div className="py-2">
                                    <DropdownMenuItem className="focus:bg-red-500/10 focus:text-red-500 text-neutral-400 cursor-pointer px-3 py-2.5 rounded-none flex items-center gap-3 transition-colors">
                                        <IconLogout className="h-4 w-4" />
                                        <span>Sign out</span>
                                    </DropdownMenuItem>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Dashboard Scrollable Content */}
                <main className="flex-1 overflow-y-auto p-12 bg-[#0d0d0d]">
                    <div className="max-w-[1600px] mx-auto h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
