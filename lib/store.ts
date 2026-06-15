import type { Rating } from "@/lib/crp-data"

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type RecordStatus = "draft" | "published"

export type BuyerRecord = {
  id: string
  createdAt: string
  publishedAt?: string
  accessCode: string
  status: RecordStatus
  fields: Record<string, string>
}

export type ExporterRecord = {
  id: string
  createdAt: string
  publishedAt?: string
  status: RecordStatus
  fields: Record<string, string>
}

export type Permissions = {
  manageBuyers: boolean
  manageExporters: boolean
  manageUsers: boolean
  manageSettings: boolean
  viewTemplates: boolean
  viewIntelligence: boolean
}

export type RoleDef = {
  id: string
  name: string
  perms: Permissions
  builtIn?: boolean
}

export type TemplateAccent = "navy" | "emerald" | "slate" | "purple" | "amber"

export type TemplateDef = {
  id: string
  name: string
  description: string
  accent: TemplateAccent
  /** legacy — section titles. Read-only, used to derive `fields` if missing. */
  sections?: string[]
  /** field keys (from BUYER_SECTIONS) shown on the unlocked QR profile */
  fields: string[]
  showHeader: boolean
  showRatingBlock: boolean
  showNotes: boolean
  showValidity: boolean
  showAccessCode: boolean
  showTemplateBadge: boolean
  /** density of the field grid */
  density: "comfortable" | "compact"
  updatedAt: string
  builtIn?: boolean
}

export type ScanRecord = {
  id: string
  buyerId: string
  buyerName: string
  country: string
  rating: string
  exporterName: string
  exporterEmail: string
  company?: string
  time: string
  result: "unlocked" | "failed"
}

export type PortalUser = {
  id: string
  name: string
  email: string
  password: string
  type: "exim" | "exporter"
  role: string
  perms: Permissions
  company?: string
}

export type Session = {
  userId: string
  name: string
  email: string
  type: "exim" | "exporter"
  role: string
  perms: Permissions
}

export const ALL_PERMS: Permissions = {
  manageBuyers: true,
  manageExporters: true,
  manageUsers: true,
  manageSettings: true,
  viewTemplates: true,
  viewIntelligence: true,
}

export const NO_PERMS: Permissions = {
  manageBuyers: false,
  manageExporters: false,
  manageUsers: false,
  manageSettings: false,
  viewTemplates: false,
  viewIntelligence: false,
}

/** Fill in keys missing from records saved before new permissions existed. */
export function normalizePerms(p: Partial<Permissions> | undefined): Permissions {
  return {
    manageBuyers: p?.manageBuyers ?? false,
    manageExporters: p?.manageExporters ?? false,
    manageUsers: p?.manageUsers ?? false,
    manageSettings: p?.manageSettings ?? false,
    // older records predate these keys — default visible so menus don't vanish
    viewTemplates: p?.viewTemplates ?? true,
    viewIntelligence: p?.viewIntelligence ?? true,
  }
}

const KEYS = {
  buyers: "crp_buyers",
  exporters: "crp_exporters",
  users: "crp_users",
  roles: "crp_roles",
  templates: "crp_templates",
  scans: "crp_scans",
  session: "crp_session",
  seeded: "crp_seeded_v1",
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
}

export function genAccessCode() {
  const n = Math.floor(1000 + Math.random() * 9000)
  return `EXIM-${n}`
}

export function ratingOf(b: BuyerRecord): Rating {
  const r = b.fields.rating
  return r === "A" || r === "B" || r === "C" || r === "D" ? r : "B"
}

/**
 * Global master access code that unlocks any published buyer profile —
 * useful for demos and authorised EXIM staff. Buyer-specific access codes
 * still work as before.
 */
export const MASTER_ACCESS_CODE = "EXIM-0000"

export function verifyAccessCode(input: string, buyerCode: string): boolean {
  const trimmed = input.trim().toUpperCase()
  return trimmed === buyerCode.toUpperCase() || trimmed === MASTER_ACCESS_CODE
}

