import Link from "next/link"
import { Button } from "@/components/ui/button"
import { IconArrowRight } from "@tabler/icons-react"

export default function StoryPage() {
    return (
        <div className="bg-black">
            {/* Hero Section */}
            <section className="relative py-24 md:py-32">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent" />
                <div className="relative mx-auto max-w-4xl px-6 lg:px-8">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 text-center">
                        This is why we're building{" "}
                        <span className="font-serif italic">Emini.</span>
                    </h1>
                </div>
            </section>

            {/* Story Content */}
            <section className="py-16">
                <div className="mx-auto max-w-3xl px-6 lg:px-8">
                    {/* Problem */}
                    <div className="mb-16">
                        <h2 className="text-xl font-bold text-white mb-6">Problem</h2>
                        <p className="text-white/70 leading-relaxed mb-4">
                            After years of running our own businesses, we've always felt that something was missing
                            in how we manage our finances. The tools we used were clunky, expensive, or simply didn't
                            understand what small businesses really need.
                        </p>
                        <p className="text-white/70 leading-relaxed">
                            We spent hours every week on invoicing, chasing payments, reconciling receipts, and
                            trying to make sense of our financial data. It felt like we were working for our tools
                            instead of the other way around.
                        </p>
                    </div>

                    {/* Solution */}
                    <div className="mb-16">
                        <h2 className="text-xl font-bold text-white mb-6">Solution</h2>
                        <p className="text-white/70 leading-relaxed mb-4">
                            So we asked ourselves: why not create our own comprehensive tool? Inspired by
                            companies like Midday that revolutionised what an all-in-one business tool can be,
                            we embarked on developing an all-in-one solution.
                        </p>
                        <p className="text-white/70 leading-relaxed">
                            Emini serves as a bridge between you and your accountant, allowing you to focus on the
                            enjoyable aspects of your work. Whether it's through for internal use only, building in
                            public, or open-sourcing all our solutions — we want to share our experience of how far
                            you can go.
                        </p>
                    </div>

                    {/* Open Source */}
                    <div className="mb-16">
                        <h2 className="text-xl font-bold text-white mb-6">Built for South Africa</h2>
                        <p className="text-white/70 leading-relaxed mb-4">
                            We believe great tools should empower local businesses and entrepreneurs.
                            With users in mind, we've designed Emini to work seamlessly with South African
                            payment providers, banking systems, and tax requirements.
                        </p>
                        <p className="text-white/70 leading-relaxed">
                            From ZAR-first invoicing to SARS-compliant reporting, every feature is built
                            with our local context in mind. No more adapting international tools to work
                            for us — Emini is built for us, by us.
                        </p>
                    </div>

                    {/* Founder Image Placeholder */}
                    <div className="mb-16">
                        <div className="aspect-[4/3] rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-24 h-24 rounded-full bg-white/10 mx-auto mb-4 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-white/50">E</span>
                                </div>
                                <div className="text-white/50 text-sm">The Emini Team</div>
                            </div>
                        </div>
                    </div>

                    {/* Signature */}
                    <div className="mb-16">
                        <div className="text-white/50 text-sm mb-2">With purpose & vision,</div>
                        <div className="font-serif italic text-2xl text-white">The Emini Team</div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 border-t border-white/5">
                <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Ready to join us?
                    </h2>
                    <p className="text-white/50 max-w-xl mx-auto mb-8">
                        Start managing your business finances the way it should be — simple,
                        beautiful, and stress-free.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button
                            variant="outline"
                            className="rounded-full px-8 h-12 border-white/20 text-white hover:bg-white/5"
                        >
                            Talk to founders
                        </Button>
                        <Button
                            asChild
                            className="bg-white text-black hover:bg-white/90 rounded-full px-8 h-12"
                        >
                            <Link href="/login">
                                Get Started
                                <IconArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    )
}
