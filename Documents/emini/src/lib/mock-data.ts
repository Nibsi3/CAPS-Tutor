export const allInvoices = [
    {
        id: "INV-0002",
        status: "Draft",
        dueDate: "2026-02-13",
        customer: "Acme Corp",
        amount: 1200.00,
        issueDate: "2026-01-14",
        type: "One-time",
    },
    {
        id: "INV-0001",
        status: "Unpaid",
        dueDate: "2026-02-17",
        customer: "TechStart",
        amount: 2500.00,
        issueDate: "2026-01-13",
        type: "One-time",
    },
    {
        id: "INV-0003",
        status: "Paid",
        dueDate: "2026-01-10",
        customer: "Global Lab",
        amount: 5000.00,
        issueDate: "2026-01-01",
        type: "One-time",
    }
]

export const allClients = [
    {
        name: "Acme Corp",
        contact: "John Doe",
        email: "john@acme.com",
        invoices: 12,
        projects: 4,
        industry: "Manufacturing",
        country: "South Africa",
        financeEmail: "billing@acme.com",
        language: "English",
        revenue: "ZAR 45,000.00",
        outstanding: "ZAR 1,200.00",
        lastInvoice: "Jan 14, 2026",
        website: "acme.com",
        tags: ["Premium", "B2B"]
    },
    {
        name: "TechStart",
        contact: "Jane Smith",
        email: "jane@techstart.io",
        invoices: 5,
        projects: 2,
        industry: "Software",
        country: "USA",
        financeEmail: "finance@techstart.io",
        language: "English",
        revenue: "ZAR 12,500.00",
        outstanding: "ZAR 2,500.00",
        lastInvoice: "Jan 13, 2026",
        website: "techstart.io",
        tags: ["Active", "SaaS"]
    }
]