/* ------------------------------------------------------------------ */
/* Seed data                                                           */
/* ------------------------------------------------------------------ */

const SEED_BUYERS: BuyerRecord[] = [
  {
    id: "b1",
    createdAt: "2026-05-02T10:00:00.000Z",
    publishedAt: "2026-05-02T11:00:00.000Z",
    accessCode: "EXIM-4821",
    status: "published",
    fields: {
      legalName: "Helmsworth Trading Co.",
      tradingName: "Helmsworth",
      country: "United Kingdom",
      legalForm: "Private Limited",
      regTaxId: "GB-7723941",
      yearEstablished: "1996",
      website: "https://helmsworth.co.uk",
      industry: "Apparel & Home Textiles Retail",
      address: "14 Riverside Wharf, Manchester M3 4JR, United Kingdom",
      listingStatus: "Unlisted",
      auditor: "Grant Thornton UK LLP",
      currency: "GBP",
      accountingStandard: "IFRS",
      revenue: "48200000",
      ebitda: "6400000",
      netIncome: "3100000",
      totalAssets: "52800000",
      totalEquity: "21500000",
      totalDebt: "12400000",
      auditorOpinion: "Unqualified (Clean)",
      sanctionsStatus: "Clear",
      mainProducts: "Wholesale and retail of bed linen, towels and ready-made garments.",
      linkedExporter: "Crescent Textiles Ltd.",
      paymentTerms: "Letter of Credit (LC)",
      tenor: "90",
      proposedCreditLimit: "1500000",
      tradeHistory: "5+ years of trade with Pakistani mills; consistent on-time settlements.",
      template: "High-Volume Importer",
      rating: "A",
      validUntil: "2026-12-31",
      ratingNotes:
        "Strong payment history with consistent on-time settlements across 5+ years of trade activity.",
    },
  },
  {
    id: "b2",
    createdAt: "2026-05-10T10:00:00.000Z",
    publishedAt: "2026-05-10T11:00:00.000Z",
    accessCode: "EXIM-9137",
    status: "published",
    fields: {
      legalName: "Nordwind Imports GmbH",
      country: "Germany",
      legalForm: "LLC",
      regTaxId: "DE-HRB88231",
      industry: "Industrial Distribution",
      address: "Hafenstraße 22, 20457 Hamburg, Germany",
      sanctionsStatus: "Clear",
      currency: "EUR",
      paymentTerms: "Open Account",
      template: "Standard Buyer Profile",
      rating: "A",
      validUntil: "2026-11-15",
      ratingNotes: "Excellent creditworthiness, low default risk, and high transaction volume reliability.",
    },
  },
  {
    id: "b3",
    createdAt: "2026-05-14T10:00:00.000Z",
    publishedAt: "2026-05-14T11:00:00.000Z",
    accessCode: "EXIM-3358",
    status: "published",
    fields: {
      legalName: "Sahara Goods LLC",
      country: "United Arab Emirates",
      legalForm: "LLC",
      regTaxId: "AE-DXB-114532",
      industry: "FMCG Trading",
      address: "Jebel Ali Free Zone, Dubai, UAE",
      sanctionsStatus: "Clear",
      currency: "AED",
      paymentTerms: "Documents against Acceptance (DA)",
      rating: "B",
      validUntil: "2026-09-30",
      ratingNotes: "Stable buyer with good standing. Occasional minor payment delays noted in records.",
    },
  },
  {
    id: "b4",
    createdAt: "2026-05-20T10:00:00.000Z",
    publishedAt: "2026-05-20T11:00:00.000Z",
    accessCode: "EXIM-6604",
    status: "published",
    fields: {
      legalName: "Pacific Rim Distributors",
      country: "Singapore",
      legalForm: "Private Limited",
      regTaxId: "SG-201422871K",
      industry: "Consumer Goods Distribution",
      address: "71 Keppel Road, Singapore 089072",
      sanctionsStatus: "Clear",
      currency: "USD",
      paymentTerms: "Letter of Credit (LC)",
      template: "New / Unrated Buyer",
      rating: "B",
      validUntil: "2026-08-12",
      ratingNotes: "Reliable mid-volume buyer with a solid but limited credit history.",
    },
  },
  {
    id: "b5",
    createdAt: "2026-05-26T10:00:00.000Z",
    publishedAt: "2026-05-26T11:00:00.000Z",
    accessCode: "EXIM-2279",
    status: "published",
    fields: {
      legalName: "Andes Mercado SA",
      country: "Peru",
      legalForm: "Public Limited",
      regTaxId: "PE-20481123778",
      industry: "Food & Grain Imports",
      address: "Av. Argentina 2425, Callao, Peru",
      sanctionsStatus: "Clear",
      currency: "USD",
      paymentTerms: "Documents against Payment (DP)",
      rating: "C",
      validUntil: "2026-07-01",
      ratingNotes: "Moderate risk. Some overdue invoices reported; recommend partial advance payment.",
    },
  },
  {
    id: "b6",
    createdAt: "2026-06-01T10:00:00.000Z",
    publishedAt: "2026-06-01T11:00:00.000Z",
    accessCode: "EXIM-7815",
    status: "published",
    fields: {
      legalName: "Volga Retail Group",
      country: "Russia",
      legalForm: "LLC",
      regTaxId: "RU-1157746330987",
      industry: "Retail",
      address: "Tverskaya 9, Moscow, Russia",
      sanctionsStatus: "Flagged",
      currency: "USD",
      paymentTerms: "Advance Payment",
      rating: "D",
      validUntil: "2026-05-20",
      ratingNotes: "High risk profile. Multiple defaults recorded. Trade with caution or secured terms only.",
    },
  },
  {
    id: "b7",
    createdAt: "2026-06-08T10:00:00.000Z",
    accessCode: "EXIM-1102",
    status: "draft",
    fields: {
      legalName: "Cordoba Mercantil SA",
      country: "Argentina",
      legalForm: "Public Limited",
      regTaxId: "AR-30-71044562-9",
      industry: "Grain & Agro Imports",
      address: "Av. Corrientes 880, Buenos Aires C1043, Argentina",
      sanctionsStatus: "Pending",
      currency: "USD",
      template: "Standard Buyer Profile",
      rating: "C",
      validUntil: "2026-12-31",
      ratingNotes: "Awaiting financial statements from buyer. Preliminary rating subject to revision.",
    },
  },
]

