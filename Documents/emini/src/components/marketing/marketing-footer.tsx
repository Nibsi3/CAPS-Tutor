"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    IconBrandTwitter,
    IconBrandGithub,
    IconBrandLinkedin,
    IconBrandDiscord,
} from "@tabler/icons-react"

const footerLinks = {
    features: [
        { name: "Overview", href: "/features/overview" },
        { name: "Invoicing", href: "/features/invoice" },
        { name: "Inbox", href: "/features/inbox" },
        { name: "Vault", href: "/features/vault" },
    ],
    resources: [
        { name: "Documentation", href: "#" },
        { name: "Support", href: "#" },
        { name: "Privacy Policy", href: "#" },
        { name: "Terms of Service", href: "#" },
    ],
    company: [
        { name: "Story", href: "/story" },
        { name: "Pricing", href: "/pricing" },
        { name: "Contact", href: "#" },
    ],
}

const socialLinks = [
    { name: "Twitter", icon: IconBrandTwitter, href: "#" },
    { name: "GitHub", icon: IconBrandGithub, href: "#" },
    { name: "LinkedIn", icon: IconBrandLinkedin, href: "#" },
    { name: "Discord", icon: IconBrandDiscord, href: "#" },
]

export function MarketingFooter() {
    return (
        <footer className="bg-black border-t border-white/5">
            {/* CTA Section */}
            <div className="py-24 text-center">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                    Stress free by <span className="font-serif italic">emini.</span>
                </h2>
                <p className="text-white/50 text-sm max-w-xl mx-auto mb-8">
                    Invoicing. Time tracking. File reconciliation. Storage. Financial Overview.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                        variant="outline"
                        className="rounded-full px-8 h-11 border-white/20 text-white hover:bg-white/5"
                    >
                        Talk to founders
                    </Button>
                    <Button
                        asChild
                        className="bg-white text-black hover:bg-white/90 rounded-full px-8 h-11"
                    >
                        <Link href="/login">Get Started</Link>
                    </Button>
                </div>
            </div>

            {/* Links Section */}
            <div className="border-t border-white/5 py-16">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {/* Features */}
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-4">
                                Features
                            </h3>
                            <ul className="space-y-3">
                                {footerLinks.features.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-white/70 hover:text-white transition-colors"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Resources */}
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-4">
                                Resources
                            </h3>
                            <ul className="space-y-3">
                                {footerLinks.resources.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-white/70 hover:text-white transition-colors"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-4">
                                Company
                            </h3>
                            <ul className="space-y-3">
                                {footerLinks.company.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-white/70 hover:text-white transition-colors"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Newsletter */}
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-4">
                                Run your business smarter.
                            </h3>
                            <div className="flex gap-2">
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-full h-10"
                                />
                                <Button className="bg-white text-black hover:bg-white/90 rounded-full px-4 h-10">
                                    →
                                </Button>
                            </div>

                            {/* Social Links */}
                            <div className="flex items-center gap-4 mt-6">
                                {socialLinks.map((social) => (
                                    <Link
                                        key={social.name}
                                        href={social.href}
                                        className="text-white/50 hover:text-white transition-colors"
                                    >
                                        <social.icon className="h-5 w-5" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom watermark */}
            <div className="relative overflow-hidden py-12">
                <div className="text-[12rem] md:text-[18rem] font-bold text-white/[0.02] text-center leading-none tracking-tighter select-none">
                    emini
                </div>
            </div>
        </footer>
    )
}
