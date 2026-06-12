"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import {
  NO_PERMS,
  deleteUser,
  loadRoles,
  loadUsers,
  newId,
  saveUser,
  type Permissions,
  type PortalUser,
  type RoleDef,
  type Session,
} from "@/lib/store"
import { Plus, Trash2, Landmark, Ship, ShieldCheck } from "lucide-react"

const PERM_LABELS: { key: keyof Permissions; label: string }[] = [
  { key: "manageBuyers", label: "International Buyers" },
  { key: "manageExporters", label: "Exporters" },
  { key: "manageUsers", label: "Users & Permissions" },
  { key: "manageSettings", label: "Settings" },
  { key: "viewTemplates", label: "Templates" },
  { key: "viewIntelligence", label: "Business Intelligence" },
]

const selectClasses =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"

export function UsersPage({ session }: { session: Session }) {
  const [users, setUsers] = useState<PortalUser[]>([])
  const [roles, setRoles] = useState<RoleDef[]>([])
  const [open, setOpen] = useState(false)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [type, setType] = useState<"exim" | "exporter">("exim")
  const [role, setRole] = useState("")
  const [company, setCompany] = useState("")
  const [perms, setPerms] = useState<Permissions>({ ...NO_PERMS })
  const [error, setError] = useState("")

  useEffect(() => {
    setUsers(loadUsers())
    setRoles(loadRoles())
  }, [])

  function refresh() {
    setUsers(loadUsers())
    setRoles(loadRoles())
  }

  function resetForm() {
    const defaultRole = roles[0]
    setName("")
    setEmail("")
    setPassword("")
    setType("exim")
    setRole(defaultRole?.name ?? "")
    setCompany("")
    setPerms(defaultRole ? { ...defaultRole.perms } : { ...NO_PERMS })
    setError("")
  }

  function applyRole(next: string) {
    setRole(next)
    const def = roles.find((r) => r.name === next)
    setPerms(def ? { ...def.perms } : { ...NO_PERMS })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      setError("A user with this email already exists.")
      return
    }
    const user: PortalUser = {
      id: newId("u"),
      name: name.trim(),
      email: email.trim(),
      password,
      type,
      role: type === "exporter" ? "Exporter" : role,
      perms: type === "exporter" ? { ...NO_PERMS } : perms,
      company: type === "exporter" ? company.trim() : undefined,
    }
    saveUser(user)
    refresh()
    setOpen(false)
    resetForm()
  }

  function handleDelete(id: string) {
    deleteUser(id)
    refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {users.length} portal users — control who can run the system and what they can do
        </p>
        <Button
          onClick={() => {
            resetForm()
            setOpen(true)
          }}
        >
          <Plus className="size-4" />
          Add User
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>User</TableHead>
              <TableHead>Portal</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => {
              const granted = PERM_LABELS.filter((p) => u.perms[p.key])
              return (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">{u.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {u.email}
                      {u.company ? ` · ${u.company}` : ""}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1">
                      {u.type === "exim" ? <Landmark className="size-3" /> : <Ship className="size-3" />}
                      {u.type === "exim" ? "EXIM Bank" : "Exporter"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.role}</TableCell>
                  <TableCell>
                    {u.type === "exporter" ? (
                      <span className="text-xs text-muted-foreground">Buyer profiles (QR unlock)</span>
                    ) : granted.length === PERM_LABELS.length ? (
                      <Badge className="gap-1 bg-emerald-600 text-white">
                        <ShieldCheck className="size-3" />
                        Full access
                      </Badge>
                    ) : granted.length === 0 ? (
                      <span className="text-xs text-muted-foreground">View only</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {granted.map((g) => g.label.replace("Manage ", "")).join(", ")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive disabled:opacity-40"
                      disabled={u.id === session.userId}
                      title={u.id === session.userId ? "You cannot delete your own account" : "Delete user"}
                      onClick={() => handleDelete(u.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} wide>
        <div className="border-b border-border px-6 py-5">
          <h2 className="text-lg font-semibold text-foreground">Add Portal User</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create an EXIM staff account with permissions, or an exporter account for the Exporter Portal.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="u-name">Full Name</Label>
              <Input id="u-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="u-email">Email</Label>
              <Input id="u-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="u-pass">Password</Label>
              <Input
                id="u-pass"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Min 6 characters"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="u-type">Portal Type</Label>
              <select
                id="u-type"
                className={selectClasses}
                value={type}
                onChange={(e) => setType(e.target.value as "exim" | "exporter")}
              >
                <option value="exim">EXIM Bank Staff</option>
                <option value="exporter">Exporter</option>
              </select>
            </div>
            {type === "exim" ? (
              <div className="flex flex-col gap-2">
                <Label htmlFor="u-role">Role</Label>
                <select id="u-role" className={selectClasses} value={role} onChange={(e) => applyRole(e.target.value)}>
                  {roles.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Roles are managed in Settings. Selecting one pre-fills the permissions below.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Label htmlFor="u-company">Exporter Company</Label>
                <Input
                  id="u-company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Crescent Textiles Ltd."
                  required
                />
              </div>
            )}
          </div>

          {type === "exim" ? (
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Permissions</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {PERM_LABELS.map((p) => (
                  <label
                    key={p.key}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50"
                  >
                    <input
                      type="checkbox"
                      className="size-4 accent-[oklch(0.36_0.11_255)]"
                      checked={perms[p.key]}
                      onChange={(e) => setPerms((prev) => ({ ...prev, [p.key]: e.target.checked }))}
                    />
                    {p.label}
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              Exporter accounts can browse international buyer profiles and unlock credit ratings using the QR
              code and access code issued by EXIM Bank.
            </div>
          )}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex gap-3 border-t border-border pt-4">
            <Button type="submit">Create User</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