const SEED_EXPORTERS: ExporterRecord[] = [
  {
    id: "e1",
    createdAt: "2026-04-18T10:00:00.000Z",
    publishedAt: "2026-04-18T11:00:00.000Z",
    status: "published",
    fields: {
      legalName: "Crescent Textiles Ltd.",
      businessForm: "Private Limited",
      ntn: "4820193-7",
      strn: "12-00-9800-221-64",
      secpCuin: "0061244",
      passportNumber: "AB2937481",
      chamberMembership: "APTMA / FCCI",
      sector: "Textiles",
      yearEstablished: "1988",
      employees: "1450",
      hsCodes: "5208, 6302",
      exportMarkets: "UK 40%, Germany 25%, UAE 20%, Others 15%",
      exportTurnoverY1: "18500000",
      address: "Sargodha Road, Faisalabad, Punjab",
      ecibConsent: "Yes",
      taxFilerStatus: "Filer",
      sanctionsDeclaration: "Yes",
      productApplied: "Trade Credit Insurance",
      facilityStatus: "Active",
    },
  },
  {
    id: "e2",
    createdAt: "2026-04-25T10:00:00.000Z",
    publishedAt: "2026-04-25T11:00:00.000Z",
    status: "published",
    fields: {
      legalName: "GreenLeaf Exports",
      businessForm: "Partnership (AOP)",
      ntn: "1029384-2",
      passportNumber: "CD1823945",
      sector: "Agriculture",
      address: "Multan Road, Lahore, Punjab",
      ecibConsent: "Yes",
      taxFilerStatus: "Filer",
      productApplied: "E-EFS",
      facilityStatus: "Active",
    },
  },
  {
    id: "e3",
    createdAt: "2026-05-05T10:00:00.000Z",
    publishedAt: "2026-05-05T11:00:00.000Z",
    status: "published",
    fields: {
      legalName: "Indus Leather Works",
      businessForm: "Private Limited",
      ntn: "5567281-9",
      passportNumber: "EF3429187",
      sector: "Leather",
      address: "Korangi Industrial Area, Karachi, Sindh",
      ecibConsent: "Yes",
      taxFilerStatus: "Filer",
      productApplied: "Working Capital Finance",
      facilityStatus: "Active",
    },
  },
  {
    id: "e4",
    createdAt: "2026-05-12T10:00:00.000Z",
    publishedAt: "2026-05-12T11:00:00.000Z",
    status: "published",
    fields: {
      legalName: "Summit Rice Traders",
      businessForm: "Private Limited",
      ntn: "9988776-5",
      passportNumber: "GH7823014",
      sector: "Food & Grain",
      address: "Port Qasim, Karachi, Sindh",
      ecibConsent: "Yes",
      taxFilerStatus: "Filer",
      productApplied: "Buyer Credit",
      facilityStatus: "Active",
    },
  },
  {
    id: "e5",
    createdAt: "2026-05-30T10:00:00.000Z",
    publishedAt: "2026-05-30T11:00:00.000Z",
    status: "published",
    fields: {
      legalName: "Karachi Surgical Co.",
      businessForm: "Sole Proprietorship",
      ntn: "3344556-1",
      passportNumber: "IJ5612983",
      sector: "Surgical Instruments",
      address: "Small Industrial Estate, Sialkot, Punjab",
      ecibConsent: "No",
      taxFilerStatus: "Filer",
      productApplied: "Trade Credit Insurance",
      facilityStatus: "Inactive",
    },
  },
  {
    id: "e6",
    createdAt: "2026-06-08T10:00:00.000Z",
    status: "draft",
    fields: {
      legalName: "Multan Mango Mills",
      businessForm: "Private Limited",
      ntn: "8821345-3",
      sector: "Food & Grain",
      address: "Industrial Zone, Multan, Punjab",
      ecibConsent: "Yes",
      taxFilerStatus: "Filer",
      productApplied: "E-EFS",
      facilityStatus: "Active",
    },
  },
]

