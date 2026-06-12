# EXIM Bank Pakistan — Credit Ratings Portal

A static demo of the **Pak-EXIM Credit Rating Service**: EXIM Bank staff register international buyers and Pakistani exporters, assign A–D credit ratings, and issue QR-secured buyer profiles that exporters unlock with an access code.

All data lives in **browser localStorage** — no backend or database.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Demo logins

| Portal   | Email                  | Password    |
| -------- | ---------------------- | ----------- |
| EXIM     | admin@exim.gov         | admin123    |
| EXIM     | officer@exim.gov       | officer123  |
| Exporter | exporter@crescent.pk   | exporter123 |

## Features

- **Dual login** — EXIM admin console and exporter portal
- **International Buyers** — full credit application form; saving generates a QR code + access code
- **Exporters** — registration form with Pakistani statutory fields (NTN, STRN, SECP, WeBOC, TDAP…)
- **QR unlock flow** — exporters scan a buyer's QR, enter the access code, and the credit profile unlocks
- **Templates** — control which sections appear on the unlocked QR profile
- **Business Intelligence** — scan analytics: activity charts, most-scanned buyers, scan log
- **Users & Permissions** — create staff/exporter accounts; custom roles with per-menu permission checkboxes (managed in Settings)
- **Data management** — export everything as JSON or reset to seed data (Settings)

## Stack

Next.js 16 · React 19 · Tailwind CSS v4 · shadcn/ui · Recharts · localStorage
