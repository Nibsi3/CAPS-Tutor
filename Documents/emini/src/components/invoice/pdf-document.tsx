import { Document, Page, Text, View, StyleSheet, Font, Image } from "@react-pdf/renderer"
import { TemplateId } from "@/lib/invoice/templates"

// Register fonts
Font.register({
    family: "Inter",
    src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2",
})

const createStyles = (template: TemplateId = 'classic', brandColor: string = '#121212') => {
    const isNoir = template === 'noir'
    const isMinimal = template === 'minimal'

    return StyleSheet.create({
        page: {
            padding: 40,
            backgroundColor: isNoir ? "#121212" : "#FFFFFF",
            color: isNoir ? "#FBFBFB" : "#121212",
            fontFamily: "Inter",
        },
        header: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 40,
            borderBottom: isMinimal ? "none" : `1px solid ${isNoir ? "#27272a" : "#e4e4e7"}`,
            paddingBottom: 20,
        },
        logo: {
            width: 60,
            height: 60,
            marginBottom: 10,
            objectFit: 'contain',
        },
        title: {
            fontSize: 24,
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: 1,
            color: isNoir ? "#FBFBFB" : brandColor,
        },
        section: {
            marginBottom: 30,
        },
        row: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 10,
        },
        label: {
            fontSize: 10,
            color: isNoir ? "#A1A1AA" : "#71717A",
            textTransform: "uppercase",
            marginBottom: 4,
        },
        value: {
            fontSize: 12,
        },
        tableHeader: {
            flexDirection: "row",
            borderBottom: `2px solid ${isNoir ? "#27272a" : brandColor}`,
            paddingBottom: 8,
            marginBottom: 12,
        },
        tableRow: {
            flexDirection: "row",
            borderBottom: `1px solid ${isNoir ? "#27272a" : "#F4F4F5"}`,
            paddingBottom: 8,
            marginBottom: 8,
            alignItems: "center",
        },
        totalSection: {
            marginTop: 30,
            borderTop: `2px solid ${isNoir ? "#27272a" : brandColor}`,
            paddingTop: 15,
            alignItems: "flex-end",
        },
        totalRow: {
            flexDirection: "row",
            justifyContent: "flex-end",
            gap: 20,
        },
        totalLabel: {
            fontSize: 14,
            fontWeight: "bold",
        },
        totalValue: {
            fontSize: 20,
            fontWeight: "bold",
            color: isNoir ? "#FBFBFB" : brandColor,
        },
        notes: {
            marginTop: 40,
            fontSize: 10,
            color: isNoir ? "#A1A1AA" : "#71717A",
            lineHeight: 1.5,
        },
    })
}

interface InvoicePDFProps {
    data: {
        number: string
        date: string
        customerName: string
        customerEmail: string
        items: Array<{
            description: string
            quantity: number
            price: number
        }>
        notes: string
        template?: TemplateId
        brandColor?: string
        logo?: string
    }
}

export const InvoicePDF = ({ data }: InvoicePDFProps) => {
    const styles = createStyles(data.template, data.brandColor)
    const subtotal = data.items.reduce((acc, item) => acc + item.quantity * item.price, 0)

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View>
                        {data.logo && <Image src={data.logo} style={styles.logo} />}
                        <Text style={styles.title}>Invoice</Text>
                        <Text style={styles.value}>{data.number}</Text>
                    </View>
                    <View style={{ alignItems: "flex-end", justifyContent: "flex-end" }}>
                        <Text style={styles.label}>Date</Text>
                        <Text style={styles.value}>{data.date}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Bill To</Text>
                    <Text style={styles.value}>{data.customerName}</Text>
                    <Text style={[styles.value, { color: styles.label.color }]}>{data.customerEmail}</Text>
                </View>

                <View style={styles.tableHeader}>
                    <Text style={{ flex: 4, fontSize: 10, fontWeight: "bold" }}>Description</Text>
                    <Text style={{ flex: 1, fontSize: 10, fontWeight: "bold", textAlign: "right" }}>Qty</Text>
                    <Text style={{ flex: 1, fontSize: 10, fontWeight: "bold", textAlign: "right" }}>Price</Text>
                    <Text style={{ flex: 1, fontSize: 10, fontWeight: "bold", textAlign: "right" }}>Total</Text>
                </View>

                {data.items.map((item, i) => (
                    <View key={i} style={styles.tableRow}>
                        <Text style={{ flex: 4, fontSize: 12 }}>{item.description}</Text>
                        <Text style={{ flex: 1, fontSize: 12, textAlign: "right" }}>{item.quantity}</Text>
                        <Text style={{ flex: 1, fontSize: 12, textAlign: "right" }}>${item.price.toFixed(2)}</Text>
                        <Text style={{ flex: 1, fontSize: 12, textAlign: "right" }}>
                            ${(item.quantity * item.price).toFixed(2)}
                        </Text>
                    </View>
                ))}

                <View style={styles.totalSection}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
                    </View>
                </View>

                {data.notes && (
                    <View style={styles.notes}>
                        <Text style={styles.label}>Notes</Text>
                        <Text>{data.notes.replace(/<[^>]*>/g, "")}</Text>
                    </View>
                )}
            </Page>
        </Document>
    )
}
