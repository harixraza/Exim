"use client"

import { useEffect, useState } from "react"
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
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  loadBuyers,
  loadExporters,
  loadScans,
  type BuyerRecord,
  type ScanRecord,
} from "@/lib/store"
import type { Rating } from "@/lib/crp-data"
import { ScanLine, Users, CheckCircle2, Globe } from "lucide-react"

const scansConfig: ChartConfig = {
  scans: { label: "Scans", color: "var(--chart-1)" },
}

const buyerConfig: ChartConfig = {
  scans: { label: "Scans", color: "var(--chart-2)" },
}

const countryConfig: ChartConfig = {
  scans: { label: "Scans", color: "var(--chart-5)" },
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
  const [exporterCount, setExporterCount] = useState(0)

  useEffect(() => {
    setScans(loadScans())
    setBuyers(loadBuyers())
    setExporterCount(loadExporters().length)
  }, [])

  const unlocked = scans.filter((s) => s.result === "unlocked")
  const weekAgo = Date.now() - 7 * 24 * 3600_000
  const scansThisWeek = scans.filter((s) => new Date(s.time).getTime() >= weekAgo).length
  const successRate = scans.length ? Math.round((unlocked.length / scans.length) * 100) : 0
  const activeExporters = new Set(scans.map((s) => s.exporterEmail)).size

  // scans per day, last 14 days
  const days: { day: string; label: string; scans: number }[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 3600_000)
    const key = dayKey(d.toISOString())
    days.push({
      day: key,
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      scans: scans.filter((s) => dayKey(s.time) === key).length,
    })
  }

  // top buyers by scans
  const byBuyer = new Map<string, number>()
  for (const s of scans) byBuyer.set(s.buyerName, (byBuyer.get(s.buyerName) ?? 0) + 1)
  const topBuyers = [...byBuyer.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name: name.length > 18 ? `${name.slice(0, 17)}…` : name, scans: count }))

  // scans by buyer country
  const byCountry = new Map<string, number>()
  for (const s of scans) byCountry.set(s.country, (byCountry.get(s.country) ?? 0) + 1)
  const countries = [...byCountry.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, scans: count }))

  // top exporters by activity
  const byExporter = new Map<string, { name: string; company?: string; scans: number; unlocked: number }>()
  for (const s of scans) {
    const e = byExporter.get(s.exporterEmail) ?? { name: s.exporterName, company: s.company, scans: 0, unlocked: 0 }
    e.scans++
    if (s.result === "unlocked") e.unlocked++
    byExporter.set(s.exporterEmail, e)
  }
  const topExporters = [...byExporter.entries()].sort((a, b) => b[1].scans - a[1].scans).slice(0, 5)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total QR Scans" value={scans.length} icon={ScanLine} hint={`${scansThisWeek} in the last 7 days`} />
        <StatCard label="Profiles Unlocked" value={unlocked.length} icon={CheckCircle2} hint={`${successRate}% success rate`} />
        <StatCard label="Active Exporters" value={activeExporters} icon={Users} hint={`of ${exporterCount} registered`} />
        <StatCard
          label="Avg Scans / Buyer"
          value={buyers.length ? (scans.length / buyers.length).toFixed(1) : "0"}
          icon={Globe}
          hint={`${buyers.length} rated buyers`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground">Scan Activity</h2>
          <p className="mt-1 text-sm text-muted-foreground">QR scans per day — last 14 days</p>
          <ChartContainer config={scansConfig} className="mt-4 h-64 w-full">
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
          <h2 className="text-base font-semibold text-foreground">Most Scanned Buyers</h2>
          <p className="mt-1 text-sm text-muted-foreground">Top buyer profiles by scan volume</p>
          <ChartContainer config={buyerConfig} className="mt-4 h-64 w-full">
            <BarChart data={topBuyers} layout="vertical" accessibilityLayer margin={{ left: 8, right: 12 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={130} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="scans" fill="var(--color-scans)" radius={4} />
            </BarChart>
          </ChartContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground">Scans by Buyer Country</h2>
          <p className="mt-1 text-sm text-muted-foreground">Where exporters&apos; buyers are located</p>
          <ChartContainer config={countryConfig} className="mt-4 h-64 w-full">
            <BarChart data={countries} accessibilityLayer margin={{ left: 0, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(v: string) => (v.length > 9 ? `${v.slice(0, 8)}…` : v)}
              />
              <YAxis tickLine={false} axisLine={false} width={28} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="scans" fill="var(--color-scans)" radius={6} />
            </BarChart>
          </ChartContainer>
        </Card>

        <Card className="p-0">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-base font-semibold text-foreground">Top Exporters by Activity</h2>
            <p className="mt-1 text-sm text-muted-foreground">Who is scanning buyer profiles the most</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Exporter</TableHead>
                <TableHead className="text-right">Scans</TableHead>
                <TableHead className="text-right">Unlocked</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topExporters.map(([email, e]) => (
                <TableRow key={email}>
                  <TableCell>
                    <div className="font-medium text-foreground">{e.name}</div>
                    <div className="text-xs text-muted-foreground">{e.company ?? email}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{e.scans}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">{e.unlocked}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

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
            {scans.slice(0, 10).map((s) => (
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
