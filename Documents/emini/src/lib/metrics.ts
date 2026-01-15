import { allInvoices } from "./mock-data"

export function calculateMetrics() {
    const totalRevenue = allInvoices
        .filter(inv => inv.status === "Paid")
        .reduce((sum, inv) => sum + inv.amount, 0)

    const outstanding = allInvoices
        .filter(inv => inv.status === "Unpaid")
        .reduce((sum, inv) => sum + inv.amount, 0)

    const draft = allInvoices
        .filter(inv => inv.status === "Draft")
        .reduce((sum, inv) => sum + inv.amount, 0)

    // Simplified runway calculation
    const runway = totalRevenue > 0 ? "Infinite" : "0 months"

    return {
        revenue: totalRevenue,
        outstanding,
        draft,
        runway,
        cashFlow: totalRevenue - outstanding, // Simplified
        growth: 0.0,
        clv: totalRevenue / 1 // Simplified
    }
}