const SEED_USERS: PortalUser[] = [
  {
    id: "u_admin",
    name: "Admin User",
    email: "admin@exim.gov",
    password: "admin123",
    type: "exim",
    role: "Administrator",
    perms: { ...ALL_PERMS },
  },
  {
    id: "u_officer",
    name: "Credit Officer",
    email: "officer@exim.gov",
    password: "officer123",
    type: "exim",
    role: "Credit Officer",
    perms: {
      manageBuyers: true,
      manageExporters: true,
      manageUsers: false,
      manageSettings: false,
      viewTemplates: true,
      viewIntelligence: true,
    },
  },
  {
    id: "u_exporter",
    name: "Faisal Mahmood",
    email: "exporter@crescent.pk",
    password: "exporter123",
    type: "exporter",
    role: "Exporter",
    perms: { ...NO_PERMS },
    company: "Crescent Textiles Ltd.",
  },
]

const SEED_ROLES: RoleDef[] = [
  { id: "r_admin", name: "Administrator", perms: { ...ALL_PERMS }, builtIn: true },
  {
    id: "r_officer",
    name: "Credit Officer",
    perms: {
      manageBuyers: true,
      manageExporters: true,
      manageUsers: false,
      manageSettings: false,
      viewTemplates: true,
      viewIntelligence: true,
    },
    builtIn: true,
  },
  {
    id: "r_viewer",
    name: "Viewer",
    perms: { ...NO_PERMS, viewTemplates: true, viewIntelligence: true },
    builtIn: true,
  },
]

