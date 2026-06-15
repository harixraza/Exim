"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/admin/stat-card"
import { RatingBadge } from "@/components/rating-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
} from "recharts"
import {
  loadBuyers,
  loadExporters,
  loadScans,
  loadTemplates,
  ratingOf,
  type BuyerRecord,
  type ExporterRecord,
  type ScanRecord,
  type TemplateDef,
} from "@/lib/store"
import type { Rating } from "@/lib/crp-data"
import {
  ScanLine,
  Users,
  CheckCircle2,
  Globe,
  TrendingUp,
  TrendingDown,
  Briefcase,
  Award,
  AlertTriangle,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"

const scansConfig: ChartConfig = { scans: { label: "Scans", color: "var(--chart-1)" } }
const buyerConfig: ChartConfig = { scans: { label: "Scans", color: "var(--chart-2)" } }
const countryConfig: ChartConfig = { scans: { label: "Scans", color: "var(--chart-5)" } }
const sectorConfig: ChartConfig = { count: { label: "Exporters", color: "var(--chart-3)" } }

const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]
const RATING_COLORS: Record<Rating, string> = {
  A: "oklch(0.65 0.17 145)",
  B: "oklch(0.55 0.12 235)",
  C: "oklch(0.75 0.16 80)",
  D: "oklch(0.58 0.22 25)",
}

function dayKey(iso: string) {
  return iso.slice(0, 10)
}

