"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authenticate, getSession, seedIfNeeded } from "@/lib/store"
import { AlertCircle, ArrowRight, Lock } from "lucide-react"

export default function LandingPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    seedIfNeeded()
    const session = getSession()
    if (session) router.replace(session.type === "exim" ? "/admin" : "/exporter")
  }, [router])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const session = authenticate(email, password)
    if (!session) {
      setError("Invalid email or password. Please try again.")
      setLoading(false)
      return
    }
    router.push(session.type === "exim" ? "/admin" : "/exporter")
  }

  return (
    <main className="min-h-svh bg-background">
      <div className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
        {/* ============================================================== */}
        {/* Brand panel                                                    */}
        {/* ============================================================== */}
        <section className="relative hidden overflow-hidden bg-[oklch(0.2_0.07_255)] lg:flex lg:flex-col">
          {/* dotted texture */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "26px 26px",
            }}
          />
          {/* gradient accents */}
          <div
            aria-hidden
            className="pointer-events-none absolute -left-40 -top-40 size-[28rem] rounded-full bg-[oklch(0.55_0.16_200)]/25 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-44 -right-44 size-[30rem] rounded-full bg-[oklch(0.4_0.2_265)]/35 blur-3xl"
          />

          <div className="relative flex flex-1 flex-col px-12 py-10 xl:px-20 xl:py-12">
            {/* Top government banner */}
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-white/15" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/70">
                Government of Pakistan
              </span>
              <div className="h-px flex-1 bg-white/15" />
            </div>

            {/* Logo presentation */}
            <div className="mt-14 flex flex-col items-center xl:mt-16">
              <div className="relative">
                {/* soft floor glow */}
                <div
                  aria-hidden
                  className="absolute -inset-x-2 -bottom-4 h-20 rounded-full bg-black/45 blur-2xl"
                />
                {/* main plate */}
                <div
                  className="relative rounded-[1.5rem] bg-gradient-to-br from-white via-white to-[oklch(0.96_0.015_245)] px-14 py-10"
                  style={{
                    boxShadow:
                      "0 32px 80px -20px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.15), inset 0 1px 0 rgba(255,255,255,1)",
                  }}
                >
                  <img
                    src="/images/exim-logo.png"
                    alt="EXIM — Export-Import Bank of Pakistan"
                    className="mx-auto h-28 w-auto xl:h-32"
                  />
                </div>
              </div>
              <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.4em] text-white/45">
                Export-Import Bank of Pakistan
              </p>
            </div>

            {/* Hero copy */}
            <div className="mt-14 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/55">
                Pak-EXIM Credit Rating Service
              </p>
              <h1 className="mt-5 text-balance text-4xl font-bold leading-[1.1] tracking-tight text-white xl:text-[3.25rem]">
                Credit Ratings Portal
              </h1>
              <p className="mx-auto mt-5 max-w-md text-balance text-[15px] leading-relaxed text-white/65">
                Verified credit ratings of international buyers, issued by the
                Export-Import Bank of Pakistan for Pakistani exporters.
              </p>
            </div>

            {/* Footer institutional bar */}
            <div className="mt-auto pt-12">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
                <div className="grid grid-cols-2 divide-x divide-white/10">
                  <div className="px-4">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-white/45">
                      Regulator
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white/90">
                      State Bank of Pakistan
                    </p>
                  </div>
                  <div className="px-4">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-white/45">
                      Classification
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white/90">
                      Development Finance Institution
                    </p>
                  </div>
                </div>
              </div>
              <p className="mt-5 text-center text-[11px] tracking-wide text-white/35">
                © {new Date().getFullYear()} Export-Import Bank of Pakistan. All rights reserved.
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* Sign-in panel                                                  */}
        {/* ============================================================== */}
        <section className="flex items-center justify-center px-6 py-12 sm:px-12">
          <div className="w-full max-w-sm">
            {/* Mobile logo */}
            <div className="mb-10 flex justify-center lg:hidden">
              <div className="rounded-xl bg-white px-6 py-5 shadow-sm ring-1 ring-border">
                <img
                  src="/images/exim-logo.png"
                  alt="EXIM — Export-Import Bank of Pakistan"
                  className="h-14 w-auto"
                />
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">
                EXIM Bank
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                Sign in
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Access the Credit Ratings Portal admin console.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-9 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@exim.gov"
                  autoComplete="email"
                  required
                  className="h-11 text-[15px]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="h-11 text-[15px]"
                />
              </div>

              {error ? (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>{error}</span>
                </div>
              ) : null}

              <Button
                type="submit"
                disabled={loading}
                className="mt-2 h-11 w-full text-[15px] font-semibold"
              >
                {loading ? "Signing in…" : "Sign in"}
                {!loading ? <ArrowRight className="size-4" /> : null}
              </Button>
            </form>

            <div className="mt-10 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
              <Lock className="size-3" />
              Secure connection · Authorized users only
            </div>

            <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
              Need access? Contact the{" "}
              <span className="font-medium text-foreground">EXIM Credit Risk</span> department.
            </div>
            <div className="mt-3 text-center text-xs">
              <a href="/companies" className="font-medium text-primary hover:underline">
                Browse the public buyer directory →
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
