"use client"

import Link from "next/link"
import Image from "next/image"
import { IconMenu2, IconX, IconChevronDown } from "@tabler/icons-react"
import { useState } from "react"

const featureDropdownItems = [
    { name: "Financial Overview", href: "/features/overview" },
    { name: "Invoicing", href: "/features/invoice" },
    { name: "Magic Inbox", href: "/features/inbox" },
    { name: "File Vault", href: "/features/vault" },
]

const navigation = [
    { name: "Pricing", href: "/pricing" },
    { name: "Story", href: "/story" },
]

export function MarketingHeader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [featuresOpen, setFeaturesOpen] = useState(false)

    return (
        <header className="fixed top-0 left-0 right-0 z-50 pt-4 px-4">
            {/* Wider navigation with reduced height */}
            <nav className="mx-auto max-w-4xl flex items-center justify-center gap-6 px-6 py-1.5 bg-[#111]/90 backdrop-blur-xl rounded-lg border border-white/10">
                {/* Logo */}
                <Link href="/" className="flex items-center">
                    <Image
                        src="/logo.png"
                        alt="Emini Logo"
                        width={24}
                        height={24}
                        className="w-6 h-6"
                    />
                </Link>

                {/* Features Dropdown */}
                <div className="relative hidden md:block">
                    <button
                        className="flex items-center gap-1 text-sm text-white/70 hover:text-white transition-colors"
                        onClick={() => setFeaturesOpen(!featuresOpen)}
                        onBlur={() => setTimeout(() => setFeaturesOpen(false), 150)}
                    >
                        Features
                        <IconChevronDown className={`h-3 w-3 transition-transform ${featuresOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {featuresOpen && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-[#111] border border-white/10 rounded-lg shadow-xl overflow-hidden">
                            {featureDropdownItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="block px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-6">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="text-sm text-white/70 hover:text-white transition-colors"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Separator and Sign in */}
                <div className="hidden md:flex items-center gap-4">
                    <span className="text-white/20">|</span>
                    <Link
                        href="/login"
                        className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                        Sign in
                    </Link>
                </div>

                {/* Mobile menu button */}
                <button
                    type="button"
                    className="md:hidden text-white"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? (
                        <IconX className="h-4 w-4" />
                    ) : (
                        <IconMenu2 className="h-4 w-4" />
                    )}
                </button>
            </nav>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden mt-2 mx-auto max-w-3xl bg-[#111] rounded-lg border border-white/10 overflow-hidden">
                    <div className="px-4 py-3 space-y-3">
                        <div className="text-xs uppercase tracking-wider text-white/40 mb-2">Features</div>
                        {featureDropdownItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="block text-sm text-white/70 hover:text-white transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                        <div className="pt-3 border-t border-white/10 space-y-3">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="block text-sm text-white/70 hover:text-white transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                        <div className="pt-3 border-t border-white/10">
                            <Link
                                href="/login"
                                className="block text-sm text-white/70 hover:text-white transition-colors"
                            >
                                Sign in
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}