const SEED_TEMPLATES: TemplateDef[] = [
  {
    id: "t_standard",
    name: "Standard Buyer Profile",
    description: "Default layout covering buyer identity, business risk and the trade relationship.",
    accent: "navy",
    fields: [
      // Identification
      "legalName", "tradingName", "country", "legalForm", "regTaxId", "yearEstablished", "website", "industry", "address",
      // Business & Risk Profile
      "endMarkets", "existingRatings", "sanctionsStatus", "mainProducts", "topCustomers",
      // Transaction Details
      "linkedExporter", "proposedCreditLimit", "paymentTerms", "tenor", "hsCode", "tradeHistory",
    ],
    showHeader: true,
    showRatingBlock: true,
    showNotes: true,
    showValidity: true,
    showAccessCode: false,
    showTemplateBadge: true,
    density: "comfortable",
    updatedAt: "2026-06-02T10:00:00.000Z",
    builtIn: true,
  },
  {
    id: "t_highvol",
    name: "High-Volume Importer",
    description: "Extended profile with full financials, ownership and governance for large buyers.",
    accent: "emerald",
    fields: [
      "legalName", "tradingName", "country", "legalForm", "regTaxId", "lei", "duns", "yearEstablished", "website", "industry", "address",
      "parentCompany", "ubo", "listingStatus", "auditor", "regulator", "keyManagement", "shareholding",
      "currency", "accountingStandard", "fyEndDate", "revenue", "ebitda", "netIncome", "totalAssets", "totalEquity", "totalDebt", "cashEquivalents", "auditorOpinion",
      "endMarkets", "existingRatings", "sanctionsStatus", "mainProducts", "topCustomers", "litigation",
      "linkedExporter", "proposedCreditLimit", "paymentTerms", "tenor", "hsCode", "tradeHistory", "bankReferences",
    ],
    showHeader: true,
    showRatingBlock: true,
    showNotes: true,
    showValidity: true,
    showAccessCode: true,
    showTemplateBadge: true,
    density: "comfortable",
    updatedAt: "2026-05-21T10:00:00.000Z",
    builtIn: true,
  },
  {
    id: "t_new",
    name: "New / Unrated Buyer",
    description: "Lightweight provisional profile for first-time buyers with limited credit history.",
    accent: "slate",
    fields: ["legalName", "country", "legalForm", "regTaxId", "industry", "address", "linkedExporter", "paymentTerms"],
    showHeader: true,
    showRatingBlock: true,
    showNotes: true,
    showValidity: true,
    showAccessCode: false,
    showTemplateBadge: false,
    density: "compact",
    updatedAt: "2026-04-14T10:00:00.000Z",
    builtIn: true,
  },
]

/** Seed scan history spread over the last ~30 days. */
function makeSeedScans(): ScanRecord[] {
  const exporterIdentities = [
    { name: "Faisal Mahmood", email: "exporter@crescent.pk", company: "Crescent Textiles Ltd." },
    { name: "Ayesha Khan", email: "ayesha@greenleaf.pk", company: "GreenLeaf Exports" },
    { name: "Bilal Sheikh", email: "bilal@summitrice.pk", company: "Summit Rice Traders" },
    { name: "Hamza Qureshi", email: "hamza@indusleather.pk", company: "Indus Leather Works" },
  ]
  // buyerId, weight (relative scan frequency)
  const buyerWeights: [string, number][] = [
    ["b1", 12],
    ["b2", 9],
    ["b3", 8],
    ["b4", 6],
    ["b5", 4],
    ["b6", 3],
  ]
  const byId = Object.fromEntries(SEED_BUYERS.map((b) => [b.id, b]))
  const scans: ScanRecord[] = []
  let n = 0
  for (const [buyerId, weight] of buyerWeights) {
    const buyer = byId[buyerId]
    for (let i = 0; i < weight; i++) {
      n++
      const who = exporterIdentities[n % exporterIdentities.length]
      // multiply by a prime and wrap so buyers interleave across the 30-day window
      const hoursBack = (n * 53) % (30 * 24)
      const failed = n % 9 === 0
      scans.push({
        id: `s_seed_${n}`,
        buyerId,
        buyerName: buyer.fields.legalName,
        country: buyer.fields.country,
        rating: buyer.fields.rating,
        exporterName: who.name,
        exporterEmail: who.email,
        company: who.company,
        time: new Date(Date.now() - hoursBack * 3600_000).toISOString(),
        result: failed ? "failed" : "unlocked",
      })
    }
  }
  return scans.sort((a, b) => b.time.localeCompare(a.time))
}

