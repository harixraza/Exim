"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Modal } from "@/components/modal"
import {
  NO_PERMS,
  deleteRole,
  loadBuyers,
  loadExporters,
  loadRoles,
  loadScans,
  loadUsers,
  newId,
  resetDemoData,
  saveRole,
  type Permissions,
  type RoleDef,
  type Session,
} from "@/lib/store"
import { Download, RotateCcw, Plus, Pencil, Trash2, Lock, ShieldCheck } from "lucide-react"

export const PERM_LABELS: { key: keyof Permissions; label: string; hint: string }[] = [
  { key: "manageBuyers", label: "International Buyers", hint: "Add, view and delete buyer profiles & QR codes" },
  { key: "manageExporters", label: "Exporters", hint: "Register and manage Pakistani exporters" },
  { key: "manageUsers", label: "Users & Permissions", hint: "Create portal users and assign roles" },
  { key: "manageSettings", label: "Settings", hint: "Roles, data management and system settings" },
  { key: "viewTemplates", label: "Templates", hint: "Design how unlocked QR profiles look" },
  { key: "viewIntelligence", label: "Business Intelligence", hint: "Scan analytics and reports" },
]

export function SettingsPage({ session }: { session: Session }) {
  const [roles, setRoles] = useState<RoleDef[]>([])
  const [roleModal, setRoleModal] = useState<{ role?: RoleDef } | null>(null)

  useEffect(() => {
    setRoles(loadRoles())
  }, [])

  const initials = session.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  function refreshRoles() {
    setRoles(loadRoles())
  }

  function handleDeleteRole(id: string) {
    deleteRole(id)
    refreshRoles()
  }

  function handleExport() {
    const data = {
      exportedAt: new Date().toISOString(),
      buyers: loadBuyers(),
      exporters: loadExporters(),
      users: loadUsers().map(({ password, ...u }) => u),
      roles: loadRoles(),
      scans: loadScans(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "exim-crp-data.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleReset() {
    if (window.confirm("Reset all portal data? This restores the original seed buyers, exporters, users, roles and scans.")) {
      resetDemoData()
      window.location.reload()
    }
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <Card className="p-6">
        <h2 className="text-base font-semibold text-foreground">Profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">Your admin account details.</p>
        <Separator className="my-5" />
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarFallback className="bg-primary text-lg text-primary-foreground">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-foreground">{session.name}</p>
            <p className="text-xs text-muted-foreground">{session.email}</p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" defaultValue={session.name} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="settings-email">Email</Label>
            <Input id="settings-email" type="email" defaultValue={session.email} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" defaultValue={session.role} disabled />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="dept">Department</Label>
            <Input id="dept" defaultValue="Credit Risk" />
          </div>
        </div>
        <div className="mt-5">
          <Button>Save Changes</Button>
        </div>
      </Card>

      {/* Roles manager */}
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">User Roles</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create roles for EXIM staff and choose which sections of the admin console each role can see and
              manage. Roles appear in the Users &amp; Permissions page when creating accounts.
            </p>
          </div>
          <Button onClick={() => setRoleModal({})}>
            <Plus className="size-4" />
            Create Role
          </Button>
        </div>
        <Separator className="my-5" />
        <div className="flex flex-col gap-3">
          {roles.map((r) => {
            const granted = PERM_LABELS.filter((p) => r.perms[p.key])
            return (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{r.name}</p>
                    {r.builtIn ? (
                      <Badge variant="outline" className="gap-1 text-muted-foreground">
                        <Lock className="size-3" />
                        Built-in
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Custom</Badge>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {granted.length === PERM_LABELS.length ? (
                      <Badge className="gap-1 bg-emerald-600 text-white">
                        <ShieldCheck className="size-3" />
                        Full access
                      </Badge>
                    ) : granted.length === 0 ? (
                      <span className="text-xs text-muted-foreground">Dashboard only</span>
                    ) : (
                      granted.map((g) => (
                        <Badge key={g.key} variant="secondary" className="text-[11px] font-normal">
                          {g.label}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setRoleModal({ role: r })}>
                    <Pencil className="size-3.5" />
                    Edit
                  </Button>
                  {!r.builtIn ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteRole(r.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-base font-semibold text-foreground">System Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">Basic preferences for the portal.</p>
        <Separator className="my-5" />
        <div className="flex flex-col gap-4">
          <SettingRow title="Email Notifications" desc="Receive alerts when new ratings are assigned." />
          <SettingRow title="Two-Factor Authentication" desc="Add an extra layer of security to your account." />
          <SettingRow title="Auto-Expire Ratings" desc="Automatically flag ratings past their validity date." />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-base font-semibold text-foreground">Data Management</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          All portal data is stored locally in your browser. Export it as JSON or reset to the original seed
          dataset.
        </p>
        <Separator className="my-5" />
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="size-4" />
            Export Data (JSON)
          </Button>
          <Button variant="outline" className="text-destructive hover:text-destructive" onClick={handleReset}>
            <RotateCcw className="size-4" />
            Reset Portal Data
          </Button>
        </div>
      </Card>

      <Modal open={!!roleModal} onClose={() => setRoleModal(null)} wide>
        {roleModal ? (
          <RoleForm
            role={roleModal.role}
            onSaved={() => {
              refreshRoles()
              setRoleModal(null)
            }}
            onCancel={() => setRoleModal(null)}
          />
        ) : null}
      </Modal>
    </div>
  )
}

function RoleForm({
  role,
  onSaved,
  onCancel,
}: {
  role?: RoleDef
  onSaved: () => void
  onCancel: () => void
}) {
  const [name, setName] = useState(role?.name ?? "")
  const [perms, setPerms] = useState<Permissions>(role ? { ...role.perms } : { ...NO_PERMS })
  const [error, setError] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const others = loadRoles().filter((r) => r.id !== role?.id)
    if (others.some((r) => r.name.toLowerCase() === name.trim().toLowerCase())) {
      setError("A role with this name already exists.")
      return
    }
    saveRole({
      id: role?.id ?? newId("r"),
      name: name.trim(),
      perms,
      builtIn: role?.builtIn,
    })
    onSaved()
  }

  return (
    <div>
      <div className="border-b border-border px-6 py-5">
        <h2 className="text-lg font-semibold text-foreground">{role ? `Edit Role — ${role.name}` : "Create Role"}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tick what this role can see and manage in the EXIM admin console. Dashboard is always visible.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
        <div className="flex flex-col gap-2 sm:max-w-xs">
          <Label htmlFor="r-name">Role Name</Label>
          <Input
            id="r-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={role?.builtIn}
            placeholder="e.g. Rating Analyst"
          />
          {role?.builtIn ? (
            <p className="text-xs text-muted-foreground">Built-in role names cannot be changed.</p>
          ) : null}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Console access</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {PERM_LABELS.map((p) => (
              <label
                key={p.key}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-muted/50"
              >
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 accent-[oklch(0.36_0.11_255)]"
                  checked={perms[p.key]}
                  onChange={(e) => setPerms((prev) => ({ ...prev, [p.key]: e.target.checked }))}
                />
                <span>
                  <span className="block text-sm text-foreground">{p.label}</span>
                  <span className="block text-xs text-muted-foreground">{p.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="flex gap-3 border-t border-border pt-4">
          <Button type="submit">{role ? "Save Changes" : "Create Role"}</Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

function SettingRow({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Button variant="outline" size="sm">
        Configure
      </Button>
    </div>
  )
}
