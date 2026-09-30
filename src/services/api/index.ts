import { apiClient } from "@/lib/axios";

const extract = (res: any) => {
  if (
    res?.data &&
    res.data.status === "SUCCESS" &&
    res.data.data !== undefined
  ) {
    return res.data.data;
  }
  if (res?.data !== undefined) {
    return res.data;
  }
  return res;
};

// ─── AUTHENTICATION SERVICE ───
export const authService = {
  login: async (payload: {
    email?: string;
    phone?: string;
    emailOrPhone?: string;
    password: string;
  }) => {
    const res = await apiClient.post("/auth/login", payload);
    return extract(res);
  },

  register: async (payload: {
    email?: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    country?: string;
    referralCode?: string;
    accountType?: "individual" | "business";
    companyName?: string;
    rcNumber?: string;
    tin?: string;
    businessAddress?: string;
    businessType?: string;
  }) => {
    const res = await apiClient.post("/auth/register", payload);
    return extract(res);
  },

  verifyEmail: async (payload: {
    email?: string;
    phone?: string;
    code: string;
  }) => {
    const res = await apiClient.post("/auth/verify", payload);
    return extract(res);
  },

  resendVerification: async (payload: { email?: string; phone?: string }) => {
    const res = await apiClient.post("/auth/resend-verification", payload);
    return extract(res);
  },

  forgotPassword: async (payload: { email?: string; phone?: string }) => {
    const res = await apiClient.post("/auth/forgot-password", payload);
    return extract(res);
  },

  verifyResetCode: async (payload: {
    email?: string;
    phone?: string;
    code: string;
  }) => {
    const res = await apiClient.post("/auth/forgot-password/verify", payload);
    return extract(res);
  },

  resetPassword: async (payload: {
    email?: string;
    phone?: string;
    code: string;
    password: string;
  }) => {
    const res = await apiClient.post("/auth/reset-password", payload);
    return extract(res);
  },

  initiateClaim: async (payload: {
    email?: string;
    phone?: string;
    password?: string;
    transactionId?: string;
  }) => {
    const res = await apiClient.post("/auth/claim/initiate", payload);
    return extract(res);
  },

  completeClaim: async (payload: {
    email?: string;
    phone?: string;
    otp: string;
    transactionId?: string;
  }) => {
    const res = await apiClient.post("/auth/claim/complete", payload);
    return extract(res);
  },

  logout: async () => {
    const res = await apiClient.post("/auth/logout");
    return extract(res);
  },
};

// ─── DASHBOARD SERVICE ───
export const dashboardService = {
  getDashboard: async () => {
    const res = await apiClient.get("/dashboard");
    return extract(res);
  },
};

