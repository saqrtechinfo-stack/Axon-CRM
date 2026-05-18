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
  Image,
  Font,
} from "@react-pdf/renderer";
import path from "path";

export const runtime = "nodejs";

// ─────────────────────────────────────────────
// FONT
// ─────────────────────────────────────────────
Font.register({
  family: "Inter",
  fonts: [
    {
      src: path.join(process.cwd(), "public/fonts/Inter_28pt-Regular.ttf"),
      fontStyle: "normal",
      fontWeight: 400,
    },
    {
      src: path.join(process.cwd(), "public/fonts/Inter_24pt-Bold.ttf"),
      fontStyle: "normal",
      fontWeight: 700,
    },
  ],
});

// ─────────────────────────────────────────────
// HELPER: Convert image URL → Base64
// ─────────────────────────────────────────────
async function imageToBase64(url: string) {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const contentType = response.headers.get("content-type") || "image/png";

    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error("IMAGE_CONVERSION_ERROR", error);
    return null;
  }
}

// ─────────────────────────────────────────────
// NUMBER TO WORDS
// ─────────────────────────────────────────────
function numberToWords(num: number): string {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function convert(n: number): string {
    if (n === 0) return "";

    if (n < 20) return ones[n];

    if (n < 100)
      return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");

    if (n < 1000)
      return (
        ones[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 ? " " + convert(n % 100) : "")
      );

    if (n < 100000)
      return (
        convert(Math.floor(n / 1000)) +
        " Thousand" +
        (n % 1000 ? " " + convert(n % 1000) : "")
      );

    if (n < 10000000)
      return (
        convert(Math.floor(n / 100000)) +
        " Lakh" +
        (n % 100000 ? " " + convert(n % 100000) : "")
      );

    return (
      convert(Math.floor(n / 10000000)) +
      " Crore" +
      (n % 10000000 ? " " + convert(n % 10000000) : "")
    );
  }

  const intPart = Math.floor(num);
  const decPart = Math.round((num - intPart) * 100);

  let result = convert(intPart) || "Zero";

  result += " UAE Dirhams";

  if (decPart > 0) {
    result += " and " + convert(decPart) + " Fils";
  }

  return result + " Only/-";
}

// ─────────────────────────────────────────────
// COLORS
// ─────────────────────────────────────────────
const PRIMARY = "#111827";
const SECONDARY = "#374151";
const LIGHT = "#F9FAFB";
const BORDER = "#E5E7EB";
const TEXT = "#1F2937";
const MUTED = "#6B7280";
const WHITE = "#FFFFFF";

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    fontSize: 9,
    color: TEXT,
    backgroundColor: WHITE,
    paddingBottom: 70,
  },

  body: {
    paddingTop: 20,
    paddingHorizontal: 42,
  },

  // HEADER
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 42,
    paddingTop: 28,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    marginBottom: 20,
  },

  logoImage: {
    width: 170,
    height: 60,
    objectFit: "contain",
  },

  logoFallback: {
    fontSize: 22,
    fontFamily: "Inter",
    color: PRIMARY,
  },

  proposalBlock: {
    alignItems: "flex-end",
  },

  proposalTitle: {
    fontSize: 22,
    fontFamily: "Inter",
    color: PRIMARY,
    marginBottom: 8,
  },

  proposalMeta: {
    fontSize: 9,
    color: MUTED,
    marginBottom: 3,
  },

  proposalMetaBold: {
    fontSize: 10,
    color: PRIMARY,
    fontFamily: "Inter",
  },

  // CLIENT SECTION
  toSection: {
    marginBottom: 24,
  },

  label: {
    fontSize: 8,
    color: MUTED,
    marginBottom: 6,
    letterSpacing: 0.5,
  },

  companyName: {
    fontSize: 13,
    fontFamily: "Inter",
    marginBottom: 4,
    color: PRIMARY,
  },

  line: {
    fontSize: 9,
    color: SECONDARY,
    marginBottom: 3,
    lineHeight: 1.5,
  },

  subject: {
    fontSize: 10,
    fontFamily: "Inter",
    color: PRIMARY,
    marginBottom: 20,
    marginTop: 10,
  },

  paragraph: {
    fontSize: 9,
    color: SECONDARY,
    lineHeight: 1.8,
    marginBottom: 14,
  },

  // TABLE
  table: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    overflow: "hidden",
    marginTop: 14,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: PRIMARY,
    paddingVertical: 11,
    paddingHorizontal: 10,
    alignItems: "center",
  },

  th: {
    fontSize: 8,
    color: WHITE,
    fontFamily: "Inter",
    textTransform: "uppercase",
  },

  row: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    minHeight: 42,
    alignItems: "center",
  },

  rowAlt: {
    backgroundColor: LIGHT,
  },

  td: {
    fontSize: 8.5,
    color: SECONDARY,
    lineHeight: 1.6,
  },

  c1: {
    width: "8%",
    textAlign: "center",
  },

  c2: {
    width: "46%",
    paddingRight: 8,
  },

  c3: {
    width: "12%",
    textAlign: "center",
  },

  c4: {
    width: "17%",
    textAlign: "right",
  },

  c5: {
    width: "17%",
    textAlign: "right",
  },

  // TOTAL BOX
  totalsWrapper: {
    alignItems: "flex-end",
    marginTop: 20,
    marginBottom: 18,
  },

  totalsBox: {
    width: 260,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    overflow: "hidden",
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  totalLabel: {
    fontSize: 9,
    color: SECONDARY,
  },

  totalValue: {
    fontSize: 9,
    color: PRIMARY,
  },

  grandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: PRIMARY,
  },

  grandLabel: {
    fontSize: 10,
    color: WHITE,
  },

  grandValue: {
    fontSize: 10,
    color: WHITE,
  },

  amountWords: {
    marginTop: 10,
    fontSize: 8.5,
    color: PRIMARY,
    lineHeight: 1.7,
  },

  // SECTION
  section: {
    marginTop: 24,
  },

  sectionTitle: {
    fontSize: 11,
    color: PRIMARY,
    marginBottom: 10,
  },

  noteText: {
    fontSize: 8.5,
    color: SECONDARY,
    lineHeight: 1.8,
  },

  // TERMS
  termRow: {
    flexDirection: "row",
    marginBottom: 7,
    alignItems: "flex-start",
  },

  termIndex: {
    width: 18,
    fontSize: 8.5,
    color: PRIMARY,
  },

  termText: {
    flex: 1,
    fontSize: 8.5,
    color: SECONDARY,
    lineHeight: 1.7,
  },

  // BANK
  bankRow: {
    flexDirection: "row",
    marginBottom: 6,
  },

  bankLabel: {
    width: 130,
    fontSize: 8.5,
    color: PRIMARY,
  },

  bankValue: {
    flex: 1,
    fontSize: 8.5,
    color: SECONDARY,
  },

  // SIGNATURE
  signatureSection: {
    marginTop: 30,
  },

  signatureImage: {
    width: 130,
    height: 50,
    objectFit: "contain",
    marginVertical: 8,
  },

  signName: {
    fontSize: 10,
    color: PRIMARY,
    marginBottom: 2,
  },

  signDetail: {
    fontSize: 8.5,
    color: MUTED,
    marginBottom: 2,
  },

  // FOOTER
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    backgroundColor: LIGHT,
    paddingHorizontal: 42,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  footerText: {
    fontSize: 8,
    color: MUTED,
  },

  pageNumber: {
    position: "absolute",
    bottom: 14,
    right: 42,
    fontSize: 8,
    color: MUTED,
  },
});

