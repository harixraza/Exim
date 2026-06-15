"use client"

import { cn } from "@/lib/utils"
import type { Permissions } from "@/lib/store"
import {
  LayoutDashboard,
  Globe,
  Ship,
  Users,
  FileText,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react"

export type AdminPage =
  | "dashboard"
  | "buyers"
  | "exporters"
  | "users"
  | "templates"
  | "intelligence"
  | "settings"

const navItems: {
  id: AdminPage
  label: string
  icon: typeof LayoutDashboard
  perm?: keyof Permissions
}[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "buyers", label: "International Buyers", icon: Globe, perm: "manageBuyers" },
  { id: "exporters", label: "Exporters", icon: Ship, perm: "manageExporters" },
  { id: "users", label: "Users & Permissions", icon: Users, perm: "manageUsers" },
  { id: "templates", label: "Templates", icon: FileText, perm: "viewTemplates" },
  { id: "intelligence", label: "Business Intelligence", icon: BarChart3, perm: "viewIntelligence" },
  { id: "settings", label: "Settings", icon: Settings, perm: "manageSettings" },
]

export function Sidebar({
  current,
  onNavigate,
  onLogout,
  perms,
}: {
  current: AdminPage
  onNavigate: (page: AdminPage) => void
  onLogout: () => void
  perms: Permissions
}) {
  const visible = navItems.filter((item) => !item.perm || perms[item.perm])

  return (
    <aside className="relative flex h-full w-64 shrink-0 flex-col overflow-hidden border-r border-white/10 bg-[oklch(0.2_0.07_255)] text-white/85">
      {/* subtle dot texture, same vibe as login */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 -top-20 size-60 rounded-full bg-[oklch(0.55_0.16_200)]/20 blur-3xl"
      />

      {/* Brand block — logo inverted to white so it sits on navy directly */}
      <div className="relative border-b border-white/10 px-5 py-7">
        <img
          src="/images/exim-logo.png"
          alt="EXIM — Export-Import Bank of Pakistan"
          className="mx-auto h-16 w-auto"
          style={{ filter: "brightness(0) invert(1)", opacity: 0.95 }}
        />
        <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-white/45">
          Credit Ratings Portal
        </p>
      </div>

      <nav className="relative flex flex-1 flex-col gap-1 p-3">
        {visible.map((item) => {
          const Icon = item.icon
          const active = current === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white text-[oklch(0.25_0.08_255)] shadow-sm"
                  : "text-white/75 hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="relative border-t border-white/10 p-3">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut className="size-4 shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  )
}
