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
} from "@react-pdf/renderer";

// ─────────────────────────────────────────────
// HELPER: Number to words (UAE format)
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
  if (decPart > 0) result += " and " + convert(decPart) + " Fils";
  return result + " Only/-";
}

// ─────────────────────────────────────────────
// COLORS
// ─────────────────────────────────────────────
const DARK = "#1a1a2e";
const WHITE = "#ffffff";
const LIGHT_GRAY = "#f8f9fa";
const BORDER = "#dddddd";
const TEXT_DARK = "#222222";
const TEXT_GRAY = "#555555";
const TEXT_LIGHT = "#888888";

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: TEXT_DARK,
    paddingBottom: 56, // space for fixed footer
  },

  // ── Header ──────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 36,
    paddingTop: 28,
    paddingBottom: 18,
    borderBottomWidth: 2,
    borderBottomColor: DARK,
  },
  logoImage: {
    width: 150,
    height: 60,
    objectFit: "contain",
    objectPosition: "left center",
  },
  logoFallback: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: DARK,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  proposalTitle: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 3,
    color: TEXT_DARK,
    textDecoration: "underline",
    marginBottom: 6,
  },
  headerMeta: {
    fontSize: 9,
    color: TEXT_GRAY,
    marginBottom: 2,
  },
  headerMetaBold: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: TEXT_DARK,
  },

  // ── Body padding ─────────────────────────────
  body: {
    paddingHorizontal: 36,
  },

  // ── TO section ───────────────────────────────
  toSection: {
    marginTop: 20,
    marginBottom: 16,
  },
  toLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  toCompany: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  toLine: {
    fontSize: 9,
    color: TEXT_GRAY,
    marginBottom: 1,
  },
  toBold: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginBottom: 1,
  },
  subjectLine: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginTop: 8,
    marginBottom: 14,
  },

  // ── Body text ────────────────────────────────
  bodyPara: {
    fontSize: 9,
    color: TEXT_GRAY,
    lineHeight: 1.6,
    marginBottom: 10,
  },

  // ── Table ────────────────────────────────────
  table: {
    borderWidth: 1,
    borderColor: BORDER,
    marginTop: 4,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: DARK,
    paddingVertical: 7,
    paddingHorizontal: 6,
  },
  tableHeaderCell: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    color: WHITE,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingVertical: 7,
    paddingHorizontal: 6,
    minHeight: 28,
  },
  tableRowAlt: {
    backgroundColor: LIGHT_GRAY,
  },
  cellText: {
    fontSize: 8.5,
    color: TEXT_GRAY,
  },
  cellBold: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: TEXT_DARK,
  },

  // column widths
  cSl: { width: "7%", textAlign: "center" },
  cDesc: { width: "50%", paddingRight: 8 },
  cUnit: { width: "10%", textAlign: "center" },
  cRate: { width: "16%", textAlign: "right" },
  cAmt: { width: "17%", textAlign: "right" },

  // ── Totals rows (inside table) ────────────────
  totalRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  totalSpacer: { width: "83%" },
  totalLabel: {
    width: "10%",
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: TEXT_DARK,
    textAlign: "right",
    paddingRight: 8,
  },
  totalValue: {
    width: "17%",
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: TEXT_DARK,
    textAlign: "right",
    paddingRight: 4,
  },
  grandTotalRow: {
    flexDirection: "row",
    backgroundColor: DARK,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  grandTotalLabel: {
    width: "10%",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: WHITE,
    textAlign: "right",
    paddingRight: 8,
  },
  grandTotalValue: {
    width: "17%",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: WHITE,
    textAlign: "right",
    paddingRight: 4,
  },
  amountWords: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    marginTop: 8,
    marginBottom: 4,
    color: TEXT_DARK,
  },

  // ── Section headings ──────────────────────────
  sectionHeading: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textDecoration: "underline",
    marginBottom: 6,
    marginTop: 16,
    color: TEXT_DARK,
  },

  // ── Body note (hosting/system req) ───────────
  noteText: {
    fontSize: 8.5,
    color: TEXT_GRAY,
    lineHeight: 1.6,
    marginBottom: 4,
  },

  // ── Terms ────────────────────────────────────
  termItem: {
    fontSize: 8.5,
    color: TEXT_GRAY,
    lineHeight: 1.6,
    marginBottom: 3,
    flexDirection: "row",
  },
  termNumber: {
    width: 20,
    fontSize: 8.5,
    color: TEXT_GRAY,
  },
  termText: {
    flex: 1,
    fontSize: 8.5,
    color: TEXT_GRAY,
    lineHeight: 1.6,
  },

  // ── Bank details ──────────────────────────────
  bankRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  bankLabel: {
    width: 100,
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: TEXT_DARK,
  },
  bankValue: {
    fontSize: 8.5,
    color: TEXT_GRAY,
  },

  // ── Signature ─────────────────────────────────
  signatureSection: {
    marginTop: 20,
  },
  signatureImage: {
    width: 130,
    height: 45,
    objectFit: "contain",
    marginVertical: 6,
  },
  signerName: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: TEXT_DARK,
    marginBottom: 1,
  },
  signerDetail: {
    fontSize: 8.5,
    color: TEXT_GRAY,
    marginBottom: 1,
  },

  // ── Footer (fixed) ───────────────────────────
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: DARK,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 36,
    paddingVertical: 10,
  },
  footerLeft: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: WHITE,
  },
  footerRight: {
    flexDirection: "row",
    gap: 14,
  },
  footerItem: {
    fontSize: 7.5,
    color: "#aabbcc",
  },
});

