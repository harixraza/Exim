"use client"

import type React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export function Modal({
  open,
  onClose,
  children,
  wide,
}: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  wide?: boolean
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          "relative z-10 max-h-[88vh] w-full overflow-y-auto rounded-2xl bg-card shadow-2xl",
          wide ? "max-w-3xl" : "max-w-md",
        )}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-20 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
        {children}
      </div>
    </div>
  )
}
