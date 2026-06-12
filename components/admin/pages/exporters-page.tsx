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
import { EXPORTER_SECTIONS } from "@/lib/fields"
import {
  deleteExporter,
  loadExporters,
  newId,
  saveExporter,
  type ExporterRecord,
} from "@/lib/store"
import { Plus, CheckCircle2, Eye, Trash2 } from "lucide-react"

type ModalState =
  | { mode: "add" }
  | { mode: "saved"; exporter: ExporterRecord }
  | { mode: "view"; exporter: ExporterRecord }
  | null

export function ExportersPage() {
  const [exporters, setExporters] = useState<ExporterRecord[]>([])
  const [modal, setModal] = useState<ModalState>(null)

  useEffect(() => {
    setExporters(loadExporters())
  }, [])

  function refresh() {
    setExporters(loadExporters())
  }

  function handleAdd(fields: Record<string, string>) {
    const exporter: ExporterRecord = {
      id: newId("e"),
      createdAt: new Date().toISOString(),
      fields,
    }
    saveExporter(exporter)
    refresh()
    setModal({ mode: "saved", exporter })
  }

  function handleDelete(id: string) {
    deleteExporter(id)
    refresh()
    setModal(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{exporters.length} Pakistani exporters registered</p>
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
              <TableHead>Product Applied</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exporters.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-medium text-foreground">{e.fields.legalName}</TableCell>
                <TableCell className="text-muted-foreground">{e.fields.sector}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{e.fields.ntn}</TableCell>
                <TableCell className="text-muted-foreground">{e.fields.productApplied || "—"}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      e.fields.status === "Inactive"
                        ? "border-border bg-muted text-muted-foreground"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700"
                    }
                  >
                    {e.fields.status || "Active"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setModal({ mode: "view", exporter: e })}>
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(e.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {exporters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  No exporters yet. Click “Add Exporter” to register the first exporter.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Card>

      {/* Add exporter */}
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
            submitLabel="Save Exporter"
            onSubmit={handleAdd}
            onCancel={() => setModal(null)}
          />
        </div>
      </Modal>

      {/* Saved confirmation */}
      <Modal open={modal?.mode === "saved"} onClose={() => setModal(null)}>
        {modal?.mode === "saved" ? (
          <div className="flex flex-col items-center p-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="size-6 text-emerald-600" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">Exporter Registered</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {modal.exporter.fields.legalName} has been saved to the exporter registry.
            </p>
            <Button className="mt-6 w-full" onClick={() => setModal(null)}>
              Done
            </Button>
          </div>
        ) : null}
      </Modal>

      {/* View exporter */}
      <Modal open={modal?.mode === "view"} onClose={() => setModal(null)} wide>
        {modal?.mode === "view" ? (
          <div>
            <div className="bg-[oklch(0.25_0.07_255)] px-6 py-6 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60">
                Exporter Profile
              </p>
              <h2 className="mt-1 text-xl font-bold">{modal.exporter.fields.legalName}</h2>
              <p className="mt-0.5 text-sm text-white/70">
                {modal.exporter.fields.sector} — NTN {modal.exporter.fields.ntn}
              </p>
            </div>
            <div className="flex flex-col gap-6 p-6">
              <FieldsDetail sections={EXPORTER_SECTIONS} fields={modal.exporter.fields} />
              <div className="flex justify-end gap-3 border-t border-border pt-4">
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(modal.exporter.id)}
                >
                  <Trash2 className="size-4" />
                  Delete Exporter
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
