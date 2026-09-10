"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  ShieldCheck,
  UserCheck,
  LogOut,
  PlusCircle,
  Bell,
  Search,
  Menu,
  X,
  ChevronRight,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/ui/Logo";
import { useAuthStore } from "@/stores/authStore";
import { profileService, notificationService } from "@/services/api";
import { getTierInfo } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
  actionButton?: React.ReactNode;
}

export function AppShell({
  children,
  pageTitle,
  pageSubtitle,
  actionButton,
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const { user, initialize, logout, setUser } = useAuthStore();

  useEffect(() => {
    initialize();

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("paytrust_token")
        : null;
    if (!token) {
      router.push("/login");
      return;
    }

    // Fetch live profile
    profileService
      .getProfile()
      .then((profile) => {
        if (profile) {
          setUser(profile);
        }
      })
      .catch(() => {});

    // Fetch notifications count
    notificationService
      .getUnreadCount()
      .then((res) => {
        if (res && typeof res.unreadCount === "number") {
          setUnreadCount(res.unreadCount);
        } else if (typeof res === "number") {
          setUnreadCount(res);
        }
      })
      .catch(() => {
        notificationService
          .getNotifications()
          .then((data) => {
            const list = Array.isArray(data) ? data : data?.notifications || [];
            const unread = list.filter((n: any) => !n.isRead).length;
            setUnreadCount(unread);
          })
          .catch(() => {});
      });
  }, [initialize, setUser, router]);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Escrow Deals", href: "/transaction", icon: Receipt },
    { name: "Multi-Wallet", href: "/wallet", icon: Wallet },
    { name: "Disputes & Mediation", href: "/disputes", icon: AlertTriangle },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Profile & Settings", href: "/profile", icon: UserCheck },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const formatNameFromEmail = (email?: string) => {
    if (!email) return "My Account";
    const username = email.split("@")[0];
    return username
      .split(/[._-]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  };

  const displayName =
    user?.name ||
    (user?.firstName
      ? `${user.firstName} ${user.lastName || ""}`.trim()
      : null) ||
    (user?.email ? formatNameFromEmail(user.email) : "My Account");

  const userInitials = user?.firstName
    ? `${user.firstName[0]}${user.lastName?.[0] || ""}`.toUpperCase()
    : user?.name
      ? user.name
          .split(" ")
          .filter(Boolean)
          .map((n: string) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : user?.email
        ? user.email.slice(0, 2).toUpperCase()
        : "PT";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-[#EBF7F0] selection:text-[#32A05F]">
      {/* ─── MOBILE TOP HEADER ─── */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Logo size="sm" href="/dashboard" />
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/notifications"
            className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#32A05F] rounded-full ring-2 ring-white animate-pulse" />
            )}
          </Link>
        </div>
      </header>

      {/* ─── MAIN SHELL CONTAINER ─── */}
      <div className="flex-1 flex w-full max-w-[1600px] mx-auto">
        {/* ─── DESKTOP SIDEBAR ─── */}
        <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 p-5 sticky top-0 h-screen overflow-y-auto">
          <div className="flex items-center justify-between px-2 mb-8">
            <Logo size="md" href="/dashboard" />
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#EBF7F0] text-[#32A05F] px-1.5 py-0.5 rounded-md border border-[#32A05F]/20">
              Escrow
            </span>
          </div>

          <div className="mb-6">
            <Link
              href="/transaction/invoice"
              className="w-full bg-[#32A05F] hover:bg-[#28874E] active:scale-[0.98] text-white py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-sm shadow-[#32A05F]/25 transition-all group"
            >
              <PlusCircle className="w-4 h-4 transition-transform group-hover:rotate-90" />
              <span>Create New Escrow</span>
            </Link>
          </div>

          <nav className="flex-1 space-y-1.5">
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Menu Navigation
            </p>
            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#EBF7F0] text-[#32A05F] font-bold shadow-xs border border-[#32A05F]/20"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${isActive ? "text-[#32A05F]" : "text-slate-500"}`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-[#32A05F]" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-4 border-t border-slate-100 space-y-3">
            {(() => {
              const tier = getTierInfo(user?.kycStatus);
              return (
                <div className="p-3.5 rounded-2xl bg-[#0F172A] text-white shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${tier.statusColor}`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {tier.tierName}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                        tier.tierNumber === 2
                          ? "bg-[#32A05F]/20 text-[#32A05F]"
                          : tier.badgeText === "In Review"
                            ? "bg-amber-400/20 text-amber-400"
                            : tier.badgeText === "Rejected"
                              ? "bg-rose-500/20 text-rose-400"
                              : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {tier.badgeText}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    {tier.description}
                  </p>
                </div>
              );
            })()}

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#EBF7F0] text-[#32A05F] font-bold text-xs flex items-center justify-center shrink-0 border border-[#32A05F]/30">
                  {userInitials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {user?.email || "user@paytrust.io"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* ─── DESKTOP MAIN CONTENT AREA ─── */}
        <main className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-10">
          <div className="hidden lg:flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
            <div>
              {pageTitle ? (
                <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    {pageTitle}
                  </h1>
                  {pageSubtitle && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      {pageSubtitle}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Link
                    href="/dashboard"
                    className="hover:text-[#32A05F] transition-colors"
                  >
                    Home
                  </Link>
                  <span>/</span>
                  <span className="text-slate-800 font-semibold capitalize">
                    {pathname.replace("/", "").split("/")[0] || "Dashboard"}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search invoice or reference..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#32A05F] rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all"
                />
              </div>

              <Link
                href="/notifications"
                className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-[#32A05F] rounded-full ring-2 ring-white" />
                )}
              </Link>

              {actionButton}
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-8 flex-1">{children}</div>
        </main>
      </div>

      {/* ─── MOBILE DRAWER ─── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed top-0 bottom-0 left-0 w-[290px] bg-white z-50 flex flex-col p-6 shadow-2xl lg:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <Logo size="sm" href="/dashboard" />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="my-5">
                <Link
                  href="/transaction/invoice"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full bg-[#32A05F] text-white py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>New Escrow Deal</span>
                </Link>
              </div>

              <nav className="space-y-1.5 flex-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-[#EBF7F0] text-[#32A05F] font-bold"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${isActive ? "text-[#32A05F]" : "text-slate-500"}`}
                      />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-6 border-t border-slate-100 mt-auto">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── MOBILE BOTTOM BAR ─── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 flex items-center justify-around shadow-lg">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[11px] font-medium transition-colors ${
            pathname === "/dashboard"
              ? "text-[#32A05F] font-bold"
              : "text-slate-500"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>
        <Link
          href="/transaction"
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[11px] font-medium transition-colors ${
            pathname.startsWith("/transaction")
              ? "text-[#32A05F] font-bold"
              : "text-slate-500"
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span>Escrows</span>
        </Link>
        <Link
          href="/wallet"
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[11px] font-medium transition-colors ${
            pathname.startsWith("/wallet")
              ? "text-[#32A05F] font-bold"
              : "text-slate-500"
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span>Wallet</span>
        </Link>
        <Link
          href="/profile"
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[11px] font-medium transition-colors ${
            pathname.startsWith("/profile")
              ? "text-[#32A05F] font-bold"
              : "text-slate-500"
          }`}
        >
          <UserCheck className="w-5 h-5" />
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  );
}

export default AppShell;
