"use client"

import { useEffect, useRef, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChevronDown, Settings as SettingsIcon, LogOut } from "lucide-react"
import type { Session } from "@/lib/store"
import { cn } from "@/lib/utils"

const titles: Record<string, string> = {
  dashboard: "Dashboard",
  buyers: "International Buyers",
  exporters: "Exporters",
  users: "Users & Permissions",
  templates: "Templates",
  intelligence: "Business Intelligence",
  settings: "Settings",
}

export function Topbar({
  page,
  session,
  onNavigate,
  onLogout,
}: {
  page: string
  session: Session
  onNavigate: (page: "settings") => void
  onLogout: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const initials = session.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{titles[page]}</h1>
        <p className="text-xs text-muted-foreground">EXIM Bank — Admin Console</p>
      </div>

      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/60",
            open && "bg-muted/60",
          )}
        >
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-foreground">{session.name}</p>
            <p className="text-xs text-muted-foreground">{session.role}</p>
          </div>
          <Avatar className="size-9">
            <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
          </Avatar>
          <ChevronDown
            className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")}
          />
        </button>

        {open ? (
          <div
            role="menu"
            className="absolute right-0 top-full z-40 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-4 py-3">
              <Avatar className="size-10">
                <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{session.name}</p>
                <p className="truncate text-xs text-muted-foreground">{session.email}</p>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                  {session.role}
                </p>
              </div>
            </div>
            <div className="p-1.5">
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  onNavigate("settings")
                }}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted/60"
              >
                <SettingsIcon className="size-4 text-muted-foreground" />
                Settings
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  onLogout()
                }}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-destructive transition-colors hover:bg-red-50"
              >
                <LogOut className="size-4" />
                Logout
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  )
}
