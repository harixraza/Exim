"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Modal } from "@/components/modal"
import { BuyerProfile, ACCENT_CLASSES } from "@/components/buyer-profile"
import { BUYER_SECTIONS } from "@/lib/fields"
import {
  deleteTemplate,
  loadBuyers,
  loadTemplates,
  newId,
  saveTemplate,
  type BuyerRecord,
  type TemplateAccent,
  type TemplateDef,
} from "@/lib/store"
import { FileText, Plus, Eye, Pencil, Trash2, Lock, CheckSquare, Square, MinusSquare } from "lucide-react"
import { cn } from "@/lib/utils"

// Sections that contribute fields to the profile (Rating Assignment is internal)
const PROFILE_SECTIONS = BUYER_SECTIONS.filter((s) => s.title !== "Rating Assignment")
const ALL_PROFILE_FIELD_KEYS = PROFILE_SECTIONS.flatMap((s) => s.fields.map((f) => f.key))

const ACCENTS: { id: TemplateAccent; label: string }[] = [
  { id: "navy", label: "EXIM Navy" },
  { id: "emerald", label: "Emerald" },
  { id: "slate", label: "Slate" },
  { id: "purple", label: "Purple" },
  { id: "amber", label: "Amber" },
]

type ModalState = { mode: "edit"; template?: TemplateDef } | { mode: "preview"; template: TemplateDef } | null

