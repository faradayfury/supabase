import { useParams } from 'common'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'
import { Button, cn } from 'ui'

import { WorkerLogSessions } from './WorkerLogSessions'
import { groupLogsBySession } from './workerSessions'
import type { Worker } from '../Workers.types'
import { ConstrainedIntegrationTabScaffold } from '@/components/interfaces/Integrations/ConstrainedIntegrationTabScaffold'
import { LOG_DESTINATION } from '@/lib/constants/workers'

export const WorkerLogsTab = ({ worker }: { worker: Worker }) => {
  const { ref } = useParams()

  // High-level summary of the current run. Deep log analysis lives in the Logs
  // Explorer (unified logs) — we just surface a couple of headline numbers here.
  const lastSession = useMemo(
    // eslint-disable-next-line react-hooks/exhaustive-deps
    () => groupLogsBySession(worker)[0],
    [worker.logs, worker.lifecycle]
  )
  const requests = lastSession?.lines.filter((line) => line.kind === 'request').length ?? 0
  const errors =
    lastSession?.lines.filter(
      (line) =>
        (line.kind === 'request' && (line.status ?? 0) >= 500) ||
        (line.kind === 'lifecycle' && line.state === 'errored')
    ).length ?? 0

  return (
    <ConstrainedIntegrationTabScaffold>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-md border border-default bg-surface-100 px-4 py-3">
          <SummaryStat label="Requests" value={requests} sub="current run" />
          <SummaryStat label="Errors" value={errors} sub="current run" isError={errors > 0} />
          <Button asChild variant="default" icon={<ExternalLink />} className="ml-auto">
            <Link href={`/project/${ref}/logs/explorer?q=${worker.slug}`}>Open in Logs Explorer</Link>
          </Button>
        </div>

        <div>
          <h3 className="text-sm text-foreground">Sessions</h3>
          <p className="mt-1 text-sm text-foreground-light">
            Each run is grouped as a session — a new group starts whenever the worker deploys or
            resumes, and lifecycle events show inline. Full history streams to {LOG_DESTINATION}.
          </p>
        </div>
        <WorkerLogSessions worker={worker} />
      </div>
    </ConstrainedIntegrationTabScaffold>
  )
}

const SummaryStat = ({
  label,
  value,
  sub,
  isError = false,
}: {
  label: string
  value: number
  sub?: string
  isError?: boolean
}) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-foreground-lighter">{label}</p>
    <p className={cn('text-lg tabular-nums', isError ? 'text-destructive' : 'text-foreground')}>
      {value.toLocaleString()}
    </p>
    {sub && <p className="text-xs text-foreground-lighter">{sub}</p>}
  </div>
)
