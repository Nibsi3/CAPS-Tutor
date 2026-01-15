import Link from "next/link"
import { Button } from "@/components/ui/button"
import { IconArrowRight, IconFolder, IconFile, IconSearch, IconSparkles } from "@tabler/icons-react"

const files = [
    { name: "Invoice_2024_Q1.pdf", type: "PDF", size: "245 KB", date: "Jan 15, 2024" },
    { name: "Contract_Acme_Corp.pdf", type: "PDF", size: "1.2 MB", date: "Jan 10, 2024" },
    { name: "Receipt_Office_Supplies.jpg", type: "Image", size: "856 KB", date: "Jan 8, 2024" },
    { name: "Tax_Certificate_2023.pdf", type: "PDF", size: "320 KB", date: "Jan 5, 2024" },
    { name: "Bank_Statement_Dec.pdf", type: "PDF", size: "445 KB", date: "Jan 2, 2024" },
]

const folders = [
    { name: "Invoices", count: 42 },
    { name: "Contracts", count: 15 },
    { name: "Receipts", count: 128 },
    { name: "Tax Documents", count: 23 },
    { name: "Bank Statements", count: 12 },
]

export default function VaultFeaturePage() {
    return (
        <div className="bg-black">
            {/* Hero Section */}
            <section className="relative py-24 md:py-32 text-center">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent" />
                <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4">
                        <span className="font-serif italic text-white/70">Your Files</span>
                        <br />
                        Vault
                    </h1>
                    <p className="text-white/50 max-w-xl mx-auto text-lg mb-8">
                        Store all your business documents securely. Access contracts, invoices,
                        and receipts anytime, anywhere.
                    </p>
                    <Button
                        asChild
                        className="bg-white text-black hover:bg-white/90 rounded-full px-8 h-12"
                    >
                        <Link href="/login">
                            Start Organizing
                            <IconArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </section>

            {/* File Manager Mockup */}
            <section className="py-16">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="border border-white/10 rounded-3xl bg-black/50 overflow-hidden">
                        {/* Toolbar */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-sm text-white/70">
                                    <IconFolder className="h-4 w-4" />
                                    All Files
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5">
                                <IconSearch className="h-4 w-4 text-white/50" />
                                <span className="text-sm text-white/50">Search files...</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-white/5">
                            {/* Folders Sidebar */}
                            <div className="p-4 space-y-2">
                                {folders.map((folder, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <IconFolder className="h-5 w-5 text-white/50" />
                                            <span className="text-sm text-white">{folder.name}</span>
                                        </div>
                                        <span className="text-xs text-white/40">{folder.count}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Files Grid */}
                            <div className="lg:col-span-3 p-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {files.map((file, i) => (
                                        <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 cursor-pointer">
                                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                                                <IconFile className="h-6 w-6 text-white/50" />
                                            </div>
                                            <div className="text-sm font-medium text-white truncate">{file.name}</div>
                                            <div className="text-xs text-white/40 mt-1">{file.size}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* All in One Place */}
            <section className="py-24 border-t border-white/5">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">All your files in one place</h2>
                    <p className="text-white/50 max-w-xl mx-auto mb-12">
                        No more searching through emails or folders. Everything you need, organized and accessible.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                            <div className="text-3xl font-serif font-bold text-white mb-2">∞</div>
                            <div className="text-sm text-white/50">Unlimited storage</div>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                            <div className="text-3xl font-serif font-bold text-white mb-2">256-bit</div>
                            <div className="text-sm text-white/50">Encryption</div>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                            <div className="text-3xl font-serif font-bold text-white mb-2">99.9%</div>
                            <div className="text-sm text-white/50">Uptime</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Search Feature */}
            <section className="py-24 border-t border-white/5">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-6">Find what you need faster</h2>
                            <p className="text-white/50 mb-8">
                                Our powerful search lets you find any document instantly. Search by name,
                                content, date, or let AI help you find what you're looking for.
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                                    <IconSearch className="h-4 w-4 text-white/50" />
                                    <span className="text-sm text-white/50">Full-text search</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                                    <IconSparkles className="h-4 w-4 text-blue-400" />
                                    <span className="text-sm text-white/50">AI-powered</span>
                                </div>
                            </div>
                        </div>

                        <div className="border border-white/10 rounded-3xl bg-black/50 p-6">
                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 mb-4">
                                <IconSearch className="h-5 w-5 text-white/50" />
                                <span className="text-white">tax certificate 2023</span>
                            </div>
                            <div className="space-y-2">
                                <div className="p-3 rounded-xl bg-white/[0.02] flex items-center gap-3">
                                    <IconFile className="h-5 w-5 text-white/50" />
                                    <div>
                                        <div className="text-sm text-white">Tax_Certificate_2023.pdf</div>
                                        <div className="text-xs text-white/40">Tax Documents • 320 KB</div>
                                    </div>
                                </div>
                                <div className="p-3 rounded-xl bg-white/[0.02] flex items-center gap-3">
                                    <IconFile className="h-5 w-5 text-white/50" />
                                    <div>
                                        <div className="text-sm text-white">Tax_Return_2023_Draft.pdf</div>
                                        <div className="text-xs text-white/40">Tax Documents • 1.2 MB</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
