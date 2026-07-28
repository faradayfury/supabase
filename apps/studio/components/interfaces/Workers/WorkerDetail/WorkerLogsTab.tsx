import { useParams } from 'common'
import { ExternalLink, Search } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'ui'
import { Input } from 'ui-patterns/DataInputs/Input'

import { WorkerLogSessions, type WorkerLogKindFilter } from './WorkerLogSessions'
import type { Worker } from '../Workers.types'
import { ConstrainedIntegrationTabScaffold } from '@/components/interfaces/Integrations/ConstrainedIntegrationTabScaffold'
import { LOG_DESTINATION } from '@/lib/constants/workers'

const KIND_FILTERS: { value: WorkerLogKindFilter; label: string }[] = [
  { value: 'all', label: 'All lines' },
  { value: 'request', label: 'Requests' },
  { value: 'stdout', label: 'Worker output' },
  { value: 'lifecycle', label: 'Lifecycle' },
]

export const WorkerLogsTab = ({ worker }: { worker: Worker }) => {
  const { ref } = useParams()
  const [search, setSearch] = useState('')
  const [kind, setKind] = useState<WorkerLogKindFilter>('all')

  return (
    <ConstrainedIntegrationTabScaffold>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            size="tiny"
            className="w-full md:w-56"
            icon={<Search size={14} />}
            placeholder="Search log lines"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select value={kind} onValueChange={(value) => setKind(value as WorkerLogKindFilter)}>
            <SelectTrigger size="tiny" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KIND_FILTERS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button asChild variant="default" icon={<ExternalLink />} className="ml-auto">
            <Link href={`/project/${ref}/logs/explorer?q=${worker.slug}`}>
              Open in Logs Explorer
            </Link>
          </Button>
        </div>

        <p className="text-sm text-foreground-light">
          Each run is grouped as a session — a new group starts whenever the worker deploys or
          resumes, with lifecycle events inline. Full history streams to {LOG_DESTINATION}.
        </p>

        <WorkerLogSessions worker={worker} search={search} kind={kind} />
      </div>
    </ConstrainedIntegrationTabScaffold>
  )
}
