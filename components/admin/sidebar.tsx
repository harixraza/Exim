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
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="border-b border-sidebar-border px-4 py-5">
        <div className="flex items-center justify-center rounded-lg bg-white px-3 py-2 shadow-sm ring-1 ring-border">
          <img
            src="/images/exim-logo.png"
            alt="EXIM — Export-Import Bank of Pakistan"
            className="h-10 w-auto"
          />
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">Credit Ratings Portal</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
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
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="size-4 shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  )
}