export function seedIfNeeded() {
  if (typeof window === "undefined") return
  if (!window.localStorage.getItem(KEYS.seeded)) {
    write(KEYS.buyers, SEED_BUYERS)
    write(KEYS.exporters, SEED_EXPORTERS)
    write(KEYS.users, SEED_USERS)
    window.localStorage.setItem(KEYS.seeded, "1")
  }
  // newer collections seed independently so existing demo data is preserved
  if (!window.localStorage.getItem(KEYS.roles)) write(KEYS.roles, SEED_ROLES)
  if (!window.localStorage.getItem(KEYS.templates)) write(KEYS.templates, SEED_TEMPLATES)
  if (!window.localStorage.getItem(KEYS.scans)) write(KEYS.scans, makeSeedScans())
}

export function resetDemoData() {
  if (typeof window === "undefined") return
  Object.values(KEYS).forEach((k) => window.localStorage.removeItem(k))
  seedIfNeeded()
}

/* ------------------------------------------------------------------ */
/* CRUD                                                                */
/* ------------------------------------------------------------------ */

function normalizeBuyer(b: BuyerRecord): BuyerRecord {
  return { ...b, status: b.status ?? "published" }
}

function normalizeExporter(e: ExporterRecord): ExporterRecord {
  return { ...e, status: e.status ?? "published" }
}

const ALL_BUYER_FIELD_KEYS = [
  "legalName", "tradingName", "country", "legalForm", "regTaxId", "lei", "duns", "yearEstablished", "website", "industry", "address",
  "parentCompany", "ubo", "listingStatus", "auditor", "regulator", "keyManagement", "shareholding",
  "currency", "accountingStandard", "fyEndDate", "revenue", "ebitda", "netIncome", "totalAssets", "totalEquity", "totalDebt", "cashEquivalents", "auditorOpinion",
  "endMarkets", "existingRatings", "sanctionsStatus", "mainProducts", "topCustomers", "litigation",
  "linkedExporter", "proposedCreditLimit", "paymentTerms", "tenor", "hsCode", "tradeHistory", "bankReferences",
]

function normalizeTemplate(t: TemplateDef): TemplateDef {
  return {
    ...t,
    fields: t.fields ?? ALL_BUYER_FIELD_KEYS.slice(),
    showHeader: t.showHeader ?? true,
    showRatingBlock: t.showRatingBlock ?? true,
    showNotes: t.showNotes ?? true,
    showValidity: t.showValidity ?? true,
    showAccessCode: t.showAccessCode ?? false,
    showTemplateBadge: t.showTemplateBadge ?? true,
    density: t.density ?? "comfortable",
  }
}

export function loadBuyers(): BuyerRecord[] {
  seedIfNeeded()
  return read<BuyerRecord[]>(KEYS.buyers, []).map(normalizeBuyer)
}

export function loadPublishedBuyers(): BuyerRecord[] {
  return loadBuyers().filter((b) => b.status === "published")
}

export function publishBuyer(id: string) {
  setBuyerStatus(id, "published")
}

export function publishExporter(id: string) {
  setExporterStatus(id, "published")
}

export function setBuyerStatus(id: string, status: RecordStatus) {
  const list = loadBuyers()
  const i = list.findIndex((b) => b.id === id)
  if (i < 0) return
  list[i] = {
    ...list[i],
    status,
    publishedAt: status === "published" ? list[i].publishedAt ?? new Date().toISOString() : list[i].publishedAt,
  }
  write(KEYS.buyers, list)
}

export function setExporterStatus(id: string, status: RecordStatus) {
  const list = loadExporters()
  const i = list.findIndex((e) => e.id === id)
  if (i < 0) return
  list[i] = {
    ...list[i],
    status,
    publishedAt: status === "published" ? list[i].publishedAt ?? new Date().toISOString() : list[i].publishedAt,
  }
  write(KEYS.exporters, list)
}

