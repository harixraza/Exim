"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/modal"
import { RealQR } from "@/components/real-qr"
import { BuyerProfile } from "@/components/buyer-profile"
import {
  addScan,
  clearSession,
  findTemplate,
  getSession,
  loadPublishedBuyers,
  ratingOf,
  verifyAccessCode,
  type BuyerRecord,
  type Session,
} from "@/lib/store"
import {
  Globe,
  Lock,
  LogOut,
  QrCode,
  ScanLine,
  ShieldCheck,
  KeyRound,
  AlertCircle,
} from "lucide-react"

type Step = "qr" | "code" | "profile"

function publicProfileUrl(id: string): string {
  if (typeof window === "undefined") return `/p/${id}`
  return `${window.location.origin}/p/${id}`
}

export function ExporterApp() {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)
  const [buyers, setBuyers] = useState<BuyerRecord[]>([])

  const [active, setActive] = useState<BuyerRecord | null>(null)
  const [step, setStep] = useState<Step>("qr")
  const [code, setCode] = useState("")
  const [codeError, setCodeError] = useState(false)

  useEffect(() => {
    const s = getSession()
    if (!s || s.type !== "exporter") {
      router.replace("/")
      return
    }
    setSession(s)
    setBuyers(loadPublishedBuyers())
    setReady(true)
  }, [router])

  if (!ready || !session) {
    return (
      <div className="flex h-svh items-center justify-center bg-secondary text-sm text-muted-foreground">
        Loading portal…
      </div>
    )
  }

  function openBuyer(b: BuyerRecord) {
    setActive(b)
    setStep("qr")
    setCode("")
    setCodeError(false)
  }

  function close() {
    setActive(null)
  }

  function handleUnlock(e: React.FormEvent) {
    e.preventDefault()
    if (!active || !session) return
    const ok = verifyAccessCode(code, active.accessCode)
    addScan({
      buyerId: active.id,
      buyerName: active.fields.legalName,
      country: active.fields.country,
      rating: ratingOf(active),
      exporterName: session.name,
      exporterEmail: session.email,
      result: ok ? "unlocked" : "failed",
    })
    if (ok) {
      setStep("profile")
      setCodeError(false)
    } else {
      setCodeError(true)
    }
  }

  function handleLogout() {
    clearSession()
    router.replace("/")
  }

  return (
    <main className="min-h-svh bg-secondary">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white px-2.5 py-1.5 shadow-sm ring-1 ring-border">
              <img src="/images/exim-logo.png" alt="EXIM — Export-Import Bank of Pakistan" className="h-7 w-auto" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-foreground">Exporter Portal</p>
              <p className="text-xs text-muted-foreground">Credit Ratings Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-foreground">{session.name}</p>
              <p className="text-xs text-muted-foreground">{session.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="size-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl bg-[oklch(0.25_0.07_255)] p-7 text-white shadow-lg">
          <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-[oklch(0.55_0.12_200)]/25 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/60">Welcome back</p>
              <h1 className="mt-1 text-2xl font-bold">{session.name}</h1>
              <p className="mt-1 text-sm text-white/75">
                {`${buyers.length} international buyer profiles available.`} Scan a buyer&apos;s QR code and enter the
                access code issued by EXIM Bank to unlock their credit rating.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm">
              <ScanLine className="size-5" />
              QR-secured profiles
            </div>
          </div>
        </section>

        {/* Buyer grid */}
        <h2 className="mt-8 text-base font-semibold text-foreground">International Buyer Profiles</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ratings are locked. Unlock with the buyer&apos;s QR code and access code.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {buyers.map((b) => (
            <Card key={b.id} className="group flex flex-col gap-4 p-5 transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Globe className="size-5" />
                </div>
                <Badge variant="outline" className="gap-1 border-amber-200 bg-amber-50 text-amber-700">
                  <Lock className="size-3" />
                  Locked
                </Badge>
              </div>
              <div>
                <h3 className="font-semibold leading-snug text-foreground">{b.fields.legalName}</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">{b.fields.country}</p>
                {b.fields.industry ? (
                  <p className="mt-1 text-xs text-muted-foreground">{b.fields.industry}</p>
                ) : null}
              </div>
              <Button variant="outline" className="mt-auto w-full" onClick={() => openBuyer(b)}>
                <QrCode className="size-4" />
                View QR & Unlock
              </Button>
            </Card>
          ))}
        </div>

        {buyers.length === 0 ? (
          <Card className="mt-4 p-10 text-center text-sm text-muted-foreground">
            No buyer profiles published yet. Please check back later.
          </Card>
        ) : null}
      </div>

      {/* QR / unlock / profile modal */}
      <Modal open={!!active} onClose={close} wide={step === "profile"}>
        {active ? (
          step === "qr" ? (
            <div className="flex flex-col items-center p-8 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Buyer Credit Profile
              </p>
              <h2 className="mt-1 text-lg font-bold text-foreground">{active.fields.legalName}</h2>
              <p className="text-sm text-muted-foreground">{active.fields.country}</p>

              <div className="relative mt-6">
                <RealQR value={publicProfileUrl(active.id)} size={230} />
                <div className="pointer-events-none absolute inset-x-0 top-1/2 h-0.5 animate-pulse bg-emerald-400/70" />
              </div>

              <p className="mt-4 max-w-xs text-xs leading-relaxed text-muted-foreground">
                This QR code carries the buyer&apos;s secure profile token. Scan it with the EXIM Verify app — or
                simulate the scan below.
              </p>

              <Button className="mt-5 w-full" onClick={() => setStep("code")}>
                <ScanLine className="size-4" />
                Scan QR Code
              </Button>
            </div>
          ) : step === "code" ? (
            <div className="overflow-hidden">
              <div className="bg-[oklch(0.25_0.07_255)] px-8 pb-10 pt-8 text-center text-white">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/25">
                  <ShieldCheck className="size-7" />
                </div>
                <h2 className="mt-4 text-lg font-bold">QR Scanned Successfully</h2>
                <p className="mx-auto mt-1 max-w-xs text-sm text-white/70">
                  Enter the access code issued by EXIM Bank to unlock{" "}
                  <span className="font-semibold text-white">{active.fields.legalName}</span>.
                </p>
              </div>

              <form onSubmit={handleUnlock} className="-mt-5 px-8 pb-8">
                <div className="rounded-2xl border border-border bg-card p-5 shadow-lg">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <KeyRound className="size-3.5" />
                    Access Code
                  </div>
                  <Input
                    autoFocus
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value)
                      setCodeError(false)
                    }}
                    placeholder="EXIM-0000"
                    className="mt-2 h-12 text-center font-mono text-lg tracking-[0.3em]"
                  />
                  {codeError ? (
                    <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                      <AlertCircle className="size-4 shrink-0" />
                      Incorrect access code. Please verify with EXIM Bank and try again.
                    </div>
                  ) : null}
                  <Button type="submit" className="mt-4 w-full">
                    Unlock Profile
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <BuyerProfile buyer={active} template={findTemplate(active.fields.template)} />
              <div className="flex justify-end border-t border-border px-6 pb-6 pt-4">
                <Button onClick={close}>Scan Another</Button>
              </div>
            </div>
          )
        ) : null}
      </Modal>
    </main>
  )
}