// ─────────────────────────────────────────────
// PDF DOCUMENT COMPONENT
// ─────────────────────────────────────────────
function QuotationPDF({ q }: { q: any }) {
  const co = q.company;
  const lead = q.lead;
  // Resolve terms — per-quotation override takes priority
  const rawTerms: string = q.termsOverride || co.quotationTerms || "";
  const termLines = rawTerms
    .split("\n")
    .map((l: string) => l.trim())
    .filter(Boolean);

  // Validity note for footer of terms
  const validityNote =
    co.quotationFooter ||
    `The validity of this proposal is for ${q.validDays || 15} days only.`;

  // Signatory — per-quotation createdBy or company signatory
  const signatoryName = co.signatoryName || q.createdBy?.name || co.name;
  const signatoryTitle = co.signatoryTitle || "";
  const signatoryEmail = co.signatoryEmail || co.contactEmail || "";
  const signatoryPhone = co.signatoryPhone || co.contactPhone || "";

  // Format date like "16 MAY 2026"
  const dateStr = new Date(q.createdAt)
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
    .toUpperCase();

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* ════════════════════════════════════
            HEADER — Logo left, Proposal right
            ════════════════════════════════════ */}
        <View style={styles.header} fixed>
          {/* Logo */}
          <View>
            {co.logo ? (
              <Image style={styles.logoImage} src={co.logo} />
            ) : (
              <Text style={styles.logoFallback}>{co.name}</Text>
            )}
          </View>

          {/* Proposal meta */}
          <View style={styles.headerRight}>
            <Text style={styles.proposalTitle}>PROPOSAL</Text>
            <Text style={styles.headerMetaBold}>NO: {q.qId}</Text>
            <Text style={styles.headerMeta}>DATE: {dateStr}</Text>
          </View>
        </View>

        {/* ════════════════════════════════════
            BODY
            ════════════════════════════════════ */}
        <View style={styles.body}>
          {/* TO section */}
          <View style={styles.toSection}>
            <Text style={styles.toLabel}>TO,</Text>
            <Text style={styles.toCompany}>{lead.clientCompany || "—"}</Text>
            {lead.address ? (
              <Text style={styles.toLine}>{lead.address}</Text>
            ) : null}
            <Text style={styles.toBold}>
              Kind Attn: {q.attention || lead.name || "—"}
            </Text>
            {lead.phone ? (
              <Text style={styles.toBold}>Ph: {lead.phone}</Text>
            ) : null}
          </View>

          {/* Subject */}
          <Text style={styles.subjectLine}>Subject: {q.subject || "—"}</Text>

          {/* Salutation */}
          <Text style={styles.bodyPara}>Dear Sir,</Text>

          {/* Covering note */}
          {q.notes ? (
            <Text style={styles.bodyPara}>{q.notes}</Text>
          ) : (
            <Text style={styles.bodyPara}>
              We are pleased to submit our proposal as follows, based on our
              recent discussions.
            </Text>
          )}

          {/* ════════════════════════════════════
              ITEMS TABLE
              ════════════════════════════════════ */}
          <View style={styles.table}>
            {/* Table header */}
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeaderCell, styles.cSl]}>
                SL{"\n"}NO
              </Text>
              <Text style={[styles.tableHeaderCell, styles.cDesc]}>
                SCOPE OF WORK
              </Text>
              <Text style={[styles.tableHeaderCell, styles.cUnit]}>UNIT</Text>
              <Text style={[styles.tableHeaderCell, styles.cRate]}>
                RATE PER{"\n"}UNIT
              </Text>
              <Text style={[styles.tableHeaderCell, styles.cAmt]}>AMOUNT</Text>
            </View>

            {/* Item rows */}
            {q.items.map((item: any, idx: number) => (
              <View
                key={item.id}
                style={[
                  styles.tableRow,
                  idx % 2 === 1 ? styles.tableRowAlt : {},
                ]}
                wrap={false}
              >
                <Text style={[styles.cellText, styles.cSl]}>
                  {String(idx + 1).padStart(2, "0")}
                </Text>
                <Text style={[styles.cellText, styles.cDesc]}>
                  {item.description}
                </Text>
                <Text style={[styles.cellText, styles.cUnit]}>
                  {Number.isInteger(item.quantity)
                    ? item.quantity
                    : item.quantity.toFixed(2)}
                </Text>
                <Text style={[styles.cellText, styles.cRate]}>
                  {item.unitPrice.toLocaleString("en-AE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
                <Text style={[styles.cellText, styles.cAmt]}>
                  {item.total.toLocaleString("en-AE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </View>
            ))}

            {/* TOTAL row */}
            <View style={styles.totalRow}>
              <Text style={styles.totalSpacer} />
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValue}>
                {q.subTotal.toLocaleString("en-AE", {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </View>

            {/* VAT row */}
            <View style={styles.totalRow}>
              <Text style={styles.totalSpacer} />
              <Text style={styles.totalLabel}>VAT {q.vatPercent}%</Text>
              <Text style={styles.totalValue}>
                {q.taxAmount.toLocaleString("en-AE", {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </View>

            {/* Discount row — only if discount > 0 */}
            {q.discount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalSpacer} />
                <Text style={styles.totalLabel}>DISCOUNT</Text>
                <Text style={styles.totalValue}>
                  -
                  {q.discount.toLocaleString("en-AE", {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </View>
            )}

            {/* GRAND TOTAL row */}
            <View style={styles.grandTotalRow}>
              <Text style={{ width: "83%", color: WHITE, fontSize: 9 }} />
              <Text style={styles.grandTotalLabel}>GRAND TOTAL</Text>
              <Text style={styles.grandTotalValue}>
                AED{" "}
                {q.totalAmount.toLocaleString("en-AE", {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </View>
          </View>

          {/* Amount in words */}
          <Text style={styles.amountWords}>
            Amount in words: {numberToWords(q.totalAmount)}
          </Text>

          {/* ── Hosting note (optional) ── */}
          {q.hostingNote || co.quotationHostingNote ? (
            <View>
              <Text style={styles.sectionHeading}>Data Hosting (Cloud)</Text>
              <Text style={styles.noteText}>
                {q.hostingNote || co.quotationHostingNote}
              </Text>
            </View>
          ) : null}

          {/* ── System requirements (optional) ── */}
          {q.systemRequirements || co.quotationSystemRequirements ? (
            <View>
              <Text style={styles.sectionHeading}>System Requirements</Text>
              <Text style={styles.noteText}>
                {q.systemRequirements || co.quotationSystemRequirements}
              </Text>
            </View>
          ) : null}

          {/* ── Terms & Conditions ── */}
          {termLines.length > 0 && (
            <View>
              <Text style={styles.sectionHeading}>Terms and Conditions</Text>
              {termLines.map((line: string, i: number) => (
                <View key={i} style={styles.termItem} wrap={false}>
                  <Text style={styles.termNumber}>{i + 1}.</Text>
                  <Text style={styles.termText}>
                    {line.replace(/^\d+[\.\)]\s*/, "")}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* ── Bank Details ── */}
          {co.bankName && (
            <View>
              <Text style={styles.sectionHeading}>
                Bank Details for Payment Remittance
              </Text>
              {[
                ["ACCOUNT NAME", co.accountName],
                ["BANK NAME", co.bankName],
                ["BRANCH NAME", co.bankBranch],
                ["ACCOUNT NO", co.accountNo],
                ["IBAN NO", co.iban],
                ["SWIFT CODE", co.swiftCode],
              ]
                .filter(([, v]) => v)
                .map(([label, value]) => (
                  <View key={label} style={styles.bankRow}>
                    <Text style={styles.bankLabel}>{label}:</Text>
                    <Text style={styles.bankValue}>{value}</Text>
                  </View>
                ))}
            </View>
          )}

          {/* Validity / footer note */}
          <Text style={[styles.noteText, { marginTop: 16 }]}>
            {validityNote}
          </Text>

          {/* ── Signature ── */}
          <View style={styles.signatureSection} wrap={false}>
            <Text style={styles.bodyPara}>Thanks, and regards,</Text>

            {/* Signature image if uploaded */}
            {co.signature ? (
              <Image style={styles.signatureImage} src={co.signature} />
            ) : (
              <View style={{ height: 30 }} />
            )}

            <Text style={styles.signerName}>{signatoryName}</Text>
            {signatoryTitle ? (
              <Text style={styles.signerDetail}>{signatoryTitle}</Text>
            ) : null}
            {signatoryEmail ? (
              <Text style={styles.signerDetail}>{signatoryEmail}</Text>
            ) : null}
            {signatoryPhone ? (
              <Text style={styles.signerDetail}>{signatoryPhone}</Text>
            ) : null}
          </View>
        </View>

        {/* ════════════════════════════════════
            FOOTER — fixed at bottom every page
            ════════════════════════════════════ */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerLeft}>{co.name}</Text>
          <View style={styles.footerRight}>
            {co.contactPhone && (
              <Text style={styles.footerItem}>{co.contactPhone}</Text>
            )}
            {co.contactEmail && (
              <Text style={styles.footerItem}>{co.contactEmail}</Text>
            )}
            {co.website && <Text style={styles.footerItem}>{co.website}</Text>}
            {co.address && <Text style={styles.footerItem}>{co.address}</Text>}
          </View>
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
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { companyId: true },
    });
    if (!dbUser)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const quotation = await prisma.quotation.findFirst({
      where: {
        id: quotationId,
        companyId: dbUser.companyId,
      },
      include: {
        // ✅ All items ordered by creation
        items: { orderBy: { id: "asc" } },

        // ✅ Lead fields needed for TO section
        lead: {
          select: {
            name: true,
            clientCompany: true,
            email: true,
            phone: true,
            address: true,
          },
        },

        // ✅ Full company — logo, bank, signature, terms, signatory
        company: true,

        // ✅ Who created it
        createdBy: {
          select: { name: true, email: true },
        },
      },
    });

    if (!quotation)
      return NextResponse.json(
        { error: "Quotation not found" },
        { status: 404 },
      );

    const pdfBuffer = await pdf(<QuotationPDF q={quotation} />).toBuffer();

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
      { error: "Failed to generate PDF" },
      { status: 500 },
    );
  }
}