export function saveBuyer(record: BuyerRecord) {
  const list = loadBuyers()
  const i = list.findIndex((b) => b.id === record.id)
  if (i >= 0) list[i] = record
  else list.unshift(record)
  write(KEYS.buyers, list)
}

export function deleteBuyer(id: string) {
  write(
    KEYS.buyers,
    loadBuyers().filter((b) => b.id !== id),
  )
}

export function loadExporters(): ExporterRecord[] {
  seedIfNeeded()
  return read<ExporterRecord[]>(KEYS.exporters, []).map(normalizeExporter)
}

export function saveExporter(record: ExporterRecord) {
  const list = loadExporters()
  const i = list.findIndex((e) => e.id === record.id)
  if (i >= 0) list[i] = record
  else list.unshift(record)
  write(KEYS.exporters, list)
}

export function deleteExporter(id: string) {
  write(
    KEYS.exporters,
    loadExporters().filter((e) => e.id !== id),
  )
}

export function loadUsers(): PortalUser[] {
  seedIfNeeded()
  return read<PortalUser[]>(KEYS.users, []).map((u) => ({ ...u, perms: normalizePerms(u.perms) }))
}

export function saveUser(user: PortalUser) {
  const list = loadUsers()
  const i = list.findIndex((u) => u.id === user.id)
  if (i >= 0) list[i] = user
  else list.push(user)
  write(KEYS.users, list)
}

export function deleteUser(id: string) {
  write(
    KEYS.users,
    loadUsers().filter((u) => u.id !== id),
  )
}

export function loadRoles(): RoleDef[] {
  seedIfNeeded()
  return read<RoleDef[]>(KEYS.roles, []).map((r) => ({ ...r, perms: normalizePerms(r.perms) }))
}

export function saveRole(role: RoleDef) {
  const list = loadRoles()
  const i = list.findIndex((r) => r.id === role.id)
  if (i >= 0) list[i] = role
  else list.push(role)
  write(KEYS.roles, list)
}

export function deleteRole(id: string) {
  write(
    KEYS.roles,
    loadRoles().filter((r) => r.id !== id),
  )
}

export function loadTemplates(): TemplateDef[] {
  seedIfNeeded()
  return read<TemplateDef[]>(KEYS.templates, []).map(normalizeTemplate)
}

export function saveTemplate(t: TemplateDef) {
  const list = loadTemplates()
  const i = list.findIndex((x) => x.id === t.id)
  if (i >= 0) list[i] = t
  else list.push(t)
  write(KEYS.templates, list)
}

export function deleteTemplate(id: string) {
  write(
    KEYS.templates,
    loadTemplates().filter((t) => t.id !== id),
  )
}

export function findTemplate(name: string | undefined): TemplateDef | undefined {
  if (!name) return undefined
  return loadTemplates().find((t) => t.name === name)
}

export function loadScans(): ScanRecord[] {
  seedIfNeeded()
  return read<ScanRecord[]>(KEYS.scans, [])
}

export function addScan(scan: Omit<ScanRecord, "id" | "time">) {
  const list = loadScans()
  list.unshift({ ...scan, id: newId("s"), time: new Date().toISOString() })
  write(KEYS.scans, list)
}

/* ------------------------------------------------------------------ */
/* Auth / session                                                      */
/* ------------------------------------------------------------------ */

export function authenticate(email: string, password: string, type?: "exim" | "exporter"): Session | null {
  const user = loadUsers().find(
    (u) =>
      u.email.toLowerCase() === email.trim().toLowerCase() &&
      u.password === password &&
      (type ? u.type === type : true),
  )
  if (!user) return null
  const session: Session = {
    userId: user.id,
    name: user.name,
    email: user.email,
    type: user.type,
    role: user.role,
    perms: normalizePerms(user.perms),
  }
  write(KEYS.session, session)
  return session
}

export function getSession(): Session | null {
  const s = read<Session | null>(KEYS.session, null)
  return s ? { ...s, perms: normalizePerms(s.perms) } : null
}

export function clearSession() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(KEYS.session)
}
