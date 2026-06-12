"use client"

import { useEffect, useState } from "react"
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
import { Globe, Ship, ScanLine, Users } from "lucide-react"

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

  const countries = new Set(buyers.map((b) => b.fields.country).filter(Boolean)).size
  const weekAgo = Date.now() - 7 * 24 * 3600_000
  const scansThisWeek = scans.filter((s) => new Date(s.time).getTime() >= weekAgo).length

  const recentBuyers = [...buyers].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5)
  const recentScans = scans.slice(0, 5)

  const days: { label: string; scans: number }[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 3600_000)
    const key = d.toISOString().slice(0, 10)
    days.push({
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      scans: scans.filter((s) => s.time.slice(0, 10) === key).length,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="International Buyers" value={buyers.length} icon={Globe} hint={`Across ${countries} ${countries === 1 ? "country" : "countries"}`} />
        <StatCard label="Exporters" value={exporters.length} icon={Ship} hint="Registered with EXIM" />
        <StatCard label="QR Scans" value={scans.length} icon={ScanLine} hint={`${scansThisWeek} in the last 7 days`} />
        <StatCard label="Portal Users" value={userCount} icon={Users} hint="Staff & exporter accounts" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
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
          <p className="mt-1 text-sm text-muted-foreground">Buyers grouped by assigned rating</p>
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

        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground">Recently Rated Buyers</h2>
          <ul className="mt-4 flex flex-col">
            {recentBuyers.map((b, i) => (
              <li
                key={b.id}
                className={`flex items-center justify-between gap-4 py-3 ${
                  i !== recentBuyers.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{b.fields.legalName}</p>
                  <p className="text-xs text-muted-foreground">{b.fields.country}</p>
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
          <h2 className="text-base font-semibold text-foreground">Recent Scans</h2>
          <ul className="mt-4 flex flex-col">
            {recentScans.map((s, i) => (
              <li
                key={s.id}
                className={`flex items-center justify-between gap-4 py-3 ${
                  i !== recentScans.length - 1 ? "border-b border-border" : ""
                }`}
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
