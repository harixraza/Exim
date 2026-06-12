"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { authenticate, getSession, seedIfNeeded } from "@/lib/store"
import { Landmark, Ship, QrCode, ShieldCheck, Users, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type LoginTab = "exim" | "exporter"

export default function LandingPage() {
  const router = useRouter()
  const [tab, setTab] = useState<LoginTab>("exim")
  const [email, setEmail] = useState("admin@exim.gov")
  const [password, setPassword] = useState("admin123")
  const [error, setError] = useState("")

  useEffect(() => {
    seedIfNeeded()
    const session = getSession()
    if (session) router.replace(session.type === "exim" ? "/admin" : "/exporter")
  }, [router])

  function switchTab(next: LoginTab) {
    setTab(next)
    setError("")
    setEmail(next === "exim" ? "admin@exim.gov" : "exporter@crescent.pk")
    setPassword(next === "exim" ? "admin123" : "exporter123")
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const session = authenticate(email, password, tab)
    if (!session) {
      setError("Invalid credentials for this portal. Please check email, password and portal type.")
      return
    }
    router.push(session.type === "exim" ? "/admin" : "/exporter")
  }

  return (
    <main className="min-h-svh bg-[radial-gradient(ellipse_at_top_left,_oklch(0.36_0.11_255_/_0.12),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_oklch(0.55_0.12_200_/_0.12),_transparent_55%)] bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 sm:px-10">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-white px-3 py-1.5 shadow-sm ring-1 ring-border">
            <img src="/images/exim-logo.png" alt="EXIM — Export-Import Bank of Pakistan" className="h-8 w-auto" />
          </div>
        </div>
        <p className="hidden text-xs text-muted-foreground sm:block">Government of Pakistan — Development Finance Institution</p>
      </header>

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-16 pt-6 lg:grid-cols-2 lg:gap-16 sm:px-10">
        {/* Branding panel */}
        <section className="relative overflow-hidden rounded-3xl bg-[oklch(0.25_0.07_255)] p-8 text-white shadow-xl sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-[oklch(0.55_0.12_200)]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full bg-[oklch(0.45_0.13_255)]/30 blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs">
              <ShieldCheck className="size-3.5" />
              Pak-EXIM Credit Rating Service
            </div>

            <h1 className="mt-5 text-balance text-3xl font-bold leading-tight sm:text-4xl">
              Credit Ratings Portal
            </h1>
            <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-white/75">
              Verified credit ratings of international buyers for Pakistani exporters. Scan a buyer&apos;s QR code
              at the expo floor and make confident export decisions instantly.
            </p>

            <div className="mt-8 flex flex-col gap-4">
              <Feature icon={QrCode} title="Scan QR Codes" desc="Each rated buyer gets a secure QR code linked to their credit profile." />
              <Feature icon={ShieldCheck} title="Verified Ratings" desc="Clear A–D ratings assigned by EXIM Bank, backed by trade history." />
              <Feature icon={Users} title="Approved Access" desc="Profiles unlock only with the access code issued by EXIM Bank." />
            </div>

            <div className="mt-10 rounded-xl bg-white p-3 shadow-lg ring-1 ring-white/30 sm:max-w-xs">
              <img src="/images/exim-logo.png" alt="Export-Import Bank of Pakistan" className="mx-auto h-12 w-auto" />
            </div>
          </div>
        </section>

        {/* Login panel */}
        <section className="w-full">
          <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
            <TabButton active={tab === "exim"} onClick={() => switchTab("exim")} icon={Landmark} label="EXIM Bank Login" />
            <TabButton active={tab === "exporter"} onClick={() => switchTab("exporter")} icon={Ship} label="Exporter Login" />
          </div>

          <Card className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground">
              {tab === "exim" ? "EXIM Bank — Admin Console" : "Exporter Portal"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {tab === "exim"
                ? "Manage buyer ratings, exporters, users and permissions."
                : "View international buyer profiles and unlock credit ratings via QR."}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error ? (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  <AlertCircle className="size-4 shrink-0" />
                  {error}
                </div>
              ) : null}

              <Button type="submit" className="mt-1 w-full">
                {tab === "exim" ? "Login to Admin Console" : "Login to Exporter Portal"}
              </Button>
            </form>

            <div className="mt-6 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Demo credentials</p>
              <p className="mt-1">
                EXIM: <span className="font-mono">admin@exim.gov / admin123</span>
              </p>
              <p>
                Exporter: <span className="font-mono">exporter@crescent.pk / exporter123</span>
              </p>
            </div>
          </Card>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Authorized users only. All data in this demo is stored locally in your browser.
          </p>
        </section>
      </div>
    </main>
  )
}

function Feature({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof QrCode
  title: string
  desc: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
        <Icon className="size-4.5" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs leading-relaxed text-white/70">{desc}</p>
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: typeof Landmark
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
        active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  )
}
