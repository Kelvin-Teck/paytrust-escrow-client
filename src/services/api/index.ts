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
    email: string;
    password: string;
    phone?: string;
  }) => {
    const res = await apiClient.post("/auth/login", payload);
    return extract(res);
  },

  register: async (payload: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone: string;
    country?: string;
    referralCode?: string;
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

  createInvoice: async (payload: {
    title: string;
    description?: string;
    amount: number;
    currency?: string;
    buyerEmail?: string;
    buyerPhone?: string;
    inspectionPeriod?: number;
    milestones?: Array<{ title: string; amount: number; description?: string }>;
    items?: Array<{ name: string; quantity: number; price: number }>;
  }) => {
    const formattedPayload = {
      ...payload,
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

  payInvoice: async (transactionId: string) => {
    const res = await apiClient.post(`/transactions/${transactionId}/pay`);
    return extract(res);
  },

  markAsShipped: async (
    transactionId: string,
    shippingData: { courier: string; trackingNumber: string },
  ) => {
    const res = await apiClient.put(
      `/transactions/${transactionId}/ship`,
      shippingData,
    );
    return extract(res);
  },

  confirmDelivery: async (transactionId: string) => {
    const res = await apiClient.post(`/transactions/${transactionId}/confirm`);
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
