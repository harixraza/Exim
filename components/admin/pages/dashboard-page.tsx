"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/admin/stat-card"
import { RatingBadge } from "@/components/rating-badge"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  loadBuyers,
  loadExporters,
  loadScans,
  loadUsers,
  ratingOf,
  type BuyerRecord,
  type ExporterRecord,
  type ScanRecord,
} from "@/lib/store"
import {
  Globe,
  Ship,
  ScanLine,
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  FileEdit,
  CheckCircle2,
} from "lucide-react"

const scansConfig: ChartConfig = {
  scans: { label: "Scans", color: "var(--chart-1)" },
}

function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${Math.max(mins, 1)}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function DashboardPage() {
  const [buyers, setBuyers] = useState<BuyerRecord[]>([])
  const [exporters, setExporters] = useState<ExporterRecord[]>([])
  const [scans, setScans] = useState<ScanRecord[]>([])
  const [userCount, setUserCount] = useState(0)

  useEffect(() => {
    setBuyers(loadBuyers())
    setExporters(loadExporters())
    setScans(loadScans())
    setUserCount(loadUsers().length)
  }, [])

  const metrics = useMemo(() => {
    const now = Date.now()
    const day = 24 * 3600_000
    const weekAgo = now - 7 * day
    const twoWeeksAgo = now - 14 * day
    const monthAgo = now - 30 * day

    const scansThisWeek = scans.filter((s) => new Date(s.time).getTime() >= weekAgo).length
    const scansPrevWeek = scans.filter(
      (s) => new Date(s.time).getTime() >= twoWeeksAgo && new Date(s.time).getTime() < weekAgo,
    ).length
    const weekDelta = scansPrevWeek ? Math.round(((scansThisWeek - scansPrevWeek) / scansPrevWeek) * 100) : 0

    const unlocked = scans.filter((s) => s.result === "unlocked").length
    const successRate = scans.length ? Math.round((unlocked / scans.length) * 100) : 0

    const expiring = buyers.filter((b) => {
      const d = b.fields.validUntil
      if (!d) return false
      const t = new Date(d).getTime()
      return t > now && t - now < 30 * day
    }).length

    const drafts = buyers.filter((b) => b.status === "draft").length + exporters.filter((e) => e.status === "draft").length

    const activeExporters = new Set(scans.filter((s) => new Date(s.time).getTime() >= weekAgo).map((s) => s.exporterEmail)).size

    return { scansThisWeek, weekDelta, successRate, expiring, drafts, activeExporters, unlocked, monthAgo, weekAgo }
  }, [buyers, exporters, scans])

  const countries = new Set(buyers.map((b) => b.fields.country).filter(Boolean)).size
  const recentBuyers = [...buyers].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5)
  const recentScans = scans.slice(0, 6)

  const days: { label: string; scans: number }[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 3600_000)
    const key = d.toISOString().slice(0, 10)
    days.push({
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      scans: scans.filter((s) => s.time.slice(0, 10) === key).length,
    })
  }

  // Top countries by buyer count
  const byCountry = new Map<string, { count: number; ratings: string[] }>()
  for (const b of buyers) {
    const entry = byCountry.get(b.fields.country) ?? { count: 0, ratings: [] }
    entry.count++
    entry.ratings.push(ratingOf(b))
    byCountry.set(b.fields.country, entry)
  }
  const topCountries = [...byCountry.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 5)

  // Top exporters by scans
  const byExporter = new Map<string, { name: string; company?: string; scans: number }>()
  for (const s of scans) {
    const e = byExporter.get(s.exporterEmail) ?? { name: s.exporterName, company: s.company, scans: 0 }
    e.scans++
    byExporter.set(s.exporterEmail, e)
  }
  const topExporters = [...byExporter.entries()].sort((a, b) => b[1].scans - a[1].scans).slice(0, 5)

  return (
    <div className="flex flex-col gap-6">
      {/* Primary stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="International Buyers" value={buyers.length} icon={Globe} hint={`Across ${countries} ${countries === 1 ? "country" : "countries"}`} />
        <StatCard label="Exporters" value={exporters.length} icon={Ship} hint={`${metrics.activeExporters} active this week`} />
        <StatCard label="QR Scans" value={scans.length} icon={ScanLine} hint={`${metrics.scansThisWeek} in the last 7 days`} />
        <StatCard label="Portal Users" value={userCount} icon={Users} hint="Staff & exporter accounts" />
      </div>

      {/* Secondary KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Week-over-Week</p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {metrics.weekDelta >= 0 ? "+" : ""}
                {metrics.weekDelta}%
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{metrics.scansThisWeek} vs prior 7d</p>
            </div>
            <div className={"flex size-10 items-center justify-center rounded-lg " + (metrics.weekDelta >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>
              {metrics.weekDelta >= 0 ? <TrendingUp className="size-5" /> : <TrendingDown className="size-5" />}
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Unlock Success Rate</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{metrics.successRate}%</p>
              <p className="mt-1 text-xs text-muted-foreground">{metrics.unlocked} of {scans.length} attempts</p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <CheckCircle2 className="size-5" />
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Expiring Soon</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{metrics.expiring}</p>
              <p className="mt-1 text-xs text-muted-foreground">Ratings within 30 days</p>
            </div>
            <div className={"flex size-10 items-center justify-center rounded-lg " + (metrics.expiring > 0 ? "bg-amber-50 text-amber-700" : "bg-accent text-accent-foreground")}>
              <Clock className="size-5" />
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Drafts</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{metrics.drafts}</p>
              <p className="mt-1 text-xs text-muted-foreground">Awaiting publish</p>
            </div>
            <div className={"flex size-10 items-center justify-center rounded-lg " + (metrics.drafts > 0 ? "bg-amber-50 text-amber-700" : "bg-accent text-accent-foreground")}>
              {metrics.drafts > 0 ? <FileEdit className="size-5" /> : <AlertTriangle className="size-5" />}
            </div>
          </div>
        </Card>
      </div>

      {/* Activity chart + rating distribution */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-base font-semibold text-foreground">Scan Activity</h2>
          <p className="mt-1 text-sm text-muted-foreground">QR scans per day — last 14 days</p>
          <ChartContainer config={scansConfig} className="mt-4 h-56 w-full">
            <AreaChart data={days} accessibilityLayer margin={{ left: 0, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval={2} />
              <YAxis tickLine={false} axisLine={false} width={28} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                dataKey="scans"
                type="monotone"
                fill="var(--color-scans)"
                fillOpacity={0.15}
                stroke="var(--color-scans)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground">Rating Distribution</h2>
          <p className="mt-1 text-sm text-muted-foreground">Buyers by rating</p>
          <div className="mt-5 flex flex-col gap-3">
            {(["A", "B", "C", "D"] as const).map((r) => {
              const count = buyers.filter((b) => ratingOf(b) === r).length
              const pct = buyers.length ? Math.round((count / buyers.length) * 100) : 0
              return (
                <div key={r} className="flex items-center gap-3">
                  <RatingBadge rating={r} />
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-10 text-right text-xs text-muted-foreground">{count}</span>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Top countries + Top exporters */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground">Top Buyer Countries</h2>
          <p className="mt-1 text-sm text-muted-foreground">Where rated buyers are located</p>
          <ul className="mt-4 flex flex-col">
            {topCountries.map(([country, info], i) => {
              const max = topCountries[0][1].count
              const pct = Math.round((info.count / max) * 100)
              return (
                <li key={country} className={`py-3 ${i !== topCountries.length - 1 ? "border-b border-border" : ""}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">{country}</p>
                    <Badge variant="secondary">{info.count}</Badge>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              )
            })}
            {topCountries.length === 0 ? (
              <li className="py-6 text-center text-sm text-muted-foreground">No buyers yet.</li>
            ) : null}
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground">Top Exporters by Scans</h2>
          <p className="mt-1 text-sm text-muted-foreground">Most active exporter accounts</p>
          <ul className="mt-4 flex flex-col">
            {topExporters.map(([email, e], i) => (
              <li
                key={email}
                className={`flex items-center justify-between gap-3 py-3 ${i !== topExporters.length - 1 ? "border-b border-border" : ""}`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{e.name}</p>
                  <p className="text-xs text-muted-foreground">{e.company ?? email}</p>
                </div>
                <Badge variant="secondary">{e.scans} scans</Badge>
              </li>
            ))}
            {topExporters.length === 0 ? (
              <li className="py-6 text-center text-sm text-muted-foreground">No scans yet.</li>
            ) : null}
          </ul>
        </Card>
      </div>

      {/* Recent international buyers + Recent scans by exporters */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground">International Buyers</h2>
          <p className="mt-1 text-sm text-muted-foreground">Recently registered</p>
          <ul className="mt-4 flex flex-col">
            {recentBuyers.map((b, i) => (
              <li
                key={b.id}
                className={`flex items-center justify-between gap-4 py-3 ${i !== recentBuyers.length - 1 ? "border-b border-border" : ""}`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{b.fields.legalName}</p>
                  <p className="text-xs text-muted-foreground">
                    {b.fields.country}
                    {b.status === "draft" ? " · Draft" : ""}
                  </p>
                </div>
                <RatingBadge rating={ratingOf(b)} />
              </li>
            ))}
            {recentBuyers.length === 0 ? (
              <li className="py-6 text-center text-sm text-muted-foreground">No buyers yet.</li>
            ) : null}
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground">Recent Scans by Exporters</h2>
          <p className="mt-1 text-sm text-muted-foreground">Latest QR unlock activity</p>
          <ul className="mt-4 flex flex-col">
            {recentScans.map((s, i) => (
              <li
                key={s.id}
                className={`flex items-center justify-between gap-4 py-3 ${i !== recentScans.length - 1 ? "border-b border-border" : ""}`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {s.exporterName} → {s.buyerName}
                  </p>
                  <p className="text-xs text-muted-foreground">{relTime(s.time)}</p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    s.result === "unlocked"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }
                >
                  {s.result === "unlocked" ? "Unlocked" : "Failed"}
                </Badge>
              </li>
            ))}
            {recentScans.length === 0 ? (
              <li className="py-6 text-center text-sm text-muted-foreground">No scans yet.</li>
            ) : null}
          </ul>
        </Card>
      </div>
    </div>
  )
}
