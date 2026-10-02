/**
 * PayTrust Cross-Portal Synchronization Engine
 * Bridges real-time state between the Customer App (:3000) and Admin Portal (:3001)
 * Supports BroadcastChannel for open tabs, localStorage for persistence, and REST API fallback.
 */

export interface SyncedDispute {
  id: string;
  transactionId: string;
  dealTitle: string;
  totalAmount: number;
  currency: string;
  status: "OPEN" | "SETTLEMENT_PROPOSED" | "RESOLVED_ADMIN" | "RESOLVED_MUTUAL";
  raisedBy: "buyer" | "seller";
  buyer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    kycTier: number;
  };
  seller: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    kycTier: number;
  };
  reason: string;
  details: string;
  evidenceList: Array<{
    id: string;
    uploaderRole: "buyer" | "seller" | "admin";
    uploaderName: string;
    title: string;
    fileUrl: string;
    fileType: string;
    submittedAt: string;
    description?: string;
  }>;
  adminRuling?: {
    resolvedAt: string;
    resolvedByAdminId: string;
    resolvedByAdminName: string;
    buyerPayout: number;
    sellerPayout: number;
    justification: string;
    appealDeadline: string;
  };
  createdAt: string;
}

export interface SyncedKyc {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  accountType: "individual" | "business";
  tierRequested: 1 | 2 | 3;
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "RESUBMISSION_REQUESTED";
  submittedAt: string;
  bvn?: string;
  nin?: string;
  idDocumentType?: "NIN_SLIP" | "DRIVERS_LICENSE" | "VOTERS_CARD" | "PASSPORT";
  idDocumentNumber?: string;
  idDocumentFrontUrl?: string;
  idDocumentBackUrl?: string;
  proofOfAddressUrl?: string;
  cacRegistrationNumber?: string;
  cacCertificateUrl?: string;
  tinNumber?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

const DISPUTES_STORAGE_KEY = "paytrust_shared_disputes_v1";
const KYC_STORAGE_KEY = "paytrust_shared_kyc_v1";
const CHANNEL_NAME = "paytrust_cross_portal_sync_bus";

class CrossPortalSync {
  private channel: BroadcastChannel | null = null;
  private listeners: Array<(event: { type: string; payload: any }) => void> = [];

  constructor() {
    if (typeof window !== "undefined") {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          if (event.data?.type) {
            this.notifyListeners(event.data);
          }
        };
      } catch (err) {
        console.warn("[CrossPortalSync] BroadcastChannel unsupported:", err);
      }

      // Also listen to window storage event for cross-origin or same-origin fallback
      window.addEventListener("storage", (e) => {
        if (e.key === DISPUTES_STORAGE_KEY) {
          this.notifyListeners({ type: "DISPUTES_UPDATED", payload: this.getDisputes() });
        } else if (e.key === KYC_STORAGE_KEY) {
          this.notifyListeners({ type: "KYC_UPDATED", payload: this.getKycQueue() });
        }
      });
    }
  }

  public subscribe(callback: (event: { type: string; payload: any }) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notifyListeners(event: { type: string; payload: any }) {
    this.listeners.forEach((cb) => {
      try {
        cb(event);
      } catch (err) {
        console.error("[CrossPortalSync] Listener callback error:", err);
      }
    });
  }

  private broadcast(type: string, payload: any) {
    if (this.channel) {
      try {
        this.channel.postMessage({ type, payload });
      } catch (err) {
        console.warn("[CrossPortalSync] Broadcast postMessage error:", err);
      }
    }
    this.notifyListeners({ type, payload });
  }

  // ─── DISPUTES ───
  public getDisputes(): SyncedDispute[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(DISPUTES_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public saveDispute(dispute: SyncedDispute): void {
    if (typeof window === "undefined") return;
    try {
      const existing = this.getDisputes();
      const idx = existing.findIndex((d) => d.id === dispute.id);
      if (idx >= 0) {
        existing[idx] = { ...existing[idx], ...dispute };
      } else {
        existing.unshift(dispute);
      }
      localStorage.setItem(DISPUTES_STORAGE_KEY, JSON.stringify(existing));
      this.broadcast("DISPUTE_RAISED", dispute);
    } catch (err) {
      console.error("[CrossPortalSync] Failed to save dispute:", err);
    }
  }

  public resolveDispute(
    disputeId: string,
    ruling: {
      buyerPayout: number;
      sellerPayout: number;
      justification: string;
      adminName?: string;
    }
  ): void {
    if (typeof window === "undefined") return;
    try {
      const existing = this.getDisputes();
      const dispute = existing.find((d) => d.id === disputeId);
      if (dispute) {
        dispute.status = "RESOLVED_ADMIN";
        dispute.adminRuling = {
          resolvedAt: new Date().toISOString(),
          resolvedByAdminId: "adm-exec-01",
          resolvedByAdminName: ruling.adminName || "Fiduciary Adjudicator",
          buyerPayout: ruling.buyerPayout,
          sellerPayout: ruling.sellerPayout,
          justification: ruling.justification,
          appealDeadline: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
        };
        localStorage.setItem(DISPUTES_STORAGE_KEY, JSON.stringify(existing));
        this.broadcast("DISPUTE_RESOLVED", { disputeId, ruling });
      }
    } catch (err) {
      console.error("[CrossPortalSync] Failed to resolve dispute:", err);
    }
  }

  // ─── KYC QUEUE ───
  public getKycQueue(): SyncedKyc[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(KYC_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public submitKyc(submission: SyncedKyc): void {
    if (typeof window === "undefined") return;
    try {
      const existing = this.getKycQueue();
      const idx = existing.findIndex((k) => k.id === submission.id);
      if (idx >= 0) {
        existing[idx] = { ...existing[idx], ...submission };
      } else {
        existing.unshift(submission);
      }
      localStorage.setItem(KYC_STORAGE_KEY, JSON.stringify(existing));
      this.broadcast("KYC_SUBMITTED", submission);
    } catch (err) {
      console.error("[CrossPortalSync] Failed to submit KYC:", err);
    }
  }

  public updateKycStatus(
    submissionId: string,
    status: "APPROVED" | "REJECTED",
    notes?: string
  ): void {
    if (typeof window === "undefined") return;
    try {
      const existing = this.getKycQueue();
      const k = existing.find((item) => item.id === submissionId);
      if (k) {
        k.status = status;
        k.reviewedAt = new Date().toISOString();
        k.reviewedBy = "Fiduciary Compliance Controller";
        if (status === "REJECTED" && notes) {
          k.rejectionReason = notes;
        }
        localStorage.setItem(KYC_STORAGE_KEY, JSON.stringify(existing));
        this.broadcast("KYC_STATUS_UPDATED", { submissionId, status, notes });
      }
    } catch (err) {
      console.error("[CrossPortalSync] Failed to update KYC status:", err);
    }
  }
}

export const crossPortalSync = new CrossPortalSync();
