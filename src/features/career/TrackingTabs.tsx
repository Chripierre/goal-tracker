import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { TextInput } from '@/components/ui/TextInput'
import { localDayKey } from '@/lib/dates'
import { useAppStore } from '@/lib/storage/store'
import { APPLICATION_STATUSES, CONTACT_STATUSES, labelize } from './shared'

export function ApplicationsTab() {
  const applications = useAppStore((s) => s.career.applications)
  const addApplication = useAppStore((s) => s.addApplication)
  const updateApplication = useAppStore((s) => s.updateApplication)
  const deleteApplication = useAppStore((s) => s.deleteApplication)

  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [date, setDate] = useState(localDayKey(new Date()))

  function add() {
    if (!company.trim() || !role.trim()) return
    addApplication({
      company: company.trim(),
      role: role.trim(),
      ...(date ? { appliedOn: date } : {}),
      status: 'applied',
    })
    setCompany('')
    setRole('')
  }

  return (
    <div>
      <Card className="mb-4 flex flex-wrap items-center gap-2 p-3">
        <TextInput value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" aria-label="Company" className="min-w-40 flex-1" />
        <TextInput value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" aria-label="Role" className="min-w-40 flex-1" />
        <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Applied on" />
        <Button onClick={add} disabled={!company.trim() || !role.trim()}>
          Log application
        </Button>
      </Card>
      {applications.length === 0 ? (
        <Card className="px-6 py-10 text-center">
          <p className="text-sm text-text-2">
            No applications logged yet. This list is personal — it lives only in your browser.
          </p>
        </Card>
      ) : (
        <Card className="divide-y divide-border-subtle">
          {applications.map((a) => (
            <div key={a.id} className="group flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {a.company} — {a.role}
                </p>
                <p className="text-xs text-text-3">{a.appliedOn ?? 'no date'}</p>
              </div>
              <Select
                value={a.status}
                onChange={(e) => updateApplication(a.id, { status: e.target.value })}
                aria-label={`Status for ${a.company}`}
              >
                {APPLICATION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {labelize(s)}
                  </option>
                ))}
              </Select>
              <button
                type="button"
                aria-label={`Delete application at ${a.company}`}
                onClick={() => deleteApplication(a.id)}
                className="rounded-md p-1 text-text-3 opacity-0 outline-none transition-all group-hover:opacity-100 hover:text-danger focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}

export function NetworkTab() {
  const contacts = useAppStore((s) => s.career.contacts)
  const addContact = useAppStore((s) => s.addContact)
  const updateContact = useAppStore((s) => s.updateContact)
  const deleteContact = useAppStore((s) => s.deleteContact)

  const [name, setName] = useState('')
  const [context, setContext] = useState('')

  function add() {
    if (!name.trim()) return
    addContact({
      name: name.trim(),
      ...(context.trim() ? { context: context.trim() } : {}),
      status: 'not_contacted',
    })
    setName('')
    setContext('')
  }

  return (
    <div>
      <p className="mb-3 text-xs text-text-3">
        Personal networking list — stored only in this browser, never in the public repo.
      </p>
      <Card className="mb-4 flex flex-wrap items-center gap-2 p-3">
        <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" aria-label="Contact name" className="min-w-40 flex-1" />
        <TextInput value={context} onChange={(e) => setContext(e.target.value)} placeholder="Context (program, company, why them)" aria-label="Context" className="min-w-56 flex-[2]" />
        <Button onClick={add} disabled={!name.trim()}>
          Add contact
        </Button>
      </Card>
      {contacts.length === 0 ? (
        <Card className="px-6 py-10 text-center">
          <p className="text-sm text-text-2">No contacts yet.</p>
        </Card>
      ) : (
        <Card className="divide-y divide-border-subtle">
          {contacts.map((c) => (
            <div key={c.id} className="group flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{c.name}</p>
                {c.context && <p className="text-xs text-text-3">{c.context}</p>}
              </div>
              <Select
                value={c.status}
                onChange={(e) => updateContact(c.id, { status: e.target.value })}
                aria-label={`Status for ${c.name}`}
              >
                {CONTACT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {labelize(s)}
                  </option>
                ))}
              </Select>
              <button
                type="button"
                aria-label={`Delete contact ${c.name}`}
                onClick={() => deleteContact(c.id)}
                className="rounded-md p-1 text-text-3 opacity-0 outline-none transition-all group-hover:opacity-100 hover:text-danger focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
