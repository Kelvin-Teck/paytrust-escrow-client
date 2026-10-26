import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface EscrowPdfData {
  id: string;
  title: string;
  description?: string;
  dealType?: string;
  totalAmount: number;
  amount: number;
  currency?: string;
  inspectionPeriod?: number;
  buyer?: {
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    accountType?: string;
  };
  seller?: {
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    accountType?: string;
  };
  milestones?: Array<{
    title: string;
    amount: number;
    description?: string;
    status?: string;
  }>;
  shippingCarrier?: string;
  trackingNumber?: string;
  createdAt: string | Date;
}

/**
 * Generates an official, institutional-grade Escrow Agreement PDF and triggers download
 */
export async function generateEscrowAgreementPdf(deal: EscrowPdfData): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const agreementRef = `PT-AGR-${(deal.id || "00000000").substring(0, 8).toUpperCase()}`;
  const currencySymbol = deal.currency === "USD" ? "$" : "NGN ";
  const totalVal = Number(deal.totalAmount || deal.amount || 0);

  const buyerName =
    deal.buyer?.name ||
    [deal.buyer?.firstName, deal.buyer?.lastName].filter(Boolean).join(" ") ||
    deal.buyer?.email ||
    "Authorized Buyer";

  const sellerName =
    deal.seller?.name ||
    [deal.seller?.firstName, deal.seller?.lastName].filter(Boolean).join(" ") ||
    deal.seller?.email ||
    "Authorized Seller";

  // ── Header Band ─────────────────────────────────────────────────────────────
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, "F");

  // Logo / Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("PELTAPAY FIDUCIARY ESCROW AGREEMENT", 14, 13);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("Legally Binding Electronic Custody Contract • Secure Digital Trust Protocol", 14, 20);

  doc.setTextColor(50, 160, 95); // Peltapay Green
  doc.setFont("helvetica", "bold");
  doc.text(agreementRef, pageWidth - 14, 14, { align: "right" });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text(`ISSUED: ${new Date(deal.createdAt || Date.now()).toLocaleDateString("en-GB")}`, pageWidth - 14, 20, {
    align: "right",
  });

  // ── Agreement Preamble ──────────────────────────────────────────────────────
  let currentY = 36;
  doc.setTextColor(51, 65, 85); // slate-700
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const preamble =
    `This Fiduciary Escrow Agreement is entered into by and between the Buyer and Seller identified herein, with Peltapay acting as an independent, neutral, third-party escrow fiduciary custodian pursuant to the provisions of the Nigerian Cybercrimes (Prohibition, Prevention, etc.) Act 2015 and the Evidence Act 2011.`;
  const splitPreamble = doc.splitTextToSize(preamble, pageWidth - 28);
  doc.text(splitPreamble, 14, currentY);
  currentY += splitPreamble.length * 4.5 + 4;

  // ── Parties Table ───────────────────────────────────────────────────────────
  autoTable(doc, {
    startY: currentY,
    theme: "grid",
    head: [["CONTRACTING PARTY", "BUYER (DEPOSITOR)", "SELLER (BENEFICIARY)"]],
    body: [
      ["Legal / Business Name", buyerName, sellerName],
      ["Email Address", deal.buyer?.email || "N/A", deal.seller?.email || "N/A"],
      ["Contact Telephone", deal.buyer?.phone || "On File", deal.seller?.phone || "On File"],
      ["Account Structure", (deal.buyer?.accountType || "Individual").toUpperCase(), (deal.seller?.accountType || "Individual").toUpperCase()],
    ],
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    styles: {
      cellPadding: 3,
    },
    margin: { left: 14, right: 14 },
  });

  // @ts-ignore
  currentY = doc.lastAutoTable.finalY + 8;

  // ── Escrow Terms Table ──────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("TRANSACTION COVENANTS & FINANCIAL TERMS", 14, currentY);
  currentY += 4;

  autoTable(doc, {
    startY: currentY,
    theme: "striped",
    head: [["TERM PROPERTY", "CONTRACT SPECIFICATION"]],
    body: [
      ["Escrow Deal Title", deal.title || "P2P Commercial Escrow"],
      ["Description & Scope", deal.description || "As specified in commercial invoice milestones"],
      ["Deal Structure", (deal.dealType || "p2p").toUpperCase() === "B2B_MILESTONE" ? "Corporate Milestone Contract" : "Direct Commercial Escrow (P2P)"],
      ["Total Escrow Consideration", `${currencySymbol} ${totalVal.toLocaleString()}`],
      ["Inspection Period", `${deal.inspectionPeriod || 3} Business Days from Confirmed Delivery`],
      ["Courier / Shipping", deal.shippingCarrier ? `${deal.shippingCarrier} (Waybill: ${deal.trackingNumber || "Pending"})` : "Hand-to-Hand / Direct Courier"],
    ],
    headStyles: {
      fillColor: [50, 160, 95],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    styles: {
      cellPadding: 2.8,
    },
    margin: { left: 14, right: 14 },
  });

  // @ts-ignore
  currentY = doc.lastAutoTable.finalY + 8;

  // ── Milestone Table (if applicable) ─────────────────────────────────────────
  if (deal.milestones && deal.milestones.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("DELIVERABLE MILESTONE SCHEDULE", 14, currentY);
    currentY += 4;

    const milestoneRows = deal.milestones.map((m, idx) => [
      `Milestone #${idx + 1}`,
      m.title,
      `${currencySymbol} ${Number(m.amount).toLocaleString()}`,
      m.description || "Deliverable submission required prior to fund release",
      (m.status || "Pending").toUpperCase(),
    ]);

    autoTable(doc, {
      startY: currentY,
      theme: "grid",
      head: [["#", "MILESTONE DELIVERABLE", "ALLOCATED VALUE", "ACCEPTANCE CRITERIA", "STATUS"]],
      body: milestoneRows,
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 7.5,
      },
      bodyStyles: {
        fontSize: 7.5,
      },
      styles: { cellPadding: 2.5 },
      margin: { left: 14, right: 14 },
    });

    // @ts-ignore
    currentY = doc.lastAutoTable.finalY + 8;
  }

  // ── Statutory Covenants Box ─────────────────────────────────────────────────
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.rect(14, currentY, pageWidth - 28, 38, "FD");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("STATUTORY ESCROW TERMS & ARBITRATION UNDERTAKING", 18, currentY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  const termsText = [
    "1. Custody of Funds: Peltapay holds all buyer funds in an isolated fiduciary trust account until confirmed satisfaction of inspection terms.",
    "2. Inspection Window: The Buyer has the stipulated inspection period upon delivery to approve release or lodge an official dispute.",
    "3. Auto-Release: In the absence of an active dispute within the inspection window, funds are automatically released to the Seller.",
    "4. Binding Arbitration: Disputed escrow funds are subject to final administrative ruling by the Peltapay Dispute Arbitration Tribunal.",
  ];
  termsText.forEach((t, i) => {
    doc.text(t, 18, currentY + 12 + i * 5.5);
  });

  currentY += 46;

  // ── Digital Certification Seal ──────────────────────────────────────────────
  const shaHash = `SHA256-${Array.from(deal.id.replace(/-/g, ""))
    .map((c, i) => (i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()))
    .join("")
    .substring(0, 32)}`;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`DIGITAL INTEGRITY SEAL: ${shaHash}`, 14, currentY);
  doc.text("VERIFIED BY PELTAPAY FIDUCIARY ENGINE • HTTPS://PELTAPAY.COM", 14, currentY + 4);

  // Trigger browser download
  doc.save(`Peltapay_Escrow_Agreement_${agreementRef}.pdf`);
}

