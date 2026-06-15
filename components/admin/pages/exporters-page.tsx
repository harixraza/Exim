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
import { Modal } from "@/components/modal"
import { CrpForm, FieldsDetail } from "@/components/crp-form"
import { StatusToggle } from "@/components/status-toggle"
import { EXPORTER_SECTIONS } from "@/lib/fields"
import {
  deleteExporter,
  loadExporters,
  newId,
  publishExporter,
  saveExporter,
  setExporterStatus,
  type ExporterRecord,
  type RecordStatus,
} from "@/lib/store"
import { Plus, CheckCircle2, Eye, Pencil, Trash2, Send } from "lucide-react"

type ModalState =
  | { mode: "add" }
  | { mode: "edit"; exporter: ExporterRecord }
  | { mode: "saved"; exporter: ExporterRecord }
  | { mode: "view"; exporter: ExporterRecord }
  | null

export function ExportersPage() {
  const [exporters, setExporters] = useState<ExporterRecord[]>([])
  const [modal, setModal] = useState<ModalState>(null)
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all")

  useEffect(() => {
    setExporters(loadExporters())
  }, [])

  function refresh() {
    setExporters(loadExporters())
  }

  function persistNew(fields: Record<string, string>, status: "draft" | "published"): ExporterRecord {
    const exporter: ExporterRecord = {
      id: newId("e"),
      createdAt: new Date().toISOString(),
      publishedAt: status === "published" ? new Date().toISOString() : undefined,
      status,
      fields,
    }
    saveExporter(exporter)
    refresh()
    return exporter
  }

  function persistEdit(existing: ExporterRecord, fields: Record<string, string>, status?: "draft" | "published") {
    const next: ExporterRecord = {
      ...existing,
      status: status ?? existing.status,
      publishedAt:
        status === "published" && existing.status === "draft"
          ? new Date().toISOString()
          : existing.publishedAt,
      fields,
    }
    saveExporter(next)
    refresh()
    return next
  }

  function handleAddPublish(fields: Record<string, string>) {
    const exporter = persistNew(fields, "published")
    setModal({ mode: "saved", exporter })
  }

  function handleAddDraft(fields: Record<string, string>) {
    persistNew(fields, "draft")
    setModal(null)
  }

  function handleEditSave(fields: Record<string, string>) {
    if (modal?.mode !== "edit") return
    persistEdit(modal.exporter, fields)
    setModal(null)
  }

  function handleEditPublish(fields: Record<string, string>) {
    if (modal?.mode !== "edit") return
    const next = persistEdit(modal.exporter, fields, "published")
    if (modal.exporter.status === "draft") setModal({ mode: "saved", exporter: next })
    else setModal(null)
  }

  function handlePublishFromRow(id: string) {
    publishExporter(id)
    refresh()
  }

  function handleStatusChange(id: string, next: RecordStatus) {
    setExporterStatus(id, next)
    refresh()
  }

  function handleDelete(id: string) {
    deleteExporter(id)
    refresh()
    setModal(null)
  }

  const visible = exporters.filter((e) => (filter === "all" ? true : e.status === filter))
  const draftCount = exporters.filter((e) => e.status === "draft").length

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
              {f === "all" ? `All (${exporters.length})` : f === "published" ? `Published (${exporters.length - draftCount})` : `Drafts (${draftCount})`}
            </button>
          ))}
        </div>
        <Button onClick={() => setModal({ mode: "add" })}>
          <Plus className="size-4" />
          Add Exporter
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Exporter</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead>NTN</TableHead>
              <TableHead>Passport</TableHead>
              <TableHead>Product Applied</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-medium text-foreground">{e.fields.legalName}</TableCell>
                <TableCell className="text-muted-foreground">{e.fields.sector}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{e.fields.ntn}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{e.fields.passportNumber || "—"}</TableCell>
                <TableCell className="text-muted-foreground">{e.fields.productApplied || "—"}</TableCell>
                <TableCell>
                  <StatusToggle status={e.status} onChange={(s) => handleStatusChange(e.id, s)} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {e.status === "draft" ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Publish"
                        className="text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                        onClick={() => handlePublishFromRow(e.id)}
                      >
                        <Send className="size-4" />
                      </Button>
                    ) : null}
                    <Button variant="ghost" size="sm" title="Edit" onClick={() => setModal({ mode: "edit", exporter: e })}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="View" onClick={() => setModal({ mode: "view", exporter: e })}>
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Delete"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(e.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  No exporters match this filter.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Card>

      {/* Add */}
      <Modal open={modal?.mode === "add"} onClose={() => setModal(null)} wide>
        <div className="border-b border-border px-6 py-5">
          <h2 className="text-lg font-semibold text-foreground">Register Pakistani Exporter</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Capture statutory registrations, business profile, financials and the facility request.
          </p>
        </div>
        <div className="p-6">
          <CrpForm
            sections={EXPORTER_SECTIONS}
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
              <h2 className="text-lg font-semibold text-foreground">Edit Exporter — {modal.exporter.fields.legalName}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {modal.exporter.status === "draft"
                  ? "This exporter is a draft. Publish to onboard the exporter."
                  : "Update exporter registration."}
              </p>
            </div>
            <div className="p-6">
              <CrpForm
                sections={EXPORTER_SECTIONS}
                initial={modal.exporter.fields}
                submitLabel={modal.exporter.status === "draft" ? "Publish Exporter" : "Save Changes"}
                draftLabel={modal.exporter.status === "draft" ? "Save Draft" : undefined}
                onSubmit={handleEditPublish}
                onDraft={modal.exporter.status === "draft" ? handleEditSave : undefined}
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
            <h2 className="mt-4 text-lg font-semibold text-foreground">Exporter Published</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {modal.exporter.fields.legalName} has been added to the exporter registry.
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
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60">Exporter Profile</p>
              <h2 className="mt-1 text-xl font-bold">{modal.exporter.fields.legalName}</h2>
              <p className="mt-0.5 text-sm text-white/70">
                {modal.exporter.fields.sector} — NTN {modal.exporter.fields.ntn}
              </p>
            </div>
            <div className="flex flex-col gap-6 p-6">
              <FieldsDetail sections={EXPORTER_SECTIONS} fields={modal.exporter.fields} />
              <div className="flex justify-end gap-3 border-t border-border pt-4">
                <Button variant="outline" onClick={() => setModal({ mode: "edit", exporter: modal.exporter })}>
                  <Pencil className="size-4" />
                  Edit
                </Button>
                {modal.exporter.status === "draft" ? (
                  <Button onClick={() => handlePublishFromRow(modal.exporter.id)}>
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
