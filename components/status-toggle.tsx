"use client"

import { useEffect, useRef, useState } from "react"
import { Check, ChevronDown, FileEdit } from "lucide-react"
import { cn } from "@/lib/utils"
import type { RecordStatus } from "@/lib/store"

const OPTIONS: { value: RecordStatus; label: string; hint: string }[] = [
  { value: "published", label: "Published", hint: "Visible to exporters" },
  { value: "draft", label: "Draft", hint: "Hidden until published" },
]

/**
 * Clickable status pill that opens a dropdown to change between draft / published.
 * Replaces the static badge in tables.
 */
export function StatusToggle({
  status,
  onChange,
}: {
  status: RecordStatus
  onChange: (next: RecordStatus) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const isDraft = status === "draft"

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        title="Change status"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
          isDraft
            ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
            : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
        )}
      >
        {isDraft ? <FileEdit className="size-3" /> : null}
        {isDraft ? "Draft" : "Published"}
        <ChevronDown className="size-3 opacity-60" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-1.5 w-48 overflow-hidden rounded-lg border border-border bg-card shadow-xl"
        >
          {OPTIONS.map((opt) => {
            const active = opt.value === status
            return (
              <button
                key={opt.value}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange(opt.value)
                  setOpen(false)
                }}
                className={cn(
                  "flex w-full items-start gap-2 px-3 py-2 text-left transition-colors hover:bg-muted/60",
                  active && "bg-muted/40",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full",
                    opt.value === "published" ? "bg-emerald-500/15 text-emerald-700" : "bg-amber-500/15 text-amber-700",
                  )}
                >
                  {active ? <Check className="size-3" /> : null}
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-medium text-foreground">{opt.label}</span>
                  <span className="block text-[11px] text-muted-foreground">{opt.hint}</span>
                </span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
