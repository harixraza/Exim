"use client"

import { Badge } from "@/components/ui/badge"
import { RatingBadge } from "@/components/rating-badge"
import { BUYER_SECTIONS, findBuyerField } from "@/lib/fields"
import { ratingMeta, ratingToneClasses } from "@/lib/crp-data"
import { ratingOf, type BuyerRecord, type TemplateAccent, type TemplateDef } from "@/lib/store"
import { Globe, CalendarCheck, LayoutTemplate, KeyRound } from "lucide-react"
import { cn } from "@/lib/utils"

export const ACCENT_CLASSES: Record<TemplateAccent, string> = {
  navy: "bg-[oklch(0.25_0.07_255)]",
  emerald: "bg-[oklch(0.32_0.09_165)]",
  slate: "bg-[oklch(0.3_0.02_250)]",
  purple: "bg-[oklch(0.3_0.1_300)]",
  amber: "bg-[oklch(0.35_0.1_70)]",
}

const SKIP_KEYS = ["rating", "validUntil", "ratingNotes", "template"]

/**
 * Renders the unlocked QR buyer profile. The template controls the header
 * accent, which form fields appear, and which header blocks render.
 * Without a template, all fields show on a navy header.
 */
export function BuyerProfile({
  buyer,
  template,
}: {
  buyer: BuyerRecord
  template?: TemplateDef
}) {
  const rating = ratingOf(buyer)
  const meta = ratingMeta[rating]
  const tone = ratingToneClasses[meta.tone]
  const accent = ACCENT_CLASSES[template?.accent ?? "navy"]

  const enabledFields = template?.fields ?? BUYER_SECTIONS.flatMap((s) => s.fields.map((f) => f.key))
  const enabledSet = new Set(enabledFields)

  // Group enabled fields back into their original sections (preserving form order)
  const grouped = BUYER_SECTIONS.map((section) => ({
    title: section.title,
    fields: section.fields.filter(
      (f) =>
        enabledSet.has(f.key) &&
        !SKIP_KEYS.includes(f.key) &&
        (buyer.fields[f.key] ?? "") !== "",
    ),
  })).filter((s) => s.fields.length > 0)

  const showHeader = template?.showHeader ?? true
  const showRatingBlock = template?.showRatingBlock ?? true
  const showNotes = template?.showNotes ?? true
  const showValidity = template?.showValidity ?? true
  const showAccessCode = template?.showAccessCode ?? false
  const showTemplateBadge = template?.showTemplateBadge ?? false
  const dense = template?.density === "compact"

  return (
    <div>
      {showHeader ? (
        <div className={`${accent} px-6 py-6 text-white`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60">
                Buyer Credit Profile
              </p>
              <h2 className="mt-1 text-xl font-bold">{buyer.fields.legalName}</h2>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-white/70">
                <Globe className="size-3.5" />
                {buyer.fields.country}
              </p>
            </div>
            {showTemplateBadge && template ? (
              <Badge variant="outline" className="gap-1 border-white/30 bg-white/10 text-white">
                <LayoutTemplate className="size-3" />
                {template.name}
              </Badge>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-6 p-6">
        {showRatingBlock ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-muted/30 p-6 text-center">
            <RatingBadge rating={rating} size="lg" />
            <Badge variant="outline" className={tone.soft}>
              {meta.label}
            </Badge>
            {showNotes && buyer.fields.ratingNotes ? (
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{buyer.fields.ratingNotes}</p>
            ) : null}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {showValidity && buyer.fields.validUntil ? (
                <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs text-muted-foreground">
                  <CalendarCheck className="size-3.5" />
                  Valid until {buyer.fields.validUntil}
                </div>
              ) : null}
              {showAccessCode ? (
                <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 font-mono text-xs text-muted-foreground">
                  <KeyRound className="size-3.5" />
                  {buyer.accessCode}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className={cn("flex flex-col", dense ? "gap-3" : "gap-5")}>
          {grouped.map((section) => (
            <div key={section.title}>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {section.title}
              </h4>
              <dl
                className={cn(
                  "grid gap-x-6 rounded-lg border border-border bg-muted/30 sm:grid-cols-2",
                  dense ? "gap-y-1.5 p-3" : "gap-y-2 p-4",
                )}
              >
                {section.fields.map((f) => (
                  <div key={f.key} className={cn(f.type === "textarea" && "sm:col-span-2")}>
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      {findBuyerField(f.key)?.label ?? f.label}
                    </dt>
                    <dd className="text-sm text-foreground">{buyer.fields[f.key]}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
