import { MarketingHeader } from "@/components/marketing/marketing-header"
import { MarketingFooter } from "@/components/marketing/marketing-footer"

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="dark min-h-screen bg-black text-white">
            <MarketingHeader />
            <main className="pt-[73px]">
                {children}
            </main>
            <MarketingFooter />
        </div>
    )
}