export function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateDef[]>([])
  const [buyers, setBuyers] = useState<BuyerRecord[]>([])
  const [modal, setModal] = useState<ModalState>(null)

  useEffect(() => {
    setTemplates(loadTemplates())
    setBuyers(loadBuyers())
  }, [])

  function refresh() {
    setTemplates(loadTemplates())
  }

  function handleDelete(id: string) {
    deleteTemplate(id)
    refresh()
  }

  const usage = (t: TemplateDef) => buyers.filter((b) => b.fields.template === t.name).length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Templates control how a buyer&apos;s data looks when the QR profile is unlocked
        </p>
        <Button onClick={() => setModal({ mode: "edit" })}>
          <Plus className="size-4" />
          Create Template
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => {
          const fieldPct = Math.round((t.fields.length / ALL_PROFILE_FIELD_KEYS.length) * 100)
          const used = usage(t)
          const options = [
            t.showHeader && "Header",
            t.showRatingBlock && "Rating",
            t.showNotes && "Notes",
            t.showValidity && "Validity",
            t.showAccessCode && "Access code",
            t.showTemplateBadge && "Badge",
          ].filter(Boolean) as string[]

          return (
            <Card key={t.id} className="group flex flex-col overflow-hidden p-0 transition-all hover:shadow-lg">
              {/* accent strip */}
              <div className={cn("h-1.5 w-full", ACCENT_CLASSES[t.accent])} />

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={cn(
                      "flex size-11 items-center justify-center rounded-xl text-white shadow-sm",
                      ACCENT_CLASSES[t.accent],
                    )}
                  >
                    <FileText className="size-5" />
                  </div>
                  {t.builtIn ? (
                    <Badge variant="outline" className="gap-1 text-muted-foreground">
                      <Lock className="size-3" />
                      Built-in
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Custom</Badge>
                  )}
                </div>

                <h3 className="mt-4 text-base font-semibold leading-snug text-foreground">{t.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{t.description}</p>

                {/* Fields ratio */}
                <div className="mt-5">
                  <div className="flex items-baseline justify-between">
                    <p className="text-xs font-medium text-muted-foreground">Fields shown</p>
                    <p className="text-xs">
                      <span className="font-semibold text-foreground">{t.fields.length}</span>
                      <span className="text-muted-foreground"> / {ALL_PROFILE_FIELD_KEYS.length}</span>
                    </p>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full transition-all", ACCENT_CLASSES[t.accent])}
                      style={{ width: `${fieldPct}%` }}
                    />
                  </div>
                </div>

                {/* Display options */}
                <div className="mt-4">
                  <p className="text-xs font-medium text-muted-foreground">Blocks enabled</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {options.length === 0 ? (
                      <span className="text-xs text-muted-foreground">None — fields only</span>
                    ) : (
                      options.map((o) => (
                        <span
                          key={o}
                          className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-foreground"
                        >
                          {o}
                        </span>
                      ))
                    )}
                    <span
                      className={cn(
                        "rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                        t.density === "compact"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-sky-50 text-sky-700",
                      )}
                    >
                      {t.density === "compact" ? "Compact" : "Comfortable"}
                    </span>
                  </div>
                </div>

                {/* Footer stats + actions */}
                <div className="mt-auto pt-5">
                  <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                    <span>
                      <span className="font-semibold text-foreground">{used}</span> buyer{used === 1 ? "" : "s"} using
                    </span>
                    <span>
                      Updated{" "}
                      {new Date(t.updatedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setModal({ mode: "preview", template: t })}
                    >
                      <Eye className="size-3.5" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => setModal({ mode: "edit", template: t })}
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </Button>
                    {!t.builtIn ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-red-50 hover:text-destructive"
                        onClick={() => handleDelete(t.id)}
                        title="Delete template"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Create / edit */}
      <Modal open={modal?.mode === "edit"} onClose={() => setModal(null)} wide>
        {modal?.mode === "edit" ? (
          <TemplateForm
            template={modal.template}
            onSaved={() => {
              refresh()
              setModal(null)
            }}
            onCancel={() => setModal(null)}
          />
        ) : null}
      </Modal>

      {/* Preview */}
      <Modal open={modal?.mode === "preview"} onClose={() => setModal(null)} wide>
        {modal?.mode === "preview" ? (
          <div>
            <div className="border-b border-border bg-muted/40 px-6 py-3 text-xs text-muted-foreground">
              Preview — unlocked QR profile using the “{modal.template.name}” template
              {buyers.length ? ` (sample: ${buyers[0].fields.legalName})` : ""}
            </div>
            {buyers.length ? (
              <BuyerProfile buyer={buyers[0]} template={modal.template} />
            ) : (
              <p className="p-10 text-center text-sm text-muted-foreground">
                Add at least one buyer to preview templates.
              </p>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

function TemplateForm({
  template,
  onSaved,
  onCancel,
}: {
  template?: TemplateDef
  onSaved: () => void
  onCancel: () => void
}) {
  const [name, setName] = useState(template?.name ?? "")
  const [description, setDescription] = useState(template?.description ?? "")
  const [accent, setAccent] = useState<TemplateAccent>(template?.accent ?? "navy")
  const [enabledFields, setEnabledFields] = useState<Set<string>>(
    new Set(template?.fields ?? ALL_PROFILE_FIELD_KEYS),
  )
  const [showHeader, setShowHeader] = useState(template?.showHeader ?? true)
  const [showRatingBlock, setShowRatingBlock] = useState(template?.showRatingBlock ?? true)
  const [showNotes, setShowNotes] = useState(template?.showNotes ?? true)
  const [showValidity, setShowValidity] = useState(template?.showValidity ?? true)
  const [showAccessCode, setShowAccessCode] = useState(template?.showAccessCode ?? false)
  const [showTemplateBadge, setShowTemplateBadge] = useState(template?.showTemplateBadge ?? true)
  const [density, setDensity] = useState<TemplateDef["density"]>(template?.density ?? "comfortable")
  const [error, setError] = useState("")

  function toggleField(key: string) {
    setEnabledFields((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function sectionState(section: typeof PROFILE_SECTIONS[number]): "all" | "some" | "none" {
    const total = section.fields.length
    const on = section.fields.filter((f) => enabledFields.has(f.key)).length
    if (on === 0) return "none"
    if (on === total) return "all"
    return "some"
  }

  function toggleSection(section: typeof PROFILE_SECTIONS[number]) {
    const state = sectionState(section)
    setEnabledFields((prev) => {
      const next = new Set(prev)
      if (state === "all") section.fields.forEach((f) => next.delete(f.key))
      else section.fields.forEach((f) => next.add(f.key))
      return next
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (enabledFields.size === 0) {
      setError("Enable at least one field to show on the profile.")
      return
    }
    const others = loadTemplates().filter((t) => t.id !== template?.id)
    if (others.some((t) => t.name.toLowerCase() === name.trim().toLowerCase())) {
      setError("A template with this name already exists.")
      return
    }
    saveTemplate({
      id: template?.id ?? newId("t"),
      name: name.trim(),
      description: description.trim(),
      accent,
      fields: ALL_PROFILE_FIELD_KEYS.filter((k) => enabledFields.has(k)),
      showHeader,
      showRatingBlock,
      showNotes,
      showValidity,
      showAccessCode,
      showTemplateBadge,
      density,
      updatedAt: new Date().toISOString(),
      builtIn: template?.builtIn,
    })
    onSaved()
  }

  return (
    <div>
      <div className="border-b border-border px-6 py-5">
        <h2 className="text-lg font-semibold text-foreground">
          {template ? `Edit Template — ${template.name}` : "Create Template"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose every field and block that appears on the unlocked QR profile.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
        {/* Identity & accent */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Identity</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="t-name">Template Name</Label>
              <Input id="t-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Header Accent</Label>
              <div className="grid grid-cols-5 gap-1.5">
                {ACCENTS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    title={a.label}
                    onClick={() => setAccent(a.id)}
                    className={cn(
                      "h-9 rounded-md text-[10px] font-medium text-white transition-all",
                      ACCENT_CLASSES[a.id],
                      accent === a.id ? "ring-2 ring-ring ring-offset-2" : "opacity-70 hover:opacity-100",
                    )}
                  >
                    {a.label.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="t-desc">Description</Label>
              <Textarea
                id="t-desc"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="When should this layout be used?"
              />
            </div>
          </div>
        </section>

        {/* Display options */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Display Options</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <BlockToggle label="Show header banner" hint="Buyer name, country, optional template badge" checked={showHeader} onChange={setShowHeader} />
            <BlockToggle label="Show rating block" hint="Big A–D badge with label" checked={showRatingBlock} onChange={setShowRatingBlock} />
            <BlockToggle label="Show rating notes" hint="Free-text rationale below the rating" checked={showNotes} onChange={setShowNotes} />
            <BlockToggle label="Show validity date" hint="When the rating expires" checked={showValidity} onChange={setShowValidity} />
            <BlockToggle label="Show access code on profile" hint="Mostly internal — usually off" checked={showAccessCode} onChange={setShowAccessCode} />
            <BlockToggle label="Show template name badge" hint="Subtle ‘Template:’ pill in header" checked={showTemplateBadge} onChange={setShowTemplateBadge} />
          </div>
          <div className="mt-4">
            <Label className="text-sm">Density</Label>
            <div className="mt-2 flex gap-2">
              {(["comfortable", "compact"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDensity(d)}
                  className={
                    "rounded-md border px-4 py-2 text-xs font-medium capitalize transition-all " +
                    (density === d
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-muted/50")
                  }
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Field-level toggles */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Fields on the Profile</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEnabledFields(new Set(ALL_PROFILE_FIELD_KEYS))}
                className="text-xs text-primary hover:underline"
              >
                Enable all
              </button>
              <span className="text-border">·</span>
              <button
                type="button"
                onClick={() => setEnabledFields(new Set())}
                className="text-xs text-muted-foreground hover:underline"
              >
                Disable all
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {PROFILE_SECTIONS.map((section) => {
              const state = sectionState(section)
              const Icon = state === "all" ? CheckSquare : state === "some" ? MinusSquare : Square
              return (
                <div key={section.title} className="rounded-lg border border-border">
                  <button
                    type="button"
                    onClick={() => toggleSection(section)}
                    className="flex w-full items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-2.5 text-left transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={cn("size-4", state === "all" ? "text-primary" : "text-muted-foreground")} />
                      <span className="text-sm font-semibold text-foreground">{section.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {section.fields.filter((f) => enabledFields.has(f.key)).length} / {section.fields.length}
                    </span>
                  </button>
                  <div className="grid gap-1.5 p-3 sm:grid-cols-2">
                    {section.fields.map((f) => (
                      <label
                        key={f.key}
                        className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted/40"
                      >
                        <input
                          type="checkbox"
                          className="size-4 accent-[oklch(0.36_0.11_255)]"
                          checked={enabledFields.has(f.key)}
                          onChange={() => toggleField(f.key)}
                        />
                        <span className="text-foreground">{f.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="sticky bottom-0 -mx-6 -mb-6 flex gap-3 border-t border-border bg-card/95 px-6 py-4 backdrop-blur">
          <Button type="submit">{template ? "Save Changes" : "Create Template"}</Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

function BlockToggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-muted/50">
      <input
        type="checkbox"
        className="mt-0.5 size-4 accent-[oklch(0.36_0.11_255)]"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>
        <span className="block text-sm text-foreground">{label}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
    </label>
  )
}
