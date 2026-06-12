"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

export function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("admin@exim.gov")
  const [password, setPassword] = useState("password")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onLogin()
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-secondary px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex items-center justify-center rounded-xl bg-[#000000] px-4 py-3">
            <img
              src="/images/exim-logo.png"
              alt="EXIM — Export-Import Bank of Pakistan"
              className="h-12 w-auto"
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Credit Ratings Portal</h1>
          <p className="mt-1 text-sm text-muted-foreground">Admin Console</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@exim.gov"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="mt-2 w-full">
              Login
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Authorized EXIM personnel only.
        </p>
      </div>
    </main>
  )
}
