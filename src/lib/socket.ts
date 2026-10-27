import { io, Socket } from "socket.io-client";
import { toast } from "@/components/ui/Toast";

let socketInstance: Socket | null = null;
let currentToken: string | null = null;

/**
 * Initializes and returns the global Socket.IO client instance for PeltaPay.
 * Connects with JWT authentication, auto-reconnects, and handles real-time
 * notifications, badge updates, and transactional events.
 */
export const getSocket = (token?: string): Socket | null => {
  if (typeof window === "undefined") return null;

  const authToken =
    token || (localStorage.getItem("peltapay_token") || localStorage.getItem("paytrust_token")) || null;

  if (!authToken) {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
      currentToken = null;
    }
    return null;
  }

  // If already connected with the same token, return existing instance
  if (socketInstance && currentToken === authToken && socketInstance.connected) {
    return socketInstance;
  }

  // If token changed, tear down old connection
  if (socketInstance && currentToken !== authToken) {
    socketInstance.disconnect();
    socketInstance = null;
  }

  const apiBase =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";
  const socketBaseUrl = apiBase.replace(/\/api\/v1\/?$/, "");

  currentToken = authToken;
  socketInstance = io(socketBaseUrl, {
    auth: { token: authToken },
    query: { token: authToken },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });

  socketInstance.on("connect", () => {
    // Socket successfully established with backend
  });

  socketInstance.on("connected", (data: { unreadCount?: number }) => {
    if (typeof data?.unreadCount === "number") {
      window.dispatchEvent(
        new CustomEvent("peltapay:unread-count", {
          detail: data.unreadCount,
        })
      );
    }
  });

  socketInstance.on("notification:new", (newNotif: any) => {
    const title = newNotif.title || "Notification";
    const msg = newNotif.message || "You have a new update on your escrow transaction.";
    const type = (newNotif.type || "").toLowerCase();

    // Trigger visual toast banner
    if (
      type.includes("success") ||
      type.includes("released") ||
      type.includes("approved") ||
      type.includes("completed")
    ) {
      toast.success(title, msg, 5500);
    } else if (
      type.includes("warning") ||
      type.includes("dispute") ||
      type.includes("hold")
    ) {
      toast.warning(title, msg, 6500);
    } else if (
      type.includes("error") ||
      type.includes("failed") ||
      type.includes("rejected") ||
      type.includes("cancelled")
    ) {
      toast.error(title, msg, 6500);
    } else {
      toast.info(title, msg, 5000);
    }

    // Broadcast across windows/tabs so open views update their state
    window.dispatchEvent(
      new CustomEvent("peltapay:notification", {
        detail: newNotif,
      })
    );
    window.dispatchEvent(
      new CustomEvent("peltapay:live-refresh", {
        detail: newNotif,
      })
    );
  });

  socketInstance.on("notification:unread_count", (data: { unreadCount: number }) => {
    if (typeof data?.unreadCount === "number") {
      window.dispatchEvent(
        new CustomEvent("peltapay:unread-count", {
          detail: data.unreadCount,
        })
      );
    }
  });

  socketInstance.on("notification:all_read", () => {
    window.dispatchEvent(
      new CustomEvent("peltapay:unread-count", {
        detail: 0,
      })
    );
  });

  socketInstance.on("disconnect", () => {
    // Reconnection is handled automatically by socket.io-client
  });

  return socketInstance;
};

/**
 * Cleanly disconnects the active Socket.IO connection.
 */
export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
    currentToken = null;
  }
};