// ─────────────────────────────────────────────
// PDF DOCUMENT
// ─────────────────────────────────────────────
function QuotationPDF({
  q,
  logo,
  signature,
}: {
  q: any;
  logo: string | null;
  signature: string | null;
}) {
  const co = q.company;
  const lead = q.lead;

  const rawTerms = q.termsOverride || co.quotationTerms || "";

  const termLines = rawTerms
    .split("\n")
    .map((l: string) => l.trim())
    .filter(Boolean);

  const dateStr = new Date(q.createdAt)
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
    .toUpperCase();

  return (
    <Document>
      {/* PAGE 1 */}
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            {logo ? (
              <Image src={logo} style={styles.logoImage} />
            ) : (
              <Text style={styles.logoFallback}>{co.name}</Text>
            )}
          </View>

          <View style={styles.proposalBlock}>
            <Text style={styles.proposalTitle}>PROPOSAL</Text>
            <Text style={styles.proposalMetaBold}>NO: {q.qId}</Text>
            <Text style={styles.proposalMeta}>DATE: {dateStr}</Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* CLIENT */}
          <View style={styles.toSection}>
            <Text style={styles.label}>TO</Text>

            <Text style={styles.companyName}>{lead.clientCompany || "-"}</Text>

            {lead.address && <Text style={styles.line}>{lead.address}</Text>}

            <Text style={styles.line}>
              Kind Attn: {q.attention || lead.name || "-"}
            </Text>

            {lead.phone && <Text style={styles.line}>Phone: {lead.phone}</Text>}
          </View>

          {/* SUBJECT */}
          <Text style={styles.subject}>
            Subject: {q.subject || "Quotation Proposal"}
          </Text>

          {/* INTRO */}
          <Text style={styles.paragraph}>Dear Sir,</Text>

          <Text style={styles.paragraph}>
            {q.notes ||
              "We are pleased to submit our proposal based on our recent discussions and requirements shared with us."}
          </Text>

          {/* TABLE */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, styles.c1]}>SL</Text>
              <Text style={[styles.th, styles.c2]}>Scope of Work</Text>
              <Text style={[styles.th, styles.c3]}>Qty</Text>
              <Text style={[styles.th, styles.c4]}>Unit Price</Text>
              <Text style={[styles.th, styles.c5]}>Amount</Text>
            </View>

            {q.items.map((item: any, idx: number) => (
              <View
                key={item.id}
                style={[styles.row, idx % 2 === 1 ? styles.rowAlt : {}]}
              >
                <Text style={[styles.td, styles.c1]}>
                  {String(idx + 1).padStart(2, "0")}
                </Text>

                <Text style={[styles.td, styles.c2]}>{item.description}</Text>

                <Text style={[styles.td, styles.c3]}>{item.quantity}</Text>

                <Text style={[styles.td, styles.c4]}>
                  AED {item.unitPrice.toFixed(2)}
                </Text>

                <Text style={[styles.td, styles.c5]}>
                  AED {item.total.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          {/* TOTALS */}
          <View style={styles.totalsWrapper}>
            <View style={styles.totalsBox}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>
                  AED {q.subTotal.toFixed(2)}
                </Text>
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>VAT {q.vatPercent}%</Text>
                <Text style={styles.totalValue}>
                  AED {q.taxAmount.toFixed(2)}
                </Text>
              </View>

              {q.discount > 0 && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Discount</Text>
                  <Text style={styles.totalValue}>
                    AED {q.discount.toFixed(2)}
                  </Text>
                </View>
              )}

              <View style={styles.grandRow}>
                <Text style={styles.grandLabel}>Grand Total</Text>
                <Text style={styles.grandValue}>
                  AED {q.totalAmount.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.amountWords}>
            Amount in words: {numberToWords(q.totalAmount)}
          </Text>
        </View>

        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{co.name}</Text>

          <Text style={styles.footerText}>
            {co.contactEmail} | {co.contactPhone}
          </Text>
        </View>
      </Page>

      {/* PAGE 2 */}
      <Page size="A4" style={styles.page}>
        <View style={styles.body}>
          {/* HOSTING */}
          {(q.hostingNote || co.quotationHostingNote) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Data Hosting (Cloud)</Text>

              <Text style={styles.noteText}>
                {q.hostingNote || co.quotationHostingNote}
              </Text>
            </View>
          )}

          {/* SYSTEM REQUIREMENTS */}
          {(q.systemRequirements || co.quotationSystemRequirements) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>System Requirements</Text>

              <Text style={styles.noteText}>
                {q.systemRequirements || co.quotationSystemRequirements}
              </Text>
            </View>
          )}

          {/* TERMS */}
          {termLines.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Terms and Conditions</Text>

              {termLines.map((line: string, i: number) => (
                <View key={i} style={styles.termRow}>
                  <Text style={styles.termIndex}>{i + 1}.</Text>

                  <Text style={styles.termText}>
                    {line.replace(/^\d+[\.\)]\s*/, "")}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* BANK DETAILS */}
          {co.bankName && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Bank Details for Payment Remittance
              </Text>

              {[
                ["ACCOUNT NAME", co.accountName],
                ["BANK NAME", co.bankName],
                ["BRANCH NAME", co.bankBranch],
                ["ACCOUNT NO", co.accountNo],
                ["IBAN", co.iban],
                ["SWIFT CODE", co.swiftCode],
              ]
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <View key={label} style={styles.bankRow}>
                    <Text style={styles.bankLabel}>{label}</Text>
                    <Text style={styles.bankValue}>{value}</Text>
                  </View>
                ))}
            </View>
          )}

          {/* VALIDITY */}
          <View style={styles.section}>
            <Text style={styles.noteText}>
              {co.quotationFooter ||
                `The validity of this proposal is for ${q.validDays || 15} days only.`}
            </Text>
          </View>

          {/* SIGNATURE */}
          <View style={styles.signatureSection}>
            <Text style={styles.paragraph}>Thanks and regards,</Text>

            {signature && (
              <Image src={signature} style={styles.signatureImage} />
            )}

            <Text style={styles.signName}>
              {co.signatoryName || q.createdBy?.name || co.name}
            </Text>

            {co.signatoryTitle && (
              <Text style={styles.signDetail}>{co.signatoryTitle}</Text>
            )}

            {co.signatoryEmail && (
              <Text style={styles.signDetail}>{co.signatoryEmail}</Text>
            )}

            {co.signatoryPhone && (
              <Text style={styles.signDetail}>{co.signatoryPhone}</Text>
            )}
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{co.name}</Text>

          <Text style={styles.footerText}>
            {co.contactEmail} | {co.contactPhone}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

// ─────────────────────────────────────────────
// ROUTE HANDLER
// ─────────────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ quotationId: string }> },
) {
  try {
    const { quotationId } = await params;

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
      select: {
        companyId: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const quotation = await prisma.quotation.findFirst({
      where: {
        id: quotationId,
        companyId: dbUser.companyId,
      },
      include: {
        items: {
          orderBy: {
            id: "asc",
          },
        },

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
            email: true,
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

    // CONVERT IMAGES TO BASE64
    const logoBase64 = quotation.company.logo
      ? await imageToBase64(quotation.company.logo)
      : null;

    const signatureBase64 = quotation.company.signature
      ? await imageToBase64(quotation.company.signature)
      : null;

    const pdfBuffer = await pdf(
      <QuotationPDF
        q={quotation}
        logo={logoBase64}
        signature={signatureBase64}
      />,
    ).toBuffer();

    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${quotation.qId}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("PDF_GENERATION_ERROR", error);

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
