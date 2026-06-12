"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RatingBadge } from "@/components/rating-badge"
import { Modal } from "@/components/modal"
import { FakeQR } from "@/components/qr-code"
import { CrpForm, FieldsDetail } from "@/components/crp-form"
import { BUYER_SECTIONS } from "@/lib/fields"
import {
  deleteBuyer,
  genAccessCode,
  loadBuyers,
  loadTemplates,
  newId,
  ratingOf,
  saveBuyer,
  type BuyerRecord,
  type TemplateDef,
} from "@/lib/store"
import type { SectionDef } from "@/lib/fields"
import { Plus, CheckCircle2, Eye, Trash2, KeyRound, QrCode } from "lucide-react"

type ModalState =
  | { mode: "add" }
  | { mode: "saved"; buyer: BuyerRecord }
  | { mode: "view"; buyer: BuyerRecord }
  | null

export function BuyersPage() {
  const [buyers, setBuyers] = useState<BuyerRecord[]>([])
  const [templates, setTemplates] = useState<TemplateDef[]>([])
  const [modal, setModal] = useState<ModalState>(null)

  useEffect(() => {
    setBuyers(loadBuyers())
    setTemplates(loadTemplates())
  }, [])

  // inject the QR-profile template picker into the Rating Assignment section
  const formSections: SectionDef[] = BUYER_SECTIONS.map((s) =>
    s.title === "Rating Assignment"
      ? {
          ...s,
          fields: [
            {
              key: "template",
              label: "QR Profile Template",
              type: "select" as const,
              options: templates.map((t) => t.name),
              placeholder: "How the unlocked profile looks",
            },
            ...s.fields,
          ],
        }
      : s,
  )

  function refresh() {
    setBuyers(loadBuyers())
  }

  function handleAdd(fields: Record<string, string>) {
    const buyer: BuyerRecord = {
      id: newId("b"),
      createdAt: new Date().toISOString(),
      accessCode: genAccessCode(),
      fields,
    }
    saveBuyer(buyer)
    refresh()
    setModal({ mode: "saved", buyer })
  }

  function handleDelete(id: string) {
    deleteBuyer(id)
    refresh()
    setModal(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{buyers.length} international buyers on record</p>
        <Button onClick={() => setModal({ mode: "add" })}>
          <Plus className="size-4" />
          Add Buyer
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Buyer Name</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead>Access Code</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {buyers.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium text-foreground">{b.fields.legalName}</TableCell>
                <TableCell className="text-muted-foreground">{b.fields.country}</TableCell>
                <TableCell className="max-w-44 truncate text-muted-foreground">{b.fields.industry}</TableCell>
                <TableCell>
                  <RatingBadge rating={ratingOf(b)} />
                </TableCell>
                <TableCell className="text-muted-foreground">{b.fields.validUntil || "—"}</TableCell>
                <TableCell>
                  <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-foreground">
                    {b.accessCode}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setModal({ mode: "view", buyer: b })}>
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(b.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {buyers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  No buyers yet. Click “Add Buyer” to register the first international buyer.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Card>

      {/* Add buyer */}
      <Modal open={modal?.mode === "add"} onClose={() => setModal(null)} wide>
        <div className="border-b border-border px-6 py-5">
          <h2 className="text-lg font-semibold text-foreground">Add International Buyer</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete the buyer application. A secure QR code and access code are generated on save.
          </p>
        </div>
        <div className="p-6">
          <CrpForm
            sections={formSections}
            submitLabel="Save Buyer & Generate QR"
            onSubmit={handleAdd}
            onCancel={() => setModal(null)}
          />
        </div>
      </Modal>

      {/* Saved — show QR */}
      <Modal open={modal?.mode === "saved"} onClose={() => setModal(null)}>
        {modal?.mode === "saved" ? (
          <div className="flex flex-col items-center p-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="size-6 text-emerald-600" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">Buyer Profile Created</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {modal.buyer.fields.legalName} — {modal.buyer.fields.country}
            </p>

            <div className="mt-6">
              <FakeQR value={`EXIM-CRP|${modal.buyer.id}|${modal.buyer.accessCode}`} size={220} />
            </div>

            <div className="mt-5 flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-2.5">
              <KeyRound className="size-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Access Code</span>
              <span className="font-mono text-base font-bold tracking-wider text-foreground">
                {modal.buyer.accessCode}
              </span>
            </div>

            <p className="mt-4 max-w-xs text-xs leading-relaxed text-muted-foreground">
              Share this QR code and access code with the exporter. The profile unlocks in the Exporter Portal
              only after scanning the QR and entering the access code.
            </p>

            <Button className="mt-6 w-full" onClick={() => setModal(null)}>
              Done
            </Button>
          </div>
        ) : null}
      </Modal>

      {/* View buyer */}
      <Modal open={modal?.mode === "view"} onClose={() => setModal(null)} wide>
        {modal?.mode === "view" ? (
          <div>
            <div className="bg-[oklch(0.25_0.07_255)] px-6 py-6 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60">
                Buyer Credit Profile
              </p>
              <h2 className="mt-1 text-xl font-bold">{modal.buyer.fields.legalName}</h2>
              <p className="mt-0.5 text-sm text-white/70">{modal.buyer.fields.country}</p>
            </div>
            <div className="flex flex-col gap-6 p-6">
              <div className="flex flex-wrap items-center gap-6 rounded-xl border border-border bg-muted/30 p-5">
                <RatingBadge rating={ratingOf(modal.buyer)} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">{modal.buyer.fields.ratingNotes || "No rating notes."}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Valid until {modal.buyer.fields.validUntil || "—"}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <FakeQR value={`EXIM-CRP|${modal.buyer.id}|${modal.buyer.accessCode}`} size={120} />
                  <Badge variant="outline" className="font-mono">
                    <QrCode className="size-3" />
                    {modal.buyer.accessCode}
                  </Badge>
                </div>
              </div>

              <FieldsDetail
                sections={formSections}
                fields={modal.buyer.fields}
                skipKeys={["rating", "validUntil", "ratingNotes"]}
              />

              <div className="flex justify-end gap-3 border-t border-border pt-4">
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(modal.buyer.id)}
                >
                  <Trash2 className="size-4" />
                  Delete Buyer
                </Button>
                <Button onClick={() => setModal(null)}>Close</Button>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
