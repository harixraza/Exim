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
  type TemplateDef,
} from "@/lib/store"
import { FileText, Plus, Eye, Pencil, Trash2, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

// Rating Assignment is internal — never part of the QR profile layout
const SELECTABLE_SECTIONS = BUYER_SECTIONS.map((s) => s.title).filter((t) => t !== "Rating Assignment")

const ACCENTS: { id: TemplateDef["accent"]; label: string }[] = [
  { id: "navy", label: "EXIM Navy" },
  { id: "emerald", label: "Emerald" },
  { id: "slate", label: "Slate" },
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
        {templates.map((t) => (
          <Card key={t.id} className="flex flex-col p-5">
            <div className="flex items-start justify-between">
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-lg text-white",
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
            <h3 className="mt-4 text-base font-semibold text-foreground">{t.name}</h3>
            <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">{t.description}</p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {t.sections.map((s) => (
                <Badge key={s} variant="secondary" className="text-[11px] font-normal">
                  {s.replace(" (Latest FY)", "")}
                </Badge>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {usage(t)} buyer{usage(t) === 1 ? "" : "s"} using
              </span>
              <span>Updated {new Date(t.updatedAt).toLocaleDateString()}</span>
            </div>

            <div className="mt-4 flex gap-2">
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
                variant="outline"
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
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(t.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              ) : null}
            </div>
          </Card>
        ))}
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

      {/* Preview with sample buyer */}
      <Modal open={modal?.mode === "preview"} onClose={() => setModal(null)} wide>
        {modal?.mode === "preview" ? (
          <div>
            <div className="border-b border-border bg-muted/40 px-6 py-3 text-xs text-muted-foreground">
              Preview — how the unlocked QR profile looks with the “{modal.template.name}” template
              {buyers.length ? ` (sample: ${buyers[0].fields.legalName})` : ""}
            </div>
            {buyers.length ? (
              <BuyerProfile buyer={buyers[0]} template={modal.template} showTemplateName />
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
  const [accent, setAccent] = useState<TemplateDef["accent"]>(template?.accent ?? "navy")
  const [sections, setSections] = useState<string[]>(template?.sections ?? [...SELECTABLE_SECTIONS])
  const [showNotes, setShowNotes] = useState(template?.showNotes ?? true)
  const [showValidity, setShowValidity] = useState(template?.showValidity ?? true)
  const [error, setError] = useState("")

  function toggleSection(title: string) {
    setSections((prev) => (prev.includes(title) ? prev.filter((s) => s !== title) : [...prev, title]))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (sections.length === 0) {
      setError("Select at least one section to show on the profile.")
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
      // keep section order consistent with the form definition
      sections: SELECTABLE_SECTIONS.filter((s) => sections.includes(s)),
      showNotes,
      showValidity,
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
          Choose which sections of the buyer application appear on the unlocked QR profile.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="t-name">Template Name</Label>
            <Input id="t-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Header Accent</Label>
            <div className="flex gap-2">
              {ACCENTS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  title={a.label}
                  onClick={() => setAccent(a.id)}
                  className={cn(
                    "h-9 flex-1 rounded-md text-xs font-medium text-white transition-all",
                    ACCENT_CLASSES[a.id],
                    accent === a.id ? "ring-2 ring-ring ring-offset-2" : "opacity-70 hover:opacity-100",
                  )}
                >
                  {a.label}
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

        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Sections shown on the QR profile</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {SELECTABLE_SECTIONS.map((title) => (
              <label
                key={title}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50"
              >
                <input
                  type="checkbox"
                  className="size-4 accent-[oklch(0.36_0.11_255)]"
                  checked={sections.includes(title)}
                  onChange={() => toggleSection(title)}
                />
                {title}
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Rating block options</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50">
              <input
                type="checkbox"
                className="size-4 accent-[oklch(0.36_0.11_255)]"
                checked={showNotes}
                onChange={(e) => setShowNotes(e.target.checked)}
              />
              Show rating rationale / notes
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50">
              <input
                type="checkbox"
                className="size-4 accent-[oklch(0.36_0.11_255)]"
                checked={showValidity}
                onChange={(e) => setShowValidity(e.target.checked)}
              />
              Show validity date
            </label>
          </div>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="flex gap-3 border-t border-border pt-4">
          <Button type="submit">{template ? "Save Changes" : "Create Template"}</Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
