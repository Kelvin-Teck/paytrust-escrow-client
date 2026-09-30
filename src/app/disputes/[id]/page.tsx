"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  Send,
  Upload,
  CheckCircle2,
  FileText,
  User,
  MessageSquare,
  Clock,
  DollarSign,
  Handshake,
  Check,
  X,
  FileImage,
  Scale,
  Building2,
  Lock,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { disputeService, transactionService } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@/components/ui/Toast";
import { DisputeDetailSkeleton } from "@/components/ui/Skeleton";
import EscrowContractModal from "@/components/transaction/EscrowContractModal";

export default function DisputeMediationRoomPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const user = useAuthStore((s) => s.user);

  const [dispute, setDispute] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState<any[]>([]);

  // Modals state
  const [showContractModal, setShowContractModal] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Settlement Offer Form State
  const [settlementBuyerPct, setSettlementBuyerPct] = useState(50);
  const [settlementNote, setSettlementNote] = useState("");

  // Evidence Form State
  const [evidenceTitle, setEvidenceTitle] = useState("");
  const [evidenceDesc, setEvidenceDesc] = useState("");
  const [evidenceType, setEvidenceType] = useState<"image" | "document" | "waybill">("image");
  const [evidenceList, setEvidenceList] = useState<any[]>([]);

  // Appeal Form State
  const [appealReason, setAppealReason] = useState("");

  const loadDispute = async () => {
    if (!id) return;
    try {
      const res = await disputeService.getDisputeById(id);
      setDispute(res);

      if (res) {
        const initialMessages = [
          {
            id: "system-1",
            sender: res.raisedBy?.name || res.raisedBy?.firstName || "Disputant",
            role: "disputant",
            time: new Date(res.createdAt || Date.now()).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            text: `Dispute Registered: "${res.reason}". Details: ${res.details || "Pending evidentiary submission."}`,
          },
          {
            id: "system-2",
            sender: "PayTrust Compliance Arbiter",
            role: "arbiter",
            time: "Active Mediation",
            text: "Welcome to the neutral escrow arbitration room. Funds remain frozen in custodian escrow. Both parties may negotiate a mutual compromise split below or upload verifiable delivery/condition evidence.",
          },
        ];
        setChatLog(initialMessages);

        if (res.evidence && Array.isArray(res.evidence)) {
          setEvidenceList(res.evidence);
        } else {
          setEvidenceList([
            {
              id: "ev-1",
              title: "Initial Claim Statement",
              description: res.details || "Initial dispute statement lodged by claimant.",
              submittedBy: res.raisedBy?.name || "Claimant",
              createdAt: res.createdAt || new Date().toISOString(),
              type: "document",
            },
          ]);
        }
      }
    } catch (err) {
      console.error("Failed to load dispute:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDispute();
  }, [id]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const senderName = user?.firstName
      ? `${user.firstName} ${user.lastName || ""}`.trim()
      : user?.name || user?.email?.split("@")[0] || "Me";

    setChatLog((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: senderName,
        role: "user",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        text: message.trim(),
      },
    ]);
    setMessage("");
  };

  // Submit Mutual Settlement Offer
  const handleProposeSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispute) return;
    setIsSubmitting(true);

    const totalAmt = Number(dispute.transaction?.amount || dispute.amount || 0);
    const buyerAmt = Math.round((totalAmt * settlementBuyerPct) / 100);
    const sellerAmt = totalAmt - buyerAmt;

    try {
      await disputeService.proposeSettlement(id, {
        buyerAmount: buyerAmt,
        sellerAmount: sellerAmt,
        note: settlementNote.trim(),
      });

      setDispute((prev: any) => ({
        ...prev,
        status: "SETTLEMENT_PROPOSED",
        settlementOffer: {
          buyerAmount: buyerAmt,
          sellerAmount: sellerAmt,
          buyerPercentage: settlementBuyerPct,
          sellerPercentage: 100 - settlementBuyerPct,
          proposedBy: user?.name || "You",
          note: settlementNote.trim(),
          createdAt: new Date().toISOString(),
        },
      }));

      setChatLog((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "PayTrust Settlement Desk",
          role: "arbiter",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          text: `🤝 Compromise Settlement Proposed: Buyer receives ₦${buyerAmt.toLocaleString()} (${settlementBuyerPct}%), Seller receives ₦${sellerAmt.toLocaleString()} (${100 - settlementBuyerPct}%). Note: "${settlementNote || "No note provided"}"`,
        },
      ]);

      setShowSettlementModal(false);
      setSettlementNote("");
      toast.success(
        "Settlement offer submitted!",
        "The counterparty has been notified. If accepted, escrow funds disburse immediately."
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to submit settlement offer");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Accept or Reject Counterparty Settlement Offer
  const handleRespondToSettlement = async (action: "accept" | "reject") => {
    setIsSubmitting(true);
    try {
      await disputeService.respondToSettlement(id, action);
      if (action === "accept") {
        toast.success(
          "Settlement accepted!",
          "Escrow funds have been disbursed according to the agreed split."
        );
        setDispute((prev: any) => ({
          ...prev,
          status: "RESOLVED_MUTUAL",
        }));
        setChatLog((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: "PayTrust Settlement Desk",
            role: "arbiter",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            text: "✅ Settlement Accepted! Escrow funds disbursed immediately according to agreed split. Dispute case marked as RESOLVED.",
          },
        ]);
      } else {
        toast.info("Settlement offer rejected.", "Mediation remains active.");
        setDispute((prev: any) => ({
          ...prev,
          status: "OPEN",
          settlementOffer: null,
        }));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to respond to settlement");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Upload New Evidence Item
  const handleUploadEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceTitle.trim()) {
      toast.error("Please enter an evidence title.");
      return;
    }
    setIsSubmitting(true);

    const newEvidence = {
      id: `ev-${Date.now()}`,
      title: evidenceTitle.trim(),
      description: evidenceDesc.trim() || "Evidence uploaded for mediator assessment.",
      submittedBy: user?.name || user?.email?.split("@")[0] || "Party",
      createdAt: new Date().toISOString(),
      type: evidenceType,
    };

    try {
      await disputeService.uploadEvidence(id, {
        title: evidenceTitle.trim(),
        description: evidenceDesc.trim(),
        fileType: evidenceType,
      });

      setEvidenceList((prev) => [newEvidence, ...prev]);
      setChatLog((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: user?.name || "Participant",
          role: "user",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          text: `📁 New Evidence Uploaded: "${evidenceTitle.trim()}". ${evidenceDesc.trim()}`,
        },
      ]);

      setShowEvidenceModal(false);
      setEvidenceTitle("");
      setEvidenceDesc("");
      toast.success("Evidence recorded in arbitration file!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to submit evidence");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Formal Appeal
  const handleAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealReason.trim()) {
      toast.error("Please explain your grounds for appeal.");
      return;
    }
    setIsSubmitting(true);
    try {
      await disputeService.appealResolution(id, { reason: appealReason.trim() });
      toast.success("Appeal lodged!", "A senior compliance arbitrator will review the case.");
      setDispute((prev: any) => ({ ...prev, status: "APPEAL_PENDING" }));
      setShowAppealModal(false);
      setAppealReason("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to lodge appeal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = Number(dispute?.transaction?.amount || dispute?.amount || 0);
  const rawStatus = (dispute?.status || "OPEN").toUpperCase();
  const isResolved =
    rawStatus.startsWith("RESOLVED") ||
    rawStatus === "RESOLVED_MUTUAL" ||
    rawStatus === "RESOLVED_REFUND" ||
    rawStatus === "RESOLVED_RELEASE";

  const getStatusBadge = () => {
    if (rawStatus === "OPEN" || rawStatus === "UNDER_MEDIATION") {
      return (
        <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          Mediation in Progress
        </span>
      );
    }
    if (rawStatus === "SETTLEMENT_PROPOSED") {
      return (
        <span className="text-xs font-bold text-purple-800 bg-purple-50 px-3 py-1 rounded-full border border-purple-200 flex items-center gap-1.5">
          <Handshake className="w-3.5 h-3.5 text-purple-600" />
          Compromise Settlement Offered
        </span>
      );
    }
    if (rawStatus === "RESOLVED_MUTUAL") {
      return (
        <span className="text-xs font-bold text-[#15803d] bg-[#EBF7F0] px-3 py-1 rounded-full border border-[#32A05F]/30 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#32A05F]" />
          Resolved via Mutual Compromise
        </span>
      );
    }
    if (rawStatus === "RESOLVED_REFUND") {
      return (
        <span className="text-xs font-bold text-[#15803d] bg-[#EBF7F0] px-3 py-1 rounded-full border border-[#32A05F]/30 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#32A05F]" />
          Resolved: 100% Refunded to Buyer
        </span>
      );
    }
    if (rawStatus === "RESOLVED_RELEASE") {
      return (
        <span className="text-xs font-bold text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
          Resolved: 100% Released to Seller
        </span>
      );
    }
    if (rawStatus === "APPEAL_PENDING") {
      return (
        <span className="text-xs font-bold text-rose-800 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          Under Senior Appeal Review
        </span>
      );
    }
    return (
      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full capitalize">
        {rawStatus.replace(/_/g, " ").toLowerCase()}
      </span>
    );
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/disputes"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Disputes
          </Link>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowContractModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-[#32A05F]" /> View Escrow Agreement
            </button>

            {isResolved && rawStatus !== "APPEAL_PENDING" && (
              <button
                type="button"
                onClick={() => setShowAppealModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <Scale className="w-3.5 h-3.5" /> 48-Hour Appeal Window
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <DisputeDetailSkeleton />
        ) : dispute ? (
          <div className="space-y-6">
            {/* Main Dispute Header Card */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                      Dispute #{dispute.id?.slice(0, 8)}
                    </span>
                    {getStatusBadge()}
                  </div>

                  <h1 className="text-2xl font-bold text-slate-900">
                    {dispute.transaction?.title || "Escrow Agreement Dispute"}
                  </h1>
                  <p className="text-xs text-slate-500">
                    Order Ref:{" "}
                    <span className="font-mono font-bold text-slate-700">
                      {dispute.transactionId?.slice(0, 8) || "N/A"}
                    </span>{" "}
                    • Reason: <strong className="text-slate-800">{dispute.reason}</strong>
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Frozen Escrow Amount
                  </span>
                  <div className="text-3xl font-black text-rose-600">
                    ₦{totalAmount.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Safely locked in neutral vault
                  </span>
                </div>
              </div>

              {/* Dispute Parties Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider block">
                    Claimant (Raised By)
                  </span>
                  <p className="font-bold text-slate-900 text-sm">
                    {dispute.raisedBy?.name ||
                      (dispute.raisedBy?.firstName
                        ? `${dispute.raisedBy.firstName} ${dispute.raisedBy.lastName || ""}`
                        : "Party A")}
                  </p>
                  <p className="text-slate-500 font-mono text-[11px]">
                    {dispute.raisedBy?.email || "Account on file"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider block">
                    Assigned Arbitration Panel
                  </span>
                  <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-[#32A05F]" /> PayTrust Dispute Tribunal
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Governed by Nigerian Arbitration & Conciliation Act
                  </p>
                </div>
              </div>
            </div>

            {/* MUTUAL SETTLEMENT BANNER / PROPOSAL CARD */}
            {!isResolved && (
              <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 border border-purple-400/30">
                      <Handshake className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">
                          Mutual Compromise Settlement Facility
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-purple-400/20 text-purple-200 text-[10px] font-bold border border-purple-400/30">
                          Fast-Track Resolution
                        </span>
                      </div>
                      <p className="text-xs text-purple-200 mt-1 max-w-xl leading-relaxed">
                        Rather than awaiting formal administrative ruling, parties can agree on a
                        custom percentage split (e.g. 80% to seller, 20% partial refund to buyer).
                        Upon mutual agreement, funds are disbursed instantly.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowSettlementModal(true)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer active:scale-95"
                  >
                    <Handshake className="w-4 h-4" /> Propose Compromise Split
                  </button>
                </div>

                {/* If there's an active settlement offer */}
                {dispute.settlementOffer && (
                  <div className="p-5 rounded-2xl bg-white/10 border border-purple-400/40 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">
                        Active Settlement Proposal:
                      </span>
                      <span className="text-[11px] text-purple-300">
                        Proposed by {dispute.settlementOffer.proposedBy || "Counterparty"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-purple-400/30">
                        <span className="text-[10px] uppercase text-purple-300 block font-bold">
                          Buyer Payout Share ({dispute.settlementOffer.buyerPercentage || 50}%)
                        </span>
                        <span className="text-base font-black text-emerald-400">
                          ₦{Number(dispute.settlementOffer.buyerAmount || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-purple-400/30">
                        <span className="text-[10px] uppercase text-purple-300 block font-bold">
                          Seller Payout Share ({dispute.settlementOffer.sellerPercentage || 50}%)
                        </span>
                        <span className="text-base font-black text-blue-400">
                          ₦{Number(dispute.settlementOffer.sellerAmount || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {dispute.settlementOffer.note && (
                      <p className="text-xs italic text-purple-100 bg-white/5 p-2.5 rounded-xl border border-white/10">
                        "{dispute.settlementOffer.note}"
                      </p>
                    )}

                    <div className="flex items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => handleRespondToSettlement("accept")}
                        disabled={isSubmitting}
                        className="flex-1 py-2.5 rounded-xl bg-[#32A05F] hover:bg-[#28874E] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" /> Accept & Release Funds Immediately
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRespondToSettlement("reject")}
                        disabled={isSubmitting}
                        className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Evidence Repository & Discussion Room */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Evidence Repository (1 Column) */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <FileImage className="w-4 h-4 text-[#32A05F]" />
                    <h3 className="font-bold text-slate-900 text-sm">Evidence File</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEvidenceModal(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#32A05F]" /> Add Proof
                  </button>
                </div>

                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                  {evidenceList.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      No documents or photos uploaded yet.
                    </div>
                  ) : (
                    evidenceList.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-slate-900 leading-snug">{item.title}</span>
                          <span className="text-[10px] font-bold uppercase text-[#32A05F] bg-[#EBF7F0] px-2 py-0.5 rounded-md shrink-0">
                            {item.type || "Doc"}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          {item.description}
                        </p>
                        <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-200/60">
                          <span>By: {item.submittedBy}</span>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Mediation Chat Stream (2 Columns) */}
              <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#32A05F]" />
                      Arbitration & Discussion Room
                    </h2>
                    <span className="text-[11px] text-slate-400">
                      Messages visible to all parties & arbiter
                    </span>
                  </div>

                  <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 max-h-[380px] overflow-y-auto">
                    {chatLog.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3.5 rounded-2xl max-w-lg ${
                          msg.role === "arbiter"
                            ? "bg-slate-900 text-white ml-auto border border-slate-800"
                            : msg.role === "user"
                            ? "bg-white text-slate-900 border border-slate-200 shadow-2xs ml-auto"
                            : "bg-white text-slate-900 border border-slate-200 mr-auto"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 mb-1">
                          <span
                            className={`text-xs font-bold ${
                              msg.role === "arbiter" ? "text-emerald-400" : "text-slate-800"
                            }`}
                          >
                            {msg.sender}
                          </span>
                          <span className="text-[10px] text-slate-400">{msg.time}</span>
                        </div>
                        <p className="text-xs sm:text-sm leading-relaxed">{msg.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendMessage} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Type your message or rebuttal for the mediator..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#32A05F]/50"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 rounded-xl bg-[#32A05F] hover:bg-[#28874E] text-white font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-4 h-4" /> Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-16 text-center bg-white border border-slate-200 rounded-3xl p-8 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Dispute Case Not Found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              This dispute could not be found or has been closed.
            </p>
            <Link
              href="/disputes"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-sm font-semibold shadow-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Disputes
            </Link>
          </div>
        )}
      </div>

      {/* Propose Settlement Modal */}
      {showSettlementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Handshake className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">Propose Compromise Split</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSettlementModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Total frozen escrow:{" "}
              <strong className="text-slate-800">₦{totalAmount.toLocaleString()}</strong>.
              Select how much each party receives to settle the dispute immediately.
            </p>

            {/* Quick Preset Buttons */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Split Presets
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "50 / 50", buyer: 50 },
                  { label: "70 / 30", buyer: 70 },
                  { label: "80 / 20", buyer: 80 },
                  { label: "100% Refund", buyer: 100 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setSettlementBuyerPct(preset.buyer)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      settlementBuyerPct === preset.buyer
                        ? "border-purple-600 bg-purple-50 text-purple-900"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-blue-700">Buyer: {settlementBuyerPct}%</span>
                <span className="text-emerald-700">Seller: {100 - settlementBuyerPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={settlementBuyerPct}
                onChange={(e) => setSettlementBuyerPct(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            {/* Split Amount Calculation Card */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                <span className="text-[10px] uppercase font-bold text-blue-800 block">
                  Buyer Refund Amount
                </span>
                <span className="text-sm font-black text-blue-900">
                  ₦{Math.round((totalAmount * settlementBuyerPct) / 100).toLocaleString()}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                  Seller Payout Amount
                </span>
                <span className="text-sm font-black text-emerald-900">
                  ₦{Math.round((totalAmount * (100 - settlementBuyerPct)) / 100).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Explanatory Note for Counterparty
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Proposing partial refund to compensate for repair costs..."
                value={settlementNote}
                onChange={(e) => setSettlementNote(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSettlementModal(false)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProposeSettlement}
                disabled={isSubmitting}
                className="w-1/2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Send Settlement Offer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Evidence Modal */}
      {showEvidenceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#32A05F]" />
                <h3 className="text-base font-bold text-slate-900">Upload Evidence</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEvidenceModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadEvidence} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Evidence Title / Document Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Courier Waybill Receipt, Defect Photos, Delivery Note"
                  value={evidenceTitle}
                  onChange={(e) => setEvidenceTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#32A05F]/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Category
                </label>
                <select
                  value={evidenceType}
                  onChange={(e) => setEvidenceType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#32A05F]/50 bg-white"
                >
                  <option value="image">Defect / Inspection Photo</option>
                  <option value="waybill">Courier Waybill & Tracking Proof</option>
                  <option value="document">Purchase Invoice / Specification Sheet</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Context / Summary of Evidence
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain what this evidence shows to the arbitrator..."
                  value={evidenceDesc}
                  onChange={(e) => setEvidenceDesc(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#32A05F]/50"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEvidenceModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 py-2.5 rounded-xl bg-[#32A05F] hover:bg-[#28874E] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Uploading..." : "Record Evidence"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 48-Hour Appeal Modal */}
      {showAppealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-base pb-3 border-b border-slate-100">
              <Scale className="w-5 h-5" />
              <span>File Formal Dispute Appeal</span>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 leading-relaxed">
              <strong>48-Hour Appeal Policy:</strong> Parties have a statutory 48-hour window
              following an arbitrator ruling to lodge an appeal based on newly discovered evidence.
            </div>

            <form onSubmit={handleAppeal} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Grounds for Appeal *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detail the material facts or new evidence that warrants review by senior compliance..."
                  value={appealReason}
                  onChange={(e) => setAppealReason(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAppealModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Filing..." : "Submit Appeal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Legal Printable Escrow Agreement Modal */}
      <EscrowContractModal
        isOpen={showContractModal}
        onClose={() => setShowContractModal(false)}
        deal={dispute?.transaction || { id: dispute?.transactionId, amount: dispute?.amount }}
      />
    </AppShell>
  );
}