// ─── TRANSACTION & ESCROW SERVICE ───
export const transactionService = {
  getTransactions: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const res = await apiClient.get("/transactions", { params });
    return extract(res);
  },

  getTransactionById: async (id: string) => {
    const res = await apiClient.get(`/transactions/${id}`);
    return extract(res);
  },

  getPublicPreview: async (id: string) => {
    const res = await apiClient.get(`/transactions/public/${id}`);
    return extract(res);
  },

  createInvoice: async (payload: {
    title: string;
    description?: string;
    amount: number;
    currency?: string;
    buyerEmail?: string;
    buyerPhone?: string;
    inspectionPeriod?: number;
    dealType?: "p2p" | "b2b_milestone" | "b2b_contract";
    poNumber?: string;
    taxRate?: number;
    taxAmount?: number;
    contractUrl?: string;
    termsAndConditions?: string;
    milestones?: Array<{ title: string; amount: number; description?: string }>;
    items?: Array<{ name: string; quantity: number; price: number }>;
  }) => {
    const formattedPayload = {
      ...payload,
      dealType: payload.dealType || "p2p",
      description: payload.description || payload.title,
      title: payload.title,
      amount: payload.amount,
      items:
        payload.items && payload.items.length > 0
          ? payload.items
          : [
              {
                name:
                  payload.title || payload.description || "Escrow Milestone",
                quantity: 1,
                price: Number(payload.amount),
              },
            ],
    };
    const res = await apiClient.post("/transactions/invoice", formattedPayload);
    return extract(res);
  },

  payInvoice: async (
    transactionId: string,
    walletType: "naira" | "btc" = "naira",
  ) => {
    const res = await apiClient.post(`/transactions/${transactionId}/pay`, {
      walletType,
    });
    return extract(res);
  },

  markAsShipped: async (
    transactionId: string,
    shippingData: {
      courier?: string;
      shippingCarrier?: string;
      trackingNumber: string;
      proofUrls?: string[];
    },
  ) => {
    const payload = {
      shippingCarrier:
        shippingData.shippingCarrier || shippingData.courier || "",
      courier: shippingData.courier || shippingData.shippingCarrier || "",
      trackingNumber: shippingData.trackingNumber,
      proofUrls: shippingData.proofUrls,
    };
    const res = await apiClient.put(
      `/transactions/${transactionId}/ship`,
      payload,
    );
    return extract(res);
  },

  confirmDelivery: async (transactionId: string) => {
    const res = await apiClient.post(`/transactions/${transactionId}/confirm`);
    return extract(res);
  },

  cancelTransaction: async (transactionId: string, reason?: string) => {
    const res = await apiClient.post(`/transactions/${transactionId}/cancel`, {
      reason,
    });
    return extract(res);
  },

  verifyReleaseOtp: async (transactionId: string, otp: string) => {
    const res = await apiClient.post(`/transactions/${transactionId}/verify-otp`, {
      otp,
    });
    return extract(res);
  },

  autoReleaseSettlement: async (transactionId: string) => {
    const res = await apiClient.post(`/transactions/${transactionId}/auto-release`);
    return extract(res);
  },

  respondToInvoice: async (
    transactionId: string,
    action: "accept" | "reject",
    reason?: string,
  ) => {
    const res = await apiClient.post(`/transactions/${transactionId}/respond`, {
      action,
      reason,
    });
    return extract(res);
  },

  submitMilestoneDeliverable: async (
    transactionId: string,
    milestoneId: string,
    payload: {
      deliverableUrl?: string;
      notes: string;
      attachmentUrls?: string[];
    },
  ) => {
    const res = await apiClient.post(
      `/transactions/${transactionId}/milestones/${milestoneId}/submit`,
      payload,
    );
    return extract(res);
  },

  approveMilestoneRelease: async (
    transactionId: string,
    milestoneId: string,
  ) => {
    const res = await apiClient.post(
      `/transactions/${transactionId}/milestones/${milestoneId}/approve`,
    );
    return extract(res);
  },

  requestInspectionExtension: async (
    transactionId: string,
    payload: {
      additionalDays: number;
      reason: string;
    },
  ) => {
    const res = await apiClient.post(
      `/transactions/${transactionId}/inspection-extension/request`,
      payload,
    );
    return extract(res);
  },

  respondToInspectionExtension: async (
    transactionId: string,
    action: "approve" | "decline",
  ) => {
    const res = await apiClient.post(
      `/transactions/${transactionId}/inspection-extension/respond`,
      { action },
    );
    return extract(res);
  },
};

// ─── WALLET & PAYOUT SERVICE ───
export const walletService = {
  getBalances: async () => {
    const res = await apiClient.get("/wallets");
    return extract(res);
  },

  getHistory: async (params?: { page?: number; limit?: number }) => {
    const res = await apiClient.get("/wallets/history", { params });
    return extract(res);
  },

  withdraw: async (payload: { amount: number; bankAccountId?: string }) => {
    const res = await apiClient.post("/wallets/withdraw", payload);
    return extract(res);
  },
};

// ─── PAYMENT GATEWAY SERVICE ───
export const paymentService = {
  initializeFunding: async (payload: {
    amount: number;
    currency?: string;
    callbackUrl?: string;
  }) => {
    const res = await apiClient.post("/payments/initialize", payload);
    return extract(res);
  },

  verifyPayment: async (reference: string) => {
    const res = await apiClient.get(`/payments/verify/${reference}`);
    return extract(res);
  },
};

