"use client"

import { useEffect, useRef } from "react"

/** Deterministic PRNG so each value always renders the same pattern. */
function hashString(str: string) {
  let h = 1779033703 ^ str.length
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return h >>> 0
}

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const N = 29 // modules per side
const QUIET = 2 // quiet zone in modules

function drawFinder(ctx: CanvasRenderingContext2D, mx: number, my: number, s: number) {
  ctx.fillStyle = "#0f172a"
  ctx.fillRect(mx * s, my * s, 7 * s, 7 * s)
  ctx.fillStyle = "#ffffff"
  ctx.fillRect((mx + 1) * s, (my + 1) * s, 5 * s, 5 * s)
  ctx.fillStyle = "#0f172a"
  ctx.fillRect((mx + 2) * s, (my + 2) * s, 3 * s, 3 * s)
}

function inFinderZone(c: number, r: number) {
  const z = 8 // finder + separator
  return (c < z && r < z) || (c >= N - z && r < z) || (c < z && r >= N - z)
}

/**
 * Decorative (non-scannable) QR-style code used as a visual placeholder.
 * The pattern is deterministic for a given `value`.
 */
export function FakeQR({ value, size = 220, className }: { value: string; size?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const total = N + QUIET * 2
    const s = Math.floor(size / total)
    const px = s * total
    canvas.width = px
    canvas.height = px

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, px, px)

    ctx.save()
    ctx.translate(QUIET * s, QUIET * s)

    const rand = mulberry32(hashString(value))

    // data modules
    ctx.fillStyle = "#0f172a"
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (inFinderZone(c, r)) continue
        // timing patterns
        if (r === 6 || c === 6) {
          if ((r === 6 ? c : r) % 2 === 0) ctx.fillRect(c * s, r * s, s, s)
          continue
        }
        if (rand() < 0.46) ctx.fillRect(c * s, r * s, s, s)
      }
    }

    // finder patterns
    drawFinder(ctx, 0, 0, s)
    drawFinder(ctx, N - 7, 0, s)
    drawFinder(ctx, 0, N - 7, s)

    // alignment pattern (bottom-right)
    const a = N - 9
    ctx.fillStyle = "#0f172a"
    ctx.fillRect(a * s, a * s, 5 * s, 5 * s)
    ctx.fillStyle = "#ffffff"
    ctx.fillRect((a + 1) * s, (a + 1) * s, 3 * s, 3 * s)
    ctx.fillStyle = "#0f172a"
    ctx.fillRect((a + 2) * s, (a + 2) * s, s, s)

    ctx.restore()
  }, [value, size])

  return (
    <canvas
      ref={ref}
      aria-label="QR code"
      className={className ?? "rounded-xl border border-border bg-white shadow-sm"}
      style={{ width: size, height: size }}
    />
  )
}
