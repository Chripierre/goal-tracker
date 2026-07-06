import { useRef, useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { TextInput } from '@/components/ui/TextInput'
import { localDayKey } from '@/lib/dates'
import { mapLegacyState } from '@/lib/career/legacy'
import { fetchAuthenticatedUser } from '@/lib/github/client'
import { useGithubToken } from '@/lib/github/token'
import { useAppStore } from '@/lib/storage/store'

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold">{title}</h2>
      {description && <p className="mt-1 max-w-xl text-xs text-text-3">{description}</p>}
      <div className="mt-4">{children}</div>
    </Card>
  )
}

export function SettingsPage() {
  const settings = useAppStore((s) => s.settings)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const importState = useAppStore((s) => s.importState)
  const resetState = useAppStore((s) => s.resetState)
  const applyLegacyImport = useAppStore((s) => s.applyLegacyImport)
  const token = useGithubToken((s) => s.token)
  const setToken = useGithubToken((s) => s.setToken)

  const [displayName, setDisplayName] = useState(settings.displayName)
  const [ghUsername, setGhUsername] = useState(settings.ghUsername)
  const [lcUsername, setLcUsername] = useState(settings.lcUsername)
  const [tokenInput, setTokenInput] = useState(token)
  const [tokenStatus, setTokenStatus] = useState('')
  const [dataStatus, setDataStatus] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const legacyRef = useRef<HTMLInputElement>(null)

  function importLegacy(file: File) {
    file
      .text()
      .then((text) => {
        const mapped = mapLegacyState(JSON.parse(text))
        if (!mapped) {
          setDataStatus('That file does not look like cp_tracker_v1 data.')
          return
        }
        if (!window.confirm(`${mapped.summary}\n\nMerge into your current data?`)) return
        applyLegacyImport(mapped)
        setDataStatus(mapped.summary)
      })
      .catch(() => setDataStatus('Could not read that file as JSON.'))
  }

  function saveProfile() {
    updateSettings({ displayName: displayName.trim() || 'there' })
  }

  function saveGithub() {
    updateSettings({ ghUsername: ghUsername.trim() })
    const trimmed = tokenInput.trim()
    setToken(trimmed)
    if (!trimmed) {
      setTokenStatus('Token removed.')
      return
    }
    setTokenStatus('Checking token…')
    fetchAuthenticatedUser(trimmed)
      .then((u) => setTokenStatus(`Token OK — authenticated as ${u.login}.`))
      .catch((e: unknown) =>
        setTokenStatus(e instanceof Error ? `Token check failed: ${e.message}` : 'Token check failed.'),
      )
  }

  function exportData() {
    const { schemaVersion, settings: st, events, achievements, todos } = useAppStore.getState()
    const blob = new Blob(
      [JSON.stringify({ schemaVersion, settings: st, events, achievements, todos }, null, 2)],
      { type: 'application/json' },
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `goal-tracker-backup-${localDayKey(new Date())}.json`
    a.click()
    URL.revokeObjectURL(url)
    setDataStatus('Backup downloaded. The GitHub token is never included.')
  }

  function importData(file: File) {
    file
      .text()
      .then((text) => {
        const data: unknown = JSON.parse(text)
        if (!data || typeof data !== 'object' || !('schemaVersion' in data)) {
          setDataStatus('That file does not look like a Goal Tracker backup.')
          return
        }
        if (!window.confirm('Replace ALL current data with this backup?')) return
        importState(data)
        setDataStatus('Backup imported.')
      })
      .catch(() => setDataStatus('Could not read that file as JSON.'))
  }

  function resetAll() {
    if (!window.confirm('Delete ALL data (assignments history, todos, achievements)? This cannot be undone.'))
      return
    resetState()
    setDataStatus('All data reset.')
  }

  return (
    <>
      <PageHeader title="Settings" description="Profile, integrations, and data controls." />
      <div className="flex flex-col gap-4">
        <Section title="Profile">
          <div className="flex flex-wrap items-center gap-2">
            <TextInput
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              aria-label="Display name"
              placeholder="Display name"
              className="min-w-56"
            />
            <Button onClick={saveProfile}>Save</Button>
          </div>
        </Section>

        <Section
          title="GitHub"
          description="The token is optional and stays in this browser only — its own storage slot, never part of exports or future sync. Use a fine-grained token; read-only access to public data is enough for the heatmap and higher API limits."
        >
          <div className="flex max-w-xl flex-col gap-2">
            <TextInput
              value={ghUsername}
              onChange={(e) => setGhUsername(e.target.value)}
              aria-label="GitHub username"
              placeholder="GitHub username"
            />
            <TextInput
              type="password"
              value={tokenInput}
              onChange={(e) => {
                setTokenInput(e.target.value)
                setTokenStatus('')
              }}
              aria-label="GitHub personal access token"
              placeholder="Personal access token (optional)"
            />
            <div className="flex items-center gap-2">
              <Button onClick={saveGithub}>Save GitHub settings</Button>
              {token && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setToken('')
                    setTokenInput('')
                    setTokenStatus('Token removed.')
                  }}
                >
                  Remove token
                </Button>
              )}
            </div>
            {tokenStatus && <p className="text-xs text-text-2">{tokenStatus}</p>}
          </div>
        </Section>

        <Section title="LeetCode" description="Used by the LeetCode module (Phase 6).">
          <div className="flex flex-wrap items-center gap-2">
            <TextInput
              value={lcUsername}
              onChange={(e) => setLcUsername(e.target.value)}
              aria-label="LeetCode username"
              placeholder="LeetCode username"
              className="min-w-56"
            />
            <Button onClick={() => updateSettings({ lcUsername: lcUsername.trim() })}>Save</Button>
          </div>
        </Section>

        <Section
          title="Data"
          description="Everything lives in this browser's storage. Export a JSON backup to move between devices until automatic sync lands (Phase 4b)."
        >
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={exportData}>Export backup</Button>
            <Button variant="ghost" onClick={() => fileRef.current?.click()}>
              Import backup
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              aria-label="Import backup file"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) importData(f)
                e.target.value = ''
              }}
            />
            <Button variant="ghost" onClick={() => legacyRef.current?.click()}>
              Import legacy tracker
            </Button>
            <input
              ref={legacyRef}
              type="file"
              accept="application/json,.json,.txt"
              className="hidden"
              aria-label="Import legacy cp_tracker_v1 file"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) importLegacy(f)
                e.target.value = ''
              }}
            />
            <Button variant="danger" onClick={resetAll}>
              Reset all data
            </Button>
          </div>
          <p className="mt-2 text-xs text-text-3">
            Legacy import: in the OLD tracker's browser tab run
            copy(localStorage.getItem('cp_tracker_v1')) in DevTools, save it as a .json
            file, and import it here — checkmarks, statuses, applications, and custom
            tasks carry over.
          </p>
          {dataStatus && <p className="mt-2 text-xs text-text-2">{dataStatus}</p>}
        </Section>
      </div>
    </>
  )
}
