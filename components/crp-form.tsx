"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import type { FieldDef, SectionDef } from "@/lib/fields"
import { cn } from "@/lib/utils"

const selectClasses =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"

function Field({
  def,
  value,
  onChange,
}: {
  def: FieldDef
  value: string
  onChange: (v: string) => void
}) {
  const id = `f-${def.key}`
  return (
    <div className={cn("flex flex-col gap-2", def.full && "sm:col-span-2")}>
      <Label htmlFor={id}>
        {def.label}
        {def.required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {def.type === "textarea" ? (
        <Textarea
          id={id}
          rows={3}
          value={value}
          required={def.required}
          placeholder={def.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : def.type === "select" ? (
        <select
          id={id}
          className={selectClasses}
          value={value}
          required={def.required}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select…</option>
          {def.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <Input
          id={id}
          type={def.type ?? "text"}
          value={value}
          required={def.required}
          placeholder={def.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  )
}

export function CrpForm({
  sections,
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  sections: SectionDef[]
  initial?: Record<string, string>
  submitLabel: string
  onSubmit: (fields: Record<string, string>) => void
  onCancel?: () => void
}) {
  const [fields, setFields] = useState<Record<string, string>>(initial ?? {})

  function set(key: string, value: string) {
    setFields((f) => ({ ...f, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(fields)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {sections.map((section, i) => (
        <div key={section.title}>
          {i > 0 ? <Separator className="mb-6" /> : null}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              <span className="mr-2 inline-flex size-5 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground">
                {i + 1}
              </span>
              {section.title}
            </h3>
            {section.description ? (
              <p className="mt-1 text-xs text-muted-foreground">{section.description}</p>
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {section.fields.map((def) => (
              <Field key={def.key} def={def} value={fields[def.key] ?? ""} onChange={(v) => set(def.key, v)} />
            ))}
          </div>
        </div>
      ))}

      <div className="flex gap-3 border-t border-border pt-4">
        <Button type="submit">{submitLabel}</Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  )
}

/** Read-only rendering of saved fields, grouped by section. */
export function FieldsDetail({
  sections,
  fields,
  skipKeys,
}: {
  sections: SectionDef[]
  fields: Record<string, string>
  skipKeys?: string[]
}) {
  return (
    <div className="flex flex-col gap-5">
      {sections.map((section) => {
        const visible = section.fields.filter(
          (f) => (fields[f.key] ?? "") !== "" && !(skipKeys ?? []).includes(f.key),
        )
        if (visible.length === 0) return null
        return (
          <div key={section.title}>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {section.title}
            </h4>
            <dl className="grid gap-x-6 gap-y-2 rounded-lg border border-border bg-muted/30 p-4 sm:grid-cols-2">
              {visible.map((f) => (
                <div key={f.key} className={cn(f.type === "textarea" && "sm:col-span-2")}>
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {f.label}
                  </dt>
                  <dd className="text-sm text-foreground">{fields[f.key]}</dd>
                </div>
              ))}
            </dl>
          </div>
        )
      })}
    </div>
  )
}
