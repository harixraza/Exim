"use client"

import { useEffect, useRef } from "react"
import QRCode from "qrcode"
import { cn } from "@/lib/utils"

/**
 * Real, scannable QR code. Encodes the given value into a canvas QR.
 * Use this for buyer QR codes whose URLs need to be opened on a phone.
 */
export function RealQR({
  value,
  size = 220,
  className,
}: {
  value: string
  size?: number
  className?: string
}) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!ref.current) return
    QRCode.toCanvas(ref.current, value, {
      width: size,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#0f172a", light: "#ffffff" },
    }).catch(() => {
      // value too long for QR — silently leave canvas blank
    })
  }, [value, size])

  return (
    <canvas
      ref={ref}
      aria-label="QR code"
      className={cn("rounded-xl border border-border bg-white shadow-sm", className)}
      style={{ width: size, height: size }}
    />
  )
}
