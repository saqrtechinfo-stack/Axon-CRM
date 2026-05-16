// app/api/quotations/[quotationId]/pdf/route.ts

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 11,
    fontFamily: "Helvetica",
  },

  header: {
    marginBottom: 20,
  },

  companyName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },

  quoteId: {
    fontSize: 11,
    color: "#666",
  },

  section: {
    marginBottom: 16,
  },

  label: {
    fontSize: 10,
    color: "#666",
    marginBottom: 2,
  },

  value: {
    fontSize: 12,
  },

  table: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    padding: 8,
  },

  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    padding: 8,
  },

  col1: {
    width: "50%",
  },

  col2: {
    width: "15%",
    textAlign: "center",
  },

  col3: {
    width: "15%",
    textAlign: "right",
  },

  col4: {
    width: "20%",
    textAlign: "right",
  },

  totals: {
    marginTop: 20,
    alignSelf: "flex-end",
    width: 220,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  grandTotal: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#000",
    paddingTop: 8,
  },
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ quotationId: string }> },
) {
  try {
    const { quotationId } = await params;

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        companyId: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    const quotation = await prisma.quotation.findFirst({
      where: {
        id: quotationId,
        companyId: dbUser.companyId,
      },

      include: {
        items: true,

        lead: {
          select: {
            name: true,
            clientCompany: true,
            email: true,
            phone: true,
            address: true,
          },
        },

        company: true,

        createdBy: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!quotation) {
      return NextResponse.json(
        { error: "Quotation not found" },
        { status: 404 },
      );
    }

    const doc = (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.companyName}>
              {quotation.company.name}
            </Text>

            <Text style={styles.quoteId}>
              Quotation #{quotation.qId}
            </Text>
          </View>

          {/* CLIENT */}
          <View style={styles.section}>
            <Text style={styles.label}>CLIENT</Text>

            <Text style={styles.value}>
              {quotation.lead.clientCompany || "-"}
            </Text>

            <Text style={styles.value}>
              Attention: {quotation.attention || quotation.lead.name}
            </Text>
          </View>

          {/* SUBJECT */}
          <View style={styles.section}>
            <Text style={styles.label}>SUBJECT</Text>

            <Text style={styles.value}>
              {quotation.subject || "-"}
            </Text>
          </View>

          {/* ITEMS TABLE */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Description</Text>
              <Text style={styles.col2}>Qty</Text>
              <Text style={styles.col3}>Rate</Text>
              <Text style={styles.col4}>Amount</Text>
            </View>

            {quotation.items.map((item) => (
              <View style={styles.row} key={item.id}>
                <Text style={styles.col1}>
                  {item.description}
                </Text>

                <Text style={styles.col2}>
                  {item.quantity}
                </Text>

                <Text style={styles.col3}>
                  {item.unitPrice.toFixed(2)}
                </Text>

                <Text style={styles.col4}>
                  {item.total.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          {/* TOTALS */}
          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text>Sub Total</Text>
              <Text>
                AED {quotation.subTotal.toFixed(2)}
              </Text>
            </View>

            <View style={styles.totalRow}>
              <Text>VAT</Text>
              <Text>
                AED {quotation.taxAmount.toFixed(2)}
              </Text>
            </View>

            <View style={styles.totalRow}>
              <Text>Discount</Text>
              <Text>
                AED {quotation.discount.toFixed(2)}
              </Text>
            </View>

            <View style={[styles.totalRow, styles.grandTotal]}>
              <Text>Grand Total</Text>
              <Text>
                AED {quotation.totalAmount.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* NOTES */}
          {quotation.notes && (
            <View
              style={{
                marginTop: 30,
              }}
            >
              <Text style={styles.label}>NOTES</Text>

              <Text style={styles.value}>
                {quotation.notes}
              </Text>
            </View>
          )}
        </Page>
      </Document>
    );

    const pdfBuffer = await pdf(doc).toBuffer();

    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",

        "Content-Disposition": `inline; filename="${quotation.qId}.pdf"`,

        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("PDF_GENERATION_ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to generate PDF",
      },
      {
        status: 500,
      },
    );
  }
}