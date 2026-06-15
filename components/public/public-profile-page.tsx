"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { BuyerProfile } from "@/components/buyer-profile"
import { PublicShell } from "@/components/public/public-shell"
import {
  addScan,
  findTemplate,
  loadPublishedBuyers,
  ratingOf,
  verifyAccessCode,
  type BuyerRecord,
} from "@/lib/store"
import {
  AlertCircle,
  ArrowLeft,
  KeyRound,
  Lock,
  Search,
  ShieldCheck,
} from "lucide-react"

export function PublicProfilePage({ id }: { id: string }) {
  const [ready, setReady] = useState(false)
  const [buyer, setBuyer] = useState<BuyerRecord | null>(null)
  const [unlocked, setUnlocked] = useState(false)
  const [code, setCode] = useState("")
  const [error, setError] = useState(false)

  useEffect(() => {
    const all = loadPublishedBuyers()
    setBuyer(all.find((b) => b.id === id) ?? null)
    setReady(true)
  }, [id])

  function handleUnlock(e: React.FormEvent) {
    e.preventDefault()
    if (!buyer) return
    const ok = verifyAccessCode(code, buyer.accessCode)
    addScan({
      buyerId: buyer.id,
      buyerName: buyer.fields.legalName,
      country: buyer.fields.country,
      rating: ratingOf(buyer),
      exporterName: "Public scan",
      exporterEmail: "public@scan",
      result: ok ? "unlocked" : "failed",
    })
    if (ok) {
      setUnlocked(true)
      setError(false)
    } else {
      setError(true)
    }
  }

  if (!ready) {
    return (
      <PublicShell>
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
          Loading…
        </div>
      </PublicShell>
    )
  }

  if (!buyer) {
    return (
      <PublicShell>
        <div className="mx-auto max-w-md px-6 py-16">
          <Card className="p-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-50">
              <Search className="size-6 text-amber-600" />
            </div>
            <h1 className="mt-4 text-lg font-semibold text-foreground">Profile not found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              No published buyer matches this QR code. The buyer may have been removed, or this QR was
              generated on a different device in the local-only demo.
            </p>
            <Link
              href="/companies"
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              <ArrowLeft className="size-4" />
              Browse companies
            </Link>
          </Card>
        </div>
      </PublicShell>
    )
  }

  if (unlocked) {
    return (
      <PublicShell>
        <div className="mx-auto max-w-3xl px-6 py-10">
          <Link
            href="/companies"
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Back to directory
          </Link>
          <Card className="overflow-hidden p-0">
            <BuyerProfile buyer={buyer} template={findTemplate(buyer.fields.template)} />
          </Card>
        </div>
      </PublicShell>
    )
  }

  return (
    <PublicShell>
      <div className="mx-auto max-w-md px-6 py-12">
        <Link
          href="/companies"
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to directory
        </Link>

        <Card className="overflow-hidden p-0">
          <div className="bg-[oklch(0.2_0.07_255)] px-6 pb-10 pt-8 text-center text-white">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/25">
              <ShieldCheck className="size-7" />
            </div>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.3em] text-white/55">
              Buyer Profile
            </p>
            <h1 className="mt-2 text-xl font-bold">{buyer.fields.legalName}</h1>
            <p className="mt-0.5 text-sm text-white/70">{buyer.fields.country}</p>
          </div>

          <form onSubmit={handleUnlock} className="-mt-5 px-6 pb-7">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-lg">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <KeyRound className="size-3.5" />
                Enter Access Code
              </div>
              <Input
                autoFocus
                value={code}
                onChange={(e) => {
                  setCode(e.target.value)
                  setError(false)
                }}
                placeholder="EXIM-0000"
                className="mt-2 h-12 text-center font-mono text-lg tracking-[0.3em]"
              />
              {error ? (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  <AlertCircle className="size-4 shrink-0" />
                  Incorrect access code. Please verify with EXIM Bank and try again.
                </div>
              ) : null}
              <Button type="submit" className="mt-4 w-full">
                Unlock Credit Profile
              </Button>
            </div>
          </form>

          <div className="border-t border-border bg-muted/30 px-6 py-4">
            <div className="flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
              <Lock className="mt-0.5 size-3.5 shrink-0" />
              Access codes are issued by EXIM Bank to authorized exporters. If you do not have one,
              please contact the EXIM Credit Risk department.
            </div>
          </div>
        </Card>
      </div>
    </PublicShell>
  )
}
