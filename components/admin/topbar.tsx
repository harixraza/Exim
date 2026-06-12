"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Session } from "@/lib/store"

const titles: Record<string, string> = {
  dashboard: "Dashboard",
  buyers: "International Buyers",
  exporters: "Exporters",
  users: "Users & Permissions",
  templates: "Templates",
  intelligence: "Business Intelligence",
  settings: "Settings",
}

export function Topbar({ page, session }: { page: string; session: Session }) {
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
      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-foreground">{session.name}</p>
          <p className="text-xs text-muted-foreground">
            {session.email} · {session.role}
          </p>
        </div>
        <Avatar className="size-9">
          <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