// ─── DISPUTE MEDIATION SERVICE ───
export const disputeService = {
  getDisputes: async (params?: { page?: number; limit?: number }) => {
    const res = await apiClient.get("/disputes", { params });
    return extract(res);
  },

  getDisputeById: async (id: string) => {
    const res = await apiClient.get(`/disputes/${id}`);
    return extract(res);
  },

  raiseDispute: async (payload: {
    transactionId: string;
    reason: string;
    details?: string;
  }) => {
    const res = await apiClient.post("/disputes", payload);
    return extract(res);
  },

  resolveDispute: async (
    disputeId: string,
    payload: {
      resolution: "resolved_refund" | "resolved_release";
      notes?: string;
    },
  ) => {
    const res = await apiClient.post(`/disputes/${disputeId}/resolve`, payload);
    return extract(res);
  },

  proposeSettlement: async (
    disputeId: string,
    payload: {
      buyerAmount: number;
      sellerAmount: number;
      note?: string;
    },
  ) => {
    const res = await apiClient.post(
      `/disputes/${disputeId}/settlement/propose`,
      payload,
    );
    return extract(res);
  },

  respondToSettlement: async (
    disputeId: string,
    action: "accept" | "reject",
    note?: string,
  ) => {
    const res = await apiClient.post(
      `/disputes/${disputeId}/settlement/respond`,
      {
        action,
        note,
      },
    );
    return extract(res);
  },

  uploadEvidence: async (
    disputeId: string,
    evidence: {
      title: string;
      description?: string;
      fileUrl?: string;
      fileType?: string;
    },
  ) => {
    const res = await apiClient.post(
      `/disputes/${disputeId}/evidence`,
      evidence,
    );
    return extract(res);
  },

  appealResolution: async (
    disputeId: string,
    payload: { reason: string; appealEvidenceUrls?: string[] },
  ) => {
    const res = await apiClient.post(`/disputes/${disputeId}/appeal`, payload);
    return extract(res);
  },
};

// ─── PROFILE & KYC SERVICE ───
export const profileService = {
  getProfile: async () => {
    const res = await apiClient.get("/profiles");
    return extract(res);
  },

  updatePersonal: async (payload: {
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    dob?: string;
  }) => {
    const res = await apiClient.put("/profiles/personal", payload);
    return extract(res);
  },

  updateBusiness: async (payload: {
    companyName?: string;
    rcNumber?: string;
    tin?: string;
    businessAddress?: string;
    businessType?: string;
  }) => {
    const res = await apiClient.put("/profiles/business", payload);
    return extract(res);
  },

  updateBankDetails: async (payload: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  }) => {
    const res = await apiClient.put("/profiles/bank-details", payload);
    return extract(res);
  },

  submitKyc: async (formData: FormData) => {
    const res = await apiClient.post("/profiles/kyc/submit", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return extract(res);
  },

  submitKyb: async (formData: FormData) => {
    const res = await apiClient.post("/profiles/kyb/submit", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return extract(res);
  },

  getBanks: async (country = "nigeria") => {
    const res = await apiClient.get("/profiles/banks", { params: { country } });
    return extract(res);
  },

  resolveBankAccount: async (accountNumber: string, bankCode: string) => {
    const res = await apiClient.get("/profiles/banks/resolve", {
      params: { accountNumber, bankCode },
    });
    return extract(res);
  },
};

// ─── NOTIFICATIONS SERVICE ───
export const notificationService = {
  getNotifications: async (params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }) => {
    const res = await apiClient.get("/notifications", { params });
    return extract(res);
  },

  getUnreadCount: async () => {
    const res = await apiClient.get("/notifications/unread-count");
    return extract(res);
  },

  markAsRead: async (id: string) => {
    const res = await apiClient.put(`/notifications/${id}/read`);
    return extract(res);
  },

  markAllAsRead: async () => {
    const res = await apiClient.put("/notifications/read-all");
    return extract(res);
  },

  deleteNotification: async (id: string) => {
    const res = await apiClient.delete(`/notifications/${id}`);
    return extract(res);
  },
};

// ─── ANALYTICS SERVICE ───
export const analyticsService = {
  getStats: async () => {
    const res = await apiClient.get("/analytics/stats");
    return extract(res);
  },

  getDashboardAnalytics: async () => {
    const res = await apiClient.get("/analytics/dashboard");
    return extract(res);
  },
};
