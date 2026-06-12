export type FieldType = "text" | "number" | "date" | "textarea" | "select"

export type FieldDef = {
  key: string
  label: string
  type?: FieldType
  options?: string[]
  required?: boolean
  placeholder?: string
  /** span both columns */
  full?: boolean
}

export type SectionDef = {
  title: string
  description?: string
  fields: FieldDef[]
}

/* ------------------------------------------------------------------ */
/* International Buyer — application form                              */
/* ------------------------------------------------------------------ */

export const BUYER_SECTIONS: SectionDef[] = [
  {
    title: "Identification",
    description: "Legal identity of the international buyer.",
    fields: [
      { key: "legalName", label: "Legal Name", required: true, placeholder: "e.g. Helmsworth Trading Co." },
      { key: "tradingName", label: "Trading / Brand Name", placeholder: "If different from legal name" },
      { key: "country", label: "Country of Incorporation", required: true, placeholder: "e.g. United Kingdom" },
      {
        key: "legalForm",
        label: "Legal Form",
        type: "select",
        options: ["Private Limited", "Public Limited", "LLC", "Partnership", "Sole Proprietorship", "State-Owned", "Other"],
      },
      { key: "regTaxId", label: "Registration / Tax ID", required: true, placeholder: "Company registration or tax number" },
      { key: "lei", label: "LEI Code", placeholder: "Legal Entity Identifier (if any)" },
      { key: "duns", label: "D-U-N-S Number", placeholder: "Dun & Bradstreet number (if any)" },
      { key: "yearEstablished", label: "Year Established", type: "number", placeholder: "e.g. 1998" },
      { key: "website", label: "Website", placeholder: "https://" },
      { key: "industry", label: "Industry / Sector", required: true, placeholder: "e.g. Retail, Textiles, FMCG" },
      { key: "address", label: "Registered Address", type: "textarea", required: true, full: true },
    ],
  },
  {
    title: "Ownership & Governance",
    fields: [
      { key: "parentCompany", label: "Parent Company / Group", placeholder: "Ultimate parent (if any)" },
      { key: "ubo", label: "Ultimate Beneficial Owner(s)", placeholder: "Individuals holding > 5%" },
      {
        key: "listingStatus",
        label: "Listing Status",
        type: "select",
        options: ["Unlisted", "Listed", "State-Owned"],
      },
      { key: "auditor", label: "External Auditor", placeholder: "Audit firm name" },
      { key: "regulator", label: "Regulator (if any)", placeholder: "e.g. FCA, SEC" },
      { key: "keyManagement", label: "Key Management (CEO / CFO)", type: "textarea", full: true, placeholder: "Names, designations, tenure" },
      { key: "shareholding", label: "Shareholding Structure", type: "textarea", full: true, placeholder: "Shareholders holding > 5% with percentages" },
    ],
  },
  {
    title: "Financial Information (Latest FY)",
    description: "From the most recent audited financial statements.",
    fields: [
      {
        key: "currency",
        label: "Reporting Currency",
        type: "select",
        options: ["USD", "EUR", "GBP", "AED", "CNY", "PKR", "Other"],
      },
      {
        key: "accountingStandard",
        label: "Accounting Standard",
        type: "select",
        options: ["IFRS", "US GAAP", "Local GAAP", "Other"],
      },
      { key: "fyEndDate", label: "Financial Year End", type: "date" },
      { key: "revenue", label: "Revenue", type: "number", placeholder: "Annual revenue" },
      { key: "ebitda", label: "EBITDA", type: "number" },
      { key: "netIncome", label: "Net Income", type: "number" },
      { key: "totalAssets", label: "Total Assets", type: "number" },
      { key: "totalEquity", label: "Total Equity", type: "number" },
      { key: "totalDebt", label: "Total Debt", type: "number" },
      { key: "cashEquivalents", label: "Cash & Equivalents", type: "number" },
      {
        key: "auditorOpinion",
        label: "Auditor Opinion",
        type: "select",
        options: ["Unqualified (Clean)", "Qualified", "Adverse", "Disclaimer"],
      },
    ],
  },
  {
    title: "Business & Risk Profile",
    fields: [
      { key: "endMarkets", label: "End Markets", placeholder: "Key geographies served" },
      { key: "existingRatings", label: "Existing Credit Ratings", placeholder: "e.g. Moody's Ba2, D&B 2A3" },
      {
        key: "sanctionsStatus",
        label: "Sanctions / AML Screening",
        type: "select",
        options: ["Clear", "Pending", "Flagged"],
      },
      { key: "mainProducts", label: "Main Products / Services", type: "textarea", full: true },
      { key: "topCustomers", label: "Top Customers & Concentration", type: "textarea", full: true, placeholder: "Top 5 customers with % of sales" },
      { key: "litigation", label: "Litigation / Legal Notes", type: "textarea", full: true },
    ],
  },
  {
    title: "Transaction Details",
    description: "Trade relationship with the Pakistani exporter.",
    fields: [
      { key: "linkedExporter", label: "Linked Pakistani Exporter", placeholder: "e.g. Crescent Textiles Ltd." },
      { key: "proposedCreditLimit", label: "Proposed Credit Limit (USD)", type: "number" },
      {
        key: "paymentTerms",
        label: "Payment Terms",
        type: "select",
        options: ["Letter of Credit (LC)", "Documents against Acceptance (DA)", "Documents against Payment (DP)", "Open Account", "Advance Payment"],
      },
      { key: "tenor", label: "Tenor (days)", type: "number", placeholder: "e.g. 90" },
      { key: "hsCode", label: "Goods / HS Code", placeholder: "e.g. 6203 — Men's apparel" },
      { key: "tradeHistory", label: "Trade History", type: "textarea", full: true, placeholder: "Years trading, volumes, payment behaviour" },
      { key: "bankReferences", label: "Bank / Trade References", type: "textarea", full: true },
    ],
  },
  {
    title: "Rating Assignment",
    description: "Credit rating assigned by EXIM Bank.",
    fields: [
      {
        key: "rating",
        label: "Credit Rating",
        type: "select",
        required: true,
        options: ["A", "B", "C", "D"],
      },
      { key: "validUntil", label: "Rating Valid Until", type: "date", required: true },
      { key: "ratingNotes", label: "Rating Rationale / Notes", type: "textarea", full: true, placeholder: "Payment history, risk notes, recommendations…" },
    ],
  },
]

