"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/modal"
import { RealQR } from "@/components/real-qr"
import { PublicShell } from "@/components/public/public-shell"
import { loadPublishedBuyers, type BuyerRecord } from "@/lib/store"
import { Globe, Lock, QrCode, Search, Smartphone } from "lucide-react"

function publicProfileUrl(id: string): string {
  if (typeof window === "undefined") return `/p/${id}`
  return `${window.location.origin}/p/${id}`
}

export function CompaniesPage() {
  const [buyers, setBuyers] = useState<BuyerRecord[]>([])
  const [query, setQuery] = useState("")
  const [active, setActive] = useState<BuyerRecord | null>(null)

  useEffect(() => {
    setBuyers(loadPublishedBuyers())
  }, [])

  const filtered = buyers.filter((b) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      b.fields.legalName?.toLowerCase().includes(q) ||
      b.fields.country?.toLowerCase().includes(q) ||
      b.fields.industry?.toLowerCase().includes(q)
    )
  })

  return (
    <PublicShell>
      <section className="relative overflow-hidden border-b border-border bg-[oklch(0.2_0.07_255)] text-white">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "26px 26px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 -top-32 size-80 rounded-full bg-[oklch(0.55_0.15_200)]/25 blur-3xl"
        />
        <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/55">
            Public Directory
          </p>
          <h1 className="mt-3 text-balance text-3xl font-bold leading-tight sm:text-4xl">
            International Buyer Directory
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-white/70 sm:text-base">
            Browse companies rated under the Pak-EXIM Credit Rating Service. Open a company to
            generate its profile QR — exporters can scan it on a phone and unlock the credit rating
            with an access code issued by EXIM Bank.
          </p>

          <div className="relative mt-7 max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/50" />
            <Input
              placeholder="Search by company, country or industry…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-11 border-white/20 bg-white/10 pl-10 text-white placeholder:text-white/45 focus-visible:border-white/40 focus-visible:ring-0"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filtered.length} of {buyers.length} companies
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => (
            <button
              key={b.id}
              onClick={() => setActive(b)}
              className="text-left transition-transform hover:-translate-y-0.5"
            >
              <Card className="flex h-full flex-col p-5 transition-shadow hover:shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Globe className="size-5" />
                  </div>
                  <Badge variant="outline" className="gap-1 border-amber-200 bg-amber-50 text-amber-700">
                    <Lock className="size-3" />
                    Rating locked
                  </Badge>
                </div>
                <h3 className="mt-4 text-base font-semibold leading-snug text-foreground">
                  {b.fields.legalName}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{b.fields.country}</p>
                {b.fields.industry ? (
                  <p className="mt-2 text-xs text-muted-foreground">{b.fields.industry}</p>
                ) : null}
                <div className="mt-5 flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
                  <QrCode className="size-3.5" />
                  Tap to view scannable QR
                </div>
              </Card>
            </button>
          ))}
          {filtered.length === 0 ? (
            <Card className="col-span-full p-10 text-center text-sm text-muted-foreground">
              No companies match that search.
            </Card>
          ) : null}
        </div>
      </section>

      <Modal open={!!active} onClose={() => setActive(null)}>
        {active ? (
          <div className="flex flex-col items-center p-8 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {active.fields.country}
            </p>
            <h2 className="mt-1 text-lg font-bold text-foreground">{active.fields.legalName}</h2>
            {active.fields.industry ? (
              <p className="mt-0.5 text-sm text-muted-foreground">{active.fields.industry}</p>
            ) : null}

            <div className="mt-6">
              <RealQR value={publicProfileUrl(active.id)} size={240} />
            </div>

            <div className="mt-5 flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
              <Smartphone className="size-3.5" />
              Scan with your phone camera
            </div>

            <p className="mt-4 max-w-xs text-xs leading-relaxed text-muted-foreground">
              Scanning opens the buyer profile page. An access code issued by EXIM Bank is required to
              unlock the credit rating.
            </p>

            <div className="mt-5 w-full break-all rounded-lg border border-border bg-muted/30 px-3 py-2 text-[11px] font-mono text-muted-foreground">
              {publicProfileUrl(active.id)}
            </div>
          </div>
        ) : null}
      </Modal>
    </PublicShell>
  )
}
