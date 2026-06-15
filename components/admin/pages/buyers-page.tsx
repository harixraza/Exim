"use client"

import { useEffect, useMemo, useState } from "react"
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
import { RealQR } from "@/components/real-qr"
import { CrpForm, FieldsDetail } from "@/components/crp-form"
import { StatusToggle } from "@/components/status-toggle"
import { BUYER_SECTIONS, type SectionDef } from "@/lib/fields"
import {
  deleteBuyer,
  genAccessCode,
  loadBuyers,
  loadTemplates,
  newId,
  publishBuyer,
  ratingOf,
  saveBuyer,
  setBuyerStatus,
  type BuyerRecord,
  type RecordStatus,
  type TemplateDef,
} from "@/lib/store"
import { Plus, CheckCircle2, Eye, Pencil, Trash2, KeyRound, Send } from "lucide-react"

type ModalState =
  | { mode: "add" }
  | { mode: "edit"; buyer: BuyerRecord }
  | { mode: "saved"; buyer: BuyerRecord }
  | { mode: "view"; buyer: BuyerRecord }
  | null

function publicProfileUrl(id: string): string {
  if (typeof window === "undefined") return `/p/${id}`
  return `${window.location.origin}/p/${id}`
}

export function BuyersPage() {
  const [buyers, setBuyers] = useState<BuyerRecord[]>([])
  const [templates, setTemplates] = useState<TemplateDef[]>([])
  const [modal, setModal] = useState<ModalState>(null)
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all")

  useEffect(() => {
    setBuyers(loadBuyers())
    setTemplates(loadTemplates())
  }, [])

  function refresh() {
    setBuyers(loadBuyers())
    setTemplates(loadTemplates())
  }

  const formSections: SectionDef[] = useMemo(
    () =>
      BUYER_SECTIONS.map((s) =>
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
      ),
    [templates],
  )

  function persistNew(fields: Record<string, string>, status: "draft" | "published"): BuyerRecord {
    const buyer: BuyerRecord = {
      id: newId("b"),
      createdAt: new Date().toISOString(),
      publishedAt: status === "published" ? new Date().toISOString() : undefined,
      accessCode: genAccessCode(),
      status,
      fields,
    }
    saveBuyer(buyer)
    refresh()
    return buyer
  }

  function persistEdit(existing: BuyerRecord, fields: Record<string, string>, status?: "draft" | "published") {
    const next: BuyerRecord = {
      ...existing,
      status: status ?? existing.status,
      publishedAt:
        status === "published" && existing.status === "draft"
          ? new Date().toISOString()
          : existing.publishedAt,
      fields,
    }
    saveBuyer(next)
    refresh()
    return next
  }

  function handleAddPublish(fields: Record<string, string>) {
    const buyer = persistNew(fields, "published")
    setModal({ mode: "saved", buyer })
  }

  function handleAddDraft(fields: Record<string, string>) {
    persistNew(fields, "draft")
    setModal(null)
  }

  function handleEditSave(fields: Record<string, string>) {
    if (modal?.mode !== "edit") return
    persistEdit(modal.buyer, fields)
    setModal(null)
  }

  function handleEditPublish(fields: Record<string, string>) {
    if (modal?.mode !== "edit") return
    const next = persistEdit(modal.buyer, fields, "published")
    if (modal.buyer.status === "draft") setModal({ mode: "saved", buyer: next })
    else setModal(null)
  }

  function handlePublishFromRow(id: string) {
    publishBuyer(id)
    const updated = loadBuyers().find((b) => b.id === id)
    refresh()
    if (updated) setModal({ mode: "saved", buyer: updated })
  }

  function handleStatusChange(id: string, next: RecordStatus) {
    setBuyerStatus(id, next)
    refresh()
  }

  function handleDelete(id: string) {
    deleteBuyer(id)
    refresh()
    setModal(null)
  }

  const visible = buyers.filter((b) => (filter === "all" ? true : b.status === filter))
  const draftCount = buyers.filter((b) => b.status === "draft").length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {(["all", "published", "draft"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors " +
                (filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80")
              }
            >
              {f === "all" ? `All (${buyers.length})` : f === "published" ? `Published (${buyers.length - draftCount})` : `Drafts (${draftCount})`}
            </button>
          ))}
        </div>
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
              <TableHead>Status</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead>Access Code</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium text-foreground">{b.fields.legalName}</TableCell>
                <TableCell className="text-muted-foreground">{b.fields.country}</TableCell>
                <TableCell className="max-w-44 truncate text-muted-foreground">{b.fields.industry}</TableCell>
                <TableCell>
                  <RatingBadge rating={ratingOf(b)} />
                </TableCell>
                <TableCell>
                  <StatusToggle status={b.status} onChange={(s) => handleStatusChange(b.id, s)} />
                </TableCell>
                <TableCell className="text-muted-foreground">{b.fields.validUntil || "—"}</TableCell>
                <TableCell>
                  <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-foreground">
                    {b.accessCode}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {b.status === "draft" ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                        title="Publish"
                        onClick={() => handlePublishFromRow(b.id)}
                      >
                        <Send className="size-4" />
                      </Button>
                    ) : null}
                    <Button variant="ghost" size="sm" title="Edit" onClick={() => setModal({ mode: "edit", buyer: b })}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="View" onClick={() => setModal({ mode: "view", buyer: b })}>
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Delete"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(b.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                  No buyers match this filter.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Card>

      {/* Add */}
      <Modal open={modal?.mode === "add"} onClose={() => setModal(null)} wide>
        <div className="border-b border-border px-6 py-5">
          <h2 className="text-lg font-semibold text-foreground">Add International Buyer</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete the application. Publish to issue a QR + access code, or save as a draft for later.
          </p>
        </div>
        <div className="p-6">
          <CrpForm
            sections={formSections}
            submitLabel="Save & Publish"
            draftLabel="Save as Draft"
            onSubmit={handleAddPublish}
            onDraft={handleAddDraft}
            onCancel={() => setModal(null)}
          />
        </div>
      </Modal>

      {/* Edit */}
      <Modal open={modal?.mode === "edit"} onClose={() => setModal(null)} wide>
        {modal?.mode === "edit" ? (
          <>
            <div className="border-b border-border px-6 py-5">
              <h2 className="text-lg font-semibold text-foreground">Edit Buyer — {modal.buyer.fields.legalName}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {modal.buyer.status === "draft"
                  ? "This buyer is a draft. Publish to make the QR profile visible to exporters."
                  : "Update buyer details. Changes apply immediately to the unlocked QR profile."}
              </p>
            </div>
            <div className="p-6">
              <CrpForm
                sections={formSections}
                initial={modal.buyer.fields}
                submitLabel={modal.buyer.status === "draft" ? "Publish Buyer" : "Save Changes"}
                draftLabel={modal.buyer.status === "draft" ? "Save Draft" : undefined}
                onSubmit={handleEditPublish}
                onDraft={modal.buyer.status === "draft" ? handleEditSave : undefined}
                onCancel={() => setModal(null)}
              />
            </div>
          </>
        ) : null}
      </Modal>

      {/* Saved */}
      <Modal open={modal?.mode === "saved"} onClose={() => setModal(null)}>
        {modal?.mode === "saved" ? (
          <div className="flex flex-col items-center p-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="size-6 text-emerald-600" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">Buyer Published</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {modal.buyer.fields.legalName} — {modal.buyer.fields.country}
            </p>
            <div className="mt-6">
              <RealQR value={publicProfileUrl(modal.buyer.id)} size={220} />
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-2.5">
              <KeyRound className="size-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Access Code</span>
              <span className="font-mono text-base font-bold tracking-wider text-foreground">
                {modal.buyer.accessCode}
              </span>
            </div>
            <p className="mt-4 max-w-xs text-xs leading-relaxed text-muted-foreground">
              Share the QR code and access code with the exporter to unlock the profile in the Exporter Portal.
            </p>
            <Button className="mt-6 w-full" onClick={() => setModal(null)}>
              Done
            </Button>
          </div>
        ) : null}
      </Modal>

      {/* View */}
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
                  <RealQR value={publicProfileUrl(modal.buyer.id)} size={120} />
                  <Badge variant="outline" className="font-mono">
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
                <Button variant="outline" onClick={() => setModal({ mode: "edit", buyer: modal.buyer })}>
                  <Pencil className="size-4" />
                  Edit
                </Button>
                {modal.buyer.status === "draft" ? (
                  <Button onClick={() => handlePublishFromRow(modal.buyer.id)}>
                    <Send className="size-4" />
                    Publish
                  </Button>
                ) : null}
                <Button variant="ghost" onClick={() => setModal(null)}>Close</Button>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
