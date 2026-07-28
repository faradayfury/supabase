import { Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'ui'
import { Admonition } from 'ui-patterns/admonition'
import { Input } from 'ui-patterns/DataInputs/Input'
import { TimestampInfo } from 'ui-patterns/TimestampInfo'

import { UNIT_NAME_PLURAL_LOWER } from '@/lib/constants/workers'
import { useWorkerSecrets, workerSecretsMockState } from '@/state/workers-secrets-mock-state'

export const WorkerSecrets = () => {
  const secrets = useWorkerSecrets()
  const [search, setSearch] = useState('')
  const [name, setName] = useState('')
  const [value, setValue] = useState('')

  const filtered = useMemo(
    () => secrets.filter((secret) => secret.name.toLowerCase().includes(search.toLowerCase())),
    [secrets, search]
  )

  const nameError = name.trim().toUpperCase().startsWith('SUPABASE_')
    ? 'Names starting with SUPABASE_ are reserved'
    : undefined

  const handleAdd = () => {
    if (!name.trim() || !value.trim() || nameError) return
    workerSecretsMockState.addSecret(name, value)
    toast.success(`Added secret "${name.trim()}"`)
    setName('')
    setValue('')
  }

  return (
    <div className="flex flex-col gap-6">
      <Admonition
        type="default"
        title="Environment secrets"
        description={`Secrets are environment variables preloaded into every ${UNIT_NAME_PLURAL_LOWER.replace(
          /s$/,
          ''
        )} at deploy time. At alpha they mirror your project secrets — platform-wide secrets are coming.`}
      />

      <Card>
        <CardHeader>
          <CardTitle>Add a new secret</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-start">
          <div className="flex-1">
            <Input
              size="small"
              placeholder="NAME"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            {nameError && <p className="mt-1 text-xs text-destructive">{nameError}</p>}
          </div>
          <div className="flex-1">
            <Input
              reveal
              size="small"
              placeholder="value"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button onClick={handleAdd} disabled={!name.trim() || !value.trim() || !!nameError}>
            Add secret
          </Button>
        </CardFooter>
      </Card>

      <div className="flex flex-col gap-3">
        <Input
          size="tiny"
          className="w-full md:w-64"
          icon={<Search size={14} />}
          placeholder="Search secrets"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Digest</TableHead>
                <TableHead>Last updated</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <p className="text-sm text-foreground-light">No secrets found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((secret) => (
                  <TableRow key={secret.id}>
                    <TableCell className="flex items-center gap-2 font-mono text-xs">
                      {secret.name}
                      {secret.reserved && <Badge variant="default">Reserved</Badge>}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-foreground-lighter">
                      ••••{secret.digest}
                    </TableCell>
                    <TableCell>
                      <TimestampInfo
                        className="text-xs text-foreground-light"
                        utcTimestamp={secret.updatedAt}
                      />
                    </TableCell>
                    <TableCell>
                      {!secret.reserved && (
                        <Button
                          variant="text"
                          size="tiny"
                          icon={<Trash2 />}
                          onClick={() => {
                            workerSecretsMockState.removeSecret(secret.id)
                            toast.success(`Removed secret "${secret.name}"`)
                          }}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  )
}
