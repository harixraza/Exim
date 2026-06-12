"use client"

import { Badge } from "@/components/ui/badge"
import { RatingBadge } from "@/components/rating-badge"
import { FieldsDetail } from "@/components/crp-form"
import { BUYER_SECTIONS } from "@/lib/fields"
import { ratingMeta, ratingToneClasses } from "@/lib/crp-data"
import { ratingOf, type BuyerRecord, type TemplateDef } from "@/lib/store"
import { Globe, CalendarCheck, LayoutTemplate } from "lucide-react"

export const ACCENT_CLASSES: Record<TemplateDef["accent"], string> = {
  navy: "bg-[oklch(0.25_0.07_255)]",
  emerald: "bg-[oklch(0.32_0.09_165)]",
  slate: "bg-[oklch(0.3_0.02_250)]",
}

/**
 * Renders the unlocked QR buyer profile. The template controls the header
 * accent, which form sections appear, and whether notes/validity show.
 * Without a template, everything is shown on a navy header.
 */
export function BuyerProfile({
  buyer,
  template,
  showTemplateName,
}: {
  buyer: BuyerRecord
  template?: TemplateDef
  showTemplateName?: boolean
}) {
  const rating = ratingOf(buyer)
  const meta = ratingMeta[rating]
  const tone = ratingToneClasses[meta.tone]

  const visibleSections = template
    ? BUYER_SECTIONS.filter((s) => template.sections.includes(s.title))
    : BUYER_SECTIONS

  return (
    <div>
      <div className={`${ACCENT_CLASSES[template?.accent ?? "navy"]} px-6 py-6 text-white`}>
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
          {showTemplateName && template ? (
            <Badge variant="outline" className="gap-1 border-white/30 bg-white/10 text-white">
              <LayoutTemplate className="size-3" />
              {template.name}
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-muted/30 p-6 text-center">
          <RatingBadge rating={rating} size="lg" />
          <Badge variant="outline" className={tone.soft}>
            {meta.label}
          </Badge>
          {(template?.showNotes ?? true) && buyer.fields.ratingNotes ? (
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{buyer.fields.ratingNotes}</p>
          ) : null}
          {(template?.showValidity ?? true) && buyer.fields.validUntil ? (
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs text-muted-foreground">
              <CalendarCheck className="size-3.5" />
              Valid until {buyer.fields.validUntil}
            </div>
          ) : null}
        </div>

        <FieldsDetail
          sections={visibleSections}
          fields={buyer.fields}
          skipKeys={["rating", "validUntil", "ratingNotes", "template"]}
        />
      </div>
    </div>
  )
}
