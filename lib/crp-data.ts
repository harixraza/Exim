export type Rating = "A" | "B" | "C" | "D"

export type Buyer = {
  id: string
  name: string
  country: string
  rating: Rating
  description: string
  validUntil: string
}

export type ScanRecord = {
  id: string
  buyerName: string
  rating: Rating
  date: string
}

export type UserRequest = {
  id: string
  company: string
  ntn: string
  status: "Pending" | "Approved" | "Rejected"
}

export const buyers: Buyer[] = [
  {
    id: "b1",
    name: "Helmsworth Trading Co.",
    country: "United Kingdom",
    rating: "A",
    description: "Strong payment history with consistent on-time settlements across 5+ years of trade activity.",
    validUntil: "Dec 31, 2026",
  },
  {
    id: "b2",
    name: "Nordwind Imports GmbH",
    country: "Germany",
    rating: "A",
    description: "Excellent creditworthiness, low default risk, and high transaction volume reliability.",
    validUntil: "Nov 15, 2026",
  },
  {
    id: "b3",
    name: "Sahara Goods LLC",
    country: "United Arab Emirates",
    rating: "B",
    description: "Stable buyer with good standing. Occasional minor payment delays noted in records.",
    validUntil: "Sep 30, 2026",
  },
  {
    id: "b4",
    name: "Pacific Rim Distributors",
    country: "Singapore",
    rating: "B",
    description: "Reliable mid-volume buyer with a solid but limited credit history.",
    validUntil: "Aug 12, 2026",
  },
  {
    id: "b5",
    name: "Andes Mercado SA",
    country: "Peru",
    rating: "C",
    description: "Moderate risk. Some overdue invoices reported; recommend partial advance payment.",
    validUntil: "Jul 01, 2026",
  },
  {
    id: "b6",
    name: "Volga Retail Group",
    country: "Russia",
    rating: "D",
    description: "High risk profile. Multiple defaults recorded. Trade with caution or secured terms only.",
    validUntil: "May 20, 2026",
  },
]

export const recentScans: ScanRecord[] = [
  { id: "s1", buyerName: "Helmsworth Trading Co.", rating: "A", date: "Jun 10, 2026" },
  { id: "s2", buyerName: "Sahara Goods LLC", rating: "B", date: "Jun 09, 2026" },
  { id: "s3", buyerName: "Andes Mercado SA", rating: "C", date: "Jun 07, 2026" },
  { id: "s4", buyerName: "Nordwind Imports GmbH", rating: "A", date: "Jun 05, 2026" },
]

export const userRequests: UserRequest[] = [
  { id: "u1", company: "Crescent Textiles Ltd.", ntn: "4820193-7", status: "Pending" },
  { id: "u2", company: "GreenLeaf Exports", ntn: "1029384-2", status: "Pending" },
  { id: "u3", company: "Indus Leather Works", ntn: "5567281-9", status: "Approved" },
  { id: "u4", company: "Summit Rice Traders", ntn: "9988776-5", status: "Pending" },
]

export type Exporter = {
  id: string
  name: string
  country: string
  sector: string
  buyersLinked: number
  status: "Active" | "Inactive"
}

export const exporters: Exporter[] = [
  { id: "e1", name: "Crescent Textiles Ltd.", country: "Pakistan", sector: "Textiles", buyersLinked: 12, status: "Active" },
  { id: "e2", name: "GreenLeaf Exports", country: "Pakistan", sector: "Agriculture", buyersLinked: 8, status: "Active" },
  { id: "e3", name: "Indus Leather Works", country: "Pakistan", sector: "Leather", buyersLinked: 5, status: "Active" },
  { id: "e4", name: "Summit Rice Traders", country: "Pakistan", sector: "Food & Grain", buyersLinked: 9, status: "Active" },
  { id: "e5", name: "Karachi Surgical Co.", country: "Pakistan", sector: "Instruments", buyersLinked: 3, status: "Inactive" },
]

export type Template = {
  id: string
  title: string
  description: string
  defaultFormat: string
  updated: string
}

export const templates: Template[] = [
  {
    id: "t1",
    title: "Standard Buyer Profile",
    description: "Default layout covering buyer identity, country risk, and payment history.",
    defaultFormat: "A / B / C scale",
    updated: "Jun 02, 2026",
  },
  {
    id: "t2",
    title: "High-Volume Importer",
    description: "Extended profile with transaction volume bands and settlement metrics.",
    defaultFormat: "A / B / C scale",
    updated: "May 21, 2026",
  },
  {
    id: "t3",
    title: "New / Unrated Buyer",
    description: "Lightweight template for first-time buyers with limited credit history.",
    defaultFormat: "Provisional rating",
    updated: "Apr 14, 2026",
  },
]

export type Activity = {
  id: string
  text: string
  time: string
}

export const recentActivity: Activity[] = [
  { id: "a1", text: "Rating assigned to Helmsworth Trading Co. (A)", time: "2 hours ago" },
  { id: "a2", text: "New exporter onboarded: Karachi Surgical Co.", time: "5 hours ago" },
  { id: "a3", text: "Buyer Volga Retail Group downgraded to D", time: "Yesterday" },
  { id: "a4", text: "Template 'High-Volume Importer' updated", time: "2 days ago" },
  { id: "a5", text: "Rating assigned to Pacific Rim Distributors (B)", time: "3 days ago" },
]

export const ratingDistribution = [
  { rating: "A", count: 2 },
  { rating: "B", count: 2 },
  { rating: "C", count: 1 },
  { rating: "D", count: 1 },
]

export const activityOverview = [
  { month: "Jan", ratings: 8 },
  { month: "Feb", ratings: 12 },
  { month: "Mar", ratings: 9 },
  { month: "Apr", ratings: 15 },
  { month: "May", ratings: 18 },
  { month: "Jun", ratings: 14 },
]

export const ratingMeta: Record<
  Rating,
  { label: string; tone: "good" | "ok" | "warn" | "bad" }
> = {
  A: { label: "Excellent", tone: "good" },
  B: { label: "Good", tone: "ok" },
  C: { label: "Moderate Risk", tone: "warn" },
  D: { label: "High Risk", tone: "bad" },
}

export const ratingToneClasses: Record<
  "good" | "ok" | "warn" | "bad",
  { badge: string; text: string; soft: string }
> = {
  good: {
    badge: "bg-emerald-600 text-white",
    text: "text-emerald-700",
    soft: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  ok: {
    badge: "bg-sky-600 text-white",
    text: "text-sky-700",
    soft: "bg-sky-50 text-sky-700 border-sky-200",
  },
  warn: {
    badge: "bg-amber-500 text-white",
    text: "text-amber-700",
    soft: "bg-amber-50 text-amber-700 border-amber-200",
  },
  bad: {
    badge: "bg-red-600 text-white",
    text: "text-red-700",
    soft: "bg-red-50 text-red-700 border-red-200",
  },
}
