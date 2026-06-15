"use client"

import Link from "next/link"
import type React from "react"

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-svh bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/companies" className="flex items-center gap-3">
            <div className="rounded-lg bg-[oklch(0.2_0.07_255)] p-2">
              <img
                src="/images/exim-logo.png"
                alt="EXIM"
                className="h-7 w-auto"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-tight text-foreground">EXIM Bank of Pakistan</p>
              <p className="text-[11px] leading-tight text-muted-foreground">Credit Ratings Portal · Public Directory</p>
            </div>
          </Link>
          <Link
            href="/"
            className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/50"
          >
            Staff Sign-in
          </Link>
        </div>
      </header>
      {children}
      <footer className="border-t border-border py-6 text-center text-[11px] text-muted-foreground">
        Pak-EXIM Credit Rating Service · Government of Pakistan · Regulated by State Bank of Pakistan
      </footer>
    </main>
  )
}