function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${Math.max(mins, 1)}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function IntelligencePage() {
  const [scans, setScans] = useState<ScanRecord[]>([])
  const [buyers, setBuyers] = useState<BuyerRecord[]>([])
  const [exporters, setExporters] = useState<ExporterRecord[]>([])
  const [templates, setTemplates] = useState<TemplateDef[]>([])

  useEffect(() => {
    setScans(loadScans())
    setBuyers(loadBuyers())
    setExporters(loadExporters())
    setTemplates(loadTemplates())
  }, [])

  const analytics = useMemo(() => {
    const now = Date.now()
    const day = 24 * 3600_000
    const weekAgo = now - 7 * day
    const twoWeeksAgo = now - 14 * day

    const unlocked = scans.filter((s) => s.result === "unlocked")
    const failed = scans.filter((s) => s.result === "failed")
    const scansThisWeek = scans.filter((s) => new Date(s.time).getTime() >= weekAgo).length
    const scansPrevWeek = scans.filter(
      (s) => new Date(s.time).getTime() >= twoWeeksAgo && new Date(s.time).getTime() < weekAgo,
    ).length
    const weekDelta = scansPrevWeek ? Math.round(((scansThisWeek - scansPrevWeek) / scansPrevWeek) * 100) : 0
    const successRate = scans.length ? Math.round((unlocked.length / scans.length) * 100) : 0
    const activeExporters = new Set(scans.map((s) => s.exporterEmail)).size
    const expiring = buyers.filter((b) => {
      const d = b.fields.validUntil
      if (!d) return false
      const t = new Date(d).getTime()
      return t > now && t - now < 30 * day
    }).length
    const expired = buyers.filter((b) => {
      const d = b.fields.validUntil
      if (!d) return false
      return new Date(d).getTime() < now
    }).length

    // 30-day scans-per-day
    const days: { label: string; scans: number; unlocked: number; failed: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * day)
      const key = dayKey(d.toISOString())
      const dayScans = scans.filter((s) => dayKey(s.time) === key)
      days.push({
        label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        scans: dayScans.length,
        unlocked: dayScans.filter((s) => s.result === "unlocked").length,
        failed: dayScans.filter((s) => s.result === "failed").length,
      })
    }

    // hour-of-day heatmap (24 buckets)
    const hourly: { hour: number; scans: number }[] = Array.from({ length: 24 }, (_, h) => ({ hour: h, scans: 0 }))
    for (const s of scans) hourly[new Date(s.time).getHours()].scans++

    // by buyer
    const byBuyer = new Map<string, { name: string; country: string; rating: string; scans: number; unlocked: number; lastScan: string }>()
    for (const s of scans) {
      const e = byBuyer.get(s.buyerId) ?? { name: s.buyerName, country: s.country, rating: s.rating, scans: 0, unlocked: 0, lastScan: s.time }
      e.scans++
      if (s.result === "unlocked") e.unlocked++
      if (s.time > e.lastScan) e.lastScan = s.time
      byBuyer.set(s.buyerId, e)
    }
    const topBuyers = [...byBuyer.entries()].sort((a, b) => b[1].scans - a[1].scans).slice(0, 8)
    const topBuyersChart = topBuyers.slice(0, 5).map(([, e]) => ({
      name: e.name.length > 16 ? `${e.name.slice(0, 15)}…` : e.name,
      scans: e.scans,
    }))

    // by country
    const byCountry = new Map<string, number>()
    for (const s of scans) byCountry.set(s.country, (byCountry.get(s.country) ?? 0) + 1)
    const countries = [...byCountry.entries()].sort((a, b) => b[1] - a[1])
    const topCountries = countries.slice(0, 7).map(([name, count]) => ({
      name: name.length > 10 ? `${name.slice(0, 9)}…` : name,
      scans: count,
    }))

    // by exporter
    const byExporter = new Map<string, { name: string; company?: string; scans: number; unlocked: number; failed: number; lastScan: string }>()
    for (const s of scans) {
      const e = byExporter.get(s.exporterEmail) ?? {
        name: s.exporterName,
        company: s.company,
        scans: 0,
        unlocked: 0,
        failed: 0,
        lastScan: s.time,
      }
      e.scans++
      if (s.result === "unlocked") e.unlocked++
      else e.failed++
      if (s.time > e.lastScan) e.lastScan = s.time
      byExporter.set(s.exporterEmail, e)
    }
    const topExporters = [...byExporter.entries()].sort((a, b) => b[1].scans - a[1].scans).slice(0, 8)

    // rating distribution as pie
    const ratingPie = (["A", "B", "C", "D"] as const).map((r) => ({
      name: r,
      value: buyers.filter((b) => ratingOf(b) === r).length,
      fill: RATING_COLORS[r],
    }))

    // sector breakdown (exporters)
    const bySector = new Map<string, number>()
    for (const ex of exporters) {
      const s = ex.fields.sector ?? "Unknown"
      bySector.set(s, (bySector.get(s) ?? 0) + 1)
    }
    const sectors = [...bySector.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }))

    // template usage
    const byTemplate = new Map<string, number>()
    for (const t of templates) byTemplate.set(t.name, 0)
    for (const b of buyers) {
      const t = b.fields.template
      if (t) byTemplate.set(t, (byTemplate.get(t) ?? 0) + 1)
    }
    const templateUsage = [...byTemplate.entries()].map(([name, count]) => ({ name, count }))

    return {
      unlocked,
      failed,
      scansThisWeek,
      weekDelta,
      successRate,
      activeExporters,
      expiring,
      expired,
      days,
      hourly,
      topBuyers,
      topBuyersChart,
      topCountries,
      topExporters,
      ratingPie,
      sectors,
      templateUsage,
    }
  }, [scans, buyers, exporters, templates])

  const maxHourly = Math.max(1, ...analytics.hourly.map((h) => h.scans))

  return (
    <div className="flex flex-col gap-6">
      {/* Primary stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total QR Scans" value={scans.length} icon={ScanLine} hint={`${analytics.scansThisWeek} in the last 7 days`} />
        <StatCard label="Profiles Unlocked" value={analytics.unlocked.length} icon={CheckCircle2} hint={`${analytics.successRate}% success rate`} />
        <StatCard label="Active Exporters" value={analytics.activeExporters} icon={Users} hint={`of ${exporters.length} registered`} />
        <StatCard label="Avg Scans / Buyer" value={buyers.length ? (scans.length / buyers.length).toFixed(1) : "0"} icon={Globe} hint={`${buyers.length} rated buyers`} />
      </div>

      {/* Secondary KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Week-over-Week</p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {analytics.weekDelta >= 0 ? "+" : ""}{analytics.weekDelta}%
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Scan volume vs prior 7d</p>
            </div>
            <div className={"flex size-10 items-center justify-center rounded-lg " + (analytics.weekDelta >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>
              {analytics.weekDelta >= 0 ? <TrendingUp className="size-5" /> : <TrendingDown className="size-5" />}
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Failed Unlocks</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{analytics.failed.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">{scans.length ? Math.round((analytics.failed.length / scans.length) * 100) : 0}% of attempts</p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-red-50 text-red-700">
              <AlertTriangle className="size-5" />
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Expiring in 30d</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{analytics.expiring}</p>
              <p className="mt-1 text-xs text-muted-foreground">{analytics.expired} already expired</p>
            </div>
            <div className={"flex size-10 items-center justify-center rounded-lg " + (analytics.expiring > 0 ? "bg-amber-50 text-amber-700" : "bg-accent text-accent-foreground")}>
              <Clock className="size-5" />
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Sectors Covered</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{analytics.sectors.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">{exporters.length} exporters total</p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Briefcase className="size-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Scan trend (30-day) */}
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-foreground">Scan Trend — Last 30 Days</h2>
            <p className="mt-1 text-sm text-muted-foreground">Daily QR scan volume, unlocked vs failed</p>
          </div>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-500" /> Unlocked</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-red-500" /> Failed</span>
          </div>
        </div>
        <ChartContainer config={scansConfig} className="mt-4 h-72 w-full">
          <AreaChart data={analytics.days} accessibilityLayer margin={{ left: 0, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval={4} />
            <YAxis tickLine={false} axisLine={false} width={28} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area dataKey="unlocked" stackId="1" type="monotone" fill="oklch(0.65 0.17 145)" fillOpacity={0.25} stroke="oklch(0.55 0.16 145)" strokeWidth={2} />
            <Area dataKey="failed" stackId="1" type="monotone" fill="oklch(0.58 0.22 25)" fillOpacity={0.25} stroke="oklch(0.5 0.21 25)" strokeWidth={2} />
          </AreaChart>
        </ChartContainer>
      </Card>

      {/* Most scanned buyers + rating pie */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-base font-semibold text-foreground">Most Scanned Buyers</h2>
          <p className="mt-1 text-sm text-muted-foreground">Top buyer profiles by scan volume</p>
          <ChartContainer config={buyerConfig} className="mt-4 h-64 w-full">
            <BarChart data={analytics.topBuyersChart} layout="vertical" accessibilityLayer margin={{ left: 8, right: 12 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={130} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="scans" fill="var(--color-scans)" radius={4} />
            </BarChart>
          </ChartContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground">Rating Mix</h2>
          <p className="mt-1 text-sm text-muted-foreground">Buyer rating distribution</p>
          <ChartContainer config={{ value: { label: "Buyers" } }} className="mt-2 h-64 w-full">
            <PieChart accessibilityLayer>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie data={analytics.ratingPie} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                {analytics.ratingPie.map((d, i) => (
                  <Cell key={i} fill={d.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {analytics.ratingPie.map((r) => (
              <div key={r.name} className="flex items-center justify-between rounded-md bg-muted/40 px-2 py-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ background: r.fill }} />
                  {r.name}
                </span>
                <span className="font-semibold text-foreground">{r.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Countries bar + Hour heatmap */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground">Scans by Buyer Country</h2>
          <p className="mt-1 text-sm text-muted-foreground">Geographic distribution of scans</p>
          <ChartContainer config={countryConfig} className="mt-4 h-64 w-full">
            <BarChart data={analytics.topCountries} accessibilityLayer margin={{ left: 0, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} width={28} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="scans" fill="var(--color-scans)" radius={6} />
            </BarChart>
          </ChartContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground">Hour-of-Day Heatmap</h2>
          <p className="mt-1 text-sm text-muted-foreground">When exporters are most active</p>
          <div className="mt-5 grid grid-cols-12 gap-1.5">
            {analytics.hourly.map((h) => {
              const intensity = h.scans / maxHourly
              return (
                <div key={h.hour} className="flex flex-col items-center gap-1">
                  <div
                    className="aspect-square w-full rounded-sm transition-all"
                    title={`${h.hour}:00 — ${h.scans} scans`}
                    style={{
                      background:
                        intensity === 0
                          ? "oklch(0.95 0.005 240)"
                          : `oklch(${0.95 - intensity * 0.55} ${0.04 + intensity * 0.08} 255)`,
                    }}
                  />
                  <span className="text-[9px] text-muted-foreground">{h.hour}</span>
                </div>
              )
            })}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              {[0.1, 0.3, 0.5, 0.7, 0.95].map((v) => (
                <span
                  key={v}
                  className="size-3 rounded-sm"
                  style={{ background: `oklch(${0.95 - v * 0.55} ${0.04 + v * 0.08} 255)` }}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </Card>
      </div>

      {/* Sector breakdown + Template usage */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground">Exporters by Sector</h2>
          <p className="mt-1 text-sm text-muted-foreground">Pakistani exporter sector mix</p>
          <ChartContainer config={sectorConfig} className="mt-4 h-64 w-full">
            <BarChart data={analytics.sectors} layout="vertical" accessibilityLayer margin={{ left: 8, right: 12 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={130} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={4} />
            </BarChart>
          </ChartContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground">Template Usage</h2>
          <p className="mt-1 text-sm text-muted-foreground">How buyer profiles are styled</p>
          <ChartContainer config={{ count: { label: "Buyers" } }} className="mt-2 h-64 w-full">
            <PieChart accessibilityLayer>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie data={analytics.templateUsage} dataKey="count" nameKey="name" outerRadius={80} paddingAngle={2}>
                {analytics.templateUsage.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {analytics.templateUsage.map((t, i) => (
              <Badge key={t.name} variant="secondary" className="gap-1.5 text-[11px] font-normal">
                <span className="size-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                {t.name} · {t.count}
              </Badge>
            ))}
          </div>
        </Card>
      </div>

      {/* Exporter performance table */}
      <Card className="p-0">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">Exporter Performance Scorecard</h2>
          <p className="mt-1 text-sm text-muted-foreground">Activity, success rate and recency by exporter</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Exporter</TableHead>
              <TableHead className="text-right">Scans</TableHead>
              <TableHead className="text-right">Unlocked</TableHead>
              <TableHead className="text-right">Success</TableHead>
              <TableHead>Last Activity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {analytics.topExporters.map(([email, e]) => {
              const rate = e.scans ? Math.round((e.unlocked / e.scans) * 100) : 0
              return (
                <TableRow key={email}>
                  <TableCell>
                    <div className="font-medium text-foreground">{e.name}</div>
                    <div className="text-xs text-muted-foreground">{e.company ?? email}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{e.scans}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">{e.unlocked}</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        rate >= 90 ? "text-emerald-700" : rate >= 70 ? "text-amber-700" : "text-red-700",
                      )}
                    >
                      {rate}%
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{relTime(e.lastScan)}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Buyer engagement table */}
      <Card className="p-0">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">Buyer Engagement Leaderboard</h2>
          <p className="mt-1 text-sm text-muted-foreground">Which buyers exporters scan the most</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Buyer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="text-right">Scans</TableHead>
              <TableHead className="text-right">Unlocked</TableHead>
              <TableHead>Last Scan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {analytics.topBuyers.map(([id, b]) => (
              <TableRow key={id}>
                <TableCell>
                  <div className="font-medium text-foreground">{b.name}</div>
                  <div className="text-xs text-muted-foreground">{b.country}</div>
                </TableCell>
                <TableCell>
                  <RatingBadge rating={(["A", "B", "C", "D"].includes(b.rating) ? b.rating : "B") as Rating} />
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary">{b.scans}</Badge>
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">{b.unlocked}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{relTime(b.lastScan)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Recent scan log */}
      <Card className="p-0">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">Recent Scan Log</h2>
          <p className="mt-1 text-sm text-muted-foreground">Latest QR scans across the exporter portal</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Time</TableHead>
              <TableHead>Exporter</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="text-right">Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scans.slice(0, 12).map((s) => (
              <TableRow key={s.id}>
                <TableCell className="text-xs text-muted-foreground">{relTime(s.time)}</TableCell>
                <TableCell>
                  <div className="text-sm font-medium text-foreground">{s.exporterName}</div>
                  <div className="text-xs text-muted-foreground">{s.company ?? s.exporterEmail}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-foreground">{s.buyerName}</div>
                  <div className="text-xs text-muted-foreground">{s.country}</div>
                </TableCell>
                <TableCell>
                  <RatingBadge rating={(["A", "B", "C", "D"].includes(s.rating) ? s.rating : "B") as Rating} />
                </TableCell>
                <TableCell className="text-right">
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
                </TableCell>
              </TableRow>
            ))}
            {scans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  No scans recorded yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