/* ------------------------------------------------------------------ */
/* Pakistani Exporter — registration form                              */
/* ------------------------------------------------------------------ */

export const EXPORTER_SECTIONS: SectionDef[] = [
  {
    title: "Identification & Registration",
    description: "Statutory registrations of the Pakistani exporter.",
    fields: [
      { key: "legalName", label: "Legal Name", required: true, placeholder: "e.g. Crescent Textiles Ltd." },
      {
        key: "businessForm",
        label: "Business Form",
        type: "select",
        options: ["Sole Proprietorship", "Partnership (AOP)", "Private Limited", "Public Limited"],
      },
      { key: "ntn", label: "NTN (FBR)", required: true, placeholder: "National Tax Number" },
      { key: "strn", label: "STRN", placeholder: "Sales Tax Registration Number" },
      { key: "secpCuin", label: "SECP CUIN", placeholder: "Incorporation number (if company)" },
      { key: "cnicDirectors", label: "CNIC of Proprietor / Directors", placeholder: "xxxxx-xxxxxxx-x" },
      { key: "chamberMembership", label: "Chamber / Association Membership", placeholder: "e.g. KCCI, APTMA" },
      { key: "webocId", label: "WeBOC / PSW Exporter Code" },
      { key: "tdapReg", label: "TDAP / REX Registration No." },
      { key: "iban", label: "Business IBAN", placeholder: "PK.." },
      { key: "bankName", label: "Bank & Branch", placeholder: "Authorised dealer branch" },
      { key: "address", label: "Registered Address", type: "textarea", required: true, full: true },
      { key: "factoryAddress", label: "Factory / Warehouse Address", type: "textarea", full: true },
    ],
  },
  {
    title: "Business Profile",
    fields: [
      { key: "yearEstablished", label: "Year Established", type: "number" },
      { key: "sector", label: "Sector", required: true, placeholder: "e.g. Textiles, Rice, Surgical" },
      { key: "employees", label: "Number of Employees", type: "number" },
      { key: "hsCodes", label: "HS Codes of Exports", placeholder: "e.g. 5208, 6302" },
      { key: "exportMarkets", label: "Export Markets", placeholder: "Countries with % share" },
      { key: "exportTurnoverY1", label: "Export Turnover — Last Year (USD)", type: "number" },
      { key: "exportTurnoverY2", label: "Export Turnover — 2 Years Ago (USD)", type: "number" },
      { key: "exportTurnoverY3", label: "Export Turnover — 3 Years Ago (USD)", type: "number" },
      { key: "totalTurnover", label: "Total Turnover (PKR)", type: "number" },
      { key: "products", label: "Products / Services Exported", type: "textarea", full: true },
      { key: "topBuyers", label: "Top Buyers (last 12 months)", type: "textarea", full: true, placeholder: "Buyer, country, annual value" },
    ],
  },
  {
    title: "Ownership & Management",
    fields: [
      { key: "certifications", label: "Certifications", placeholder: "ISO, Halal, GOTS, BSCI…" },
      { key: "shareholding", label: "Shareholding %", type: "textarea", full: true },
      { key: "beneficialOwners", label: "Beneficial Owners", type: "textarea", full: true },
      { key: "directors", label: "Directors / Key Management & Experience", type: "textarea", full: true },
    ],
  },
  {
    title: "Financial Information (Latest FY)",
    description: "From the most recent audited accounts.",
    fields: [
      { key: "revenue", label: "Revenue (PKR)", type: "number" },
      { key: "grossProfit", label: "Gross Profit (PKR)", type: "number" },
      { key: "netProfit", label: "Net Profit (PKR)", type: "number" },
      { key: "totalAssets", label: "Total Assets (PKR)", type: "number" },
      { key: "receivables", label: "Trade Receivables (PKR)", type: "number" },
      { key: "inventory", label: "Inventory (PKR)", type: "number" },
      { key: "totalLiabilities", label: "Total Liabilities (PKR)", type: "number" },
      { key: "bankBorrowings", label: "Bank Borrowings (PKR)", type: "number" },
      { key: "equity", label: "Equity (PKR)", type: "number" },
      { key: "auditorName", label: "Auditor Name" },
    ],
  },
  {
    title: "Banking & Credit History",
    fields: [
      {
        key: "ecibConsent",
        label: "eCIB Report Consent",
        type: "select",
        options: ["Yes", "No"],
      },
      { key: "sbpSchemes", label: "SBP Scheme Usage", placeholder: "EFS / LTFF / E-EFS (if any)" },
      { key: "existingFacilities", label: "Existing Bank Facilities", type: "textarea", full: true, placeholder: "Bank, type, limit, outstanding, tenor" },
      { key: "defaultsHistory", label: "Defaults / Restructurings", type: "textarea", full: true },
    ],
  },
  {
    title: "Compliance & Facility Request",
    fields: [
      {
        key: "taxFilerStatus",
        label: "FBR Filer Status",
        type: "select",
        options: ["Filer", "Non-Filer"],
      },
      {
        key: "sanctionsDeclaration",
        label: "FATF / Sanctions Self-Declaration Clear",
        type: "select",
        options: ["Yes", "No"],
      },
      {
        key: "productApplied",
        label: "Product Applied For",
        type: "select",
        options: ["Trade Credit Insurance", "Buyer Credit", "Working Capital Finance", "E-EFS"],
      },
      { key: "facilityAmount", label: "Facility Amount", type: "number" },
      { key: "facilityTenor", label: "Facility Tenor (months)", type: "number" },
      {
        key: "facilityCurrency",
        label: "Facility Currency",
        type: "select",
        options: ["PKR", "USD", "EUR", "GBP"],
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["Active", "Inactive"],
      },
      { key: "litigation", label: "Litigation / Notes", type: "textarea", full: true },
    ],
  },
]
