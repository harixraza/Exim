"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar, type AdminPage } from "@/components/admin/sidebar"
import { Topbar } from "@/components/admin/topbar"
import { DashboardPage } from "@/components/admin/pages/dashboard-page"
import { BuyersPage } from "@/components/admin/pages/buyers-page"
import { ExportersPage } from "@/components/admin/pages/exporters-page"
import { UsersPage } from "@/components/admin/pages/users-page"
import { TemplatesPage } from "@/components/admin/pages/templates-page"
import { IntelligencePage } from "@/components/admin/pages/intelligence-page"
import { SettingsPage } from "@/components/admin/pages/settings-page"
import { clearSession, getSession, type Session } from "@/lib/store"

export function AdminApp() {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)
  const [page, setPage] = useState<AdminPage>("dashboard")

  useEffect(() => {
    const s = getSession()
    if (!s || s.type !== "exim") {
      router.replace("/")
      return
    }
    setSession(s)
    setReady(true)
  }, [router])

  if (!ready || !session) {
    return (
      <div className="flex h-svh items-center justify-center bg-secondary text-sm text-muted-foreground">
        Loading portal…
      </div>
    )
  }

  function handleLogout() {
    clearSession()
    router.replace("/")
  }

  return (
    <div className="flex h-svh bg-secondary">
      <Sidebar current={page} onNavigate={setPage} onLogout={handleLogout} perms={session.perms} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar page={page} session={session} />
        <main className="flex-1 overflow-y-auto p-6">
          {page === "dashboard" && <DashboardPage />}
          {page === "buyers" && <BuyersPage />}
          {page === "exporters" && <ExportersPage />}
          {page === "users" && <UsersPage session={session} />}
          {page === "templates" && <TemplatesPage />}
          {page === "intelligence" && <IntelligencePage />}
          {page === "settings" && <SettingsPage session={session} />}
        </main>
      </div>
    </div>
  )
}
