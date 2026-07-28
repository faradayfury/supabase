import { useParams } from 'common'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Check, Eye, ScrollText } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'
import { Button } from 'ui'
import { Chart, ChartMetric } from 'ui-patterns/Chart'

import { getLinesSinceLastDeploy } from './workerSessions'
import { WorkerActorBadge, WorkerStateBadge } from '../WorkerBadges'
import type { Worker } from '../Workers.types'
import { ConstrainedIntegrationTabScaffold } from '@/components/interfaces/Integrations/ConstrainedIntegrationTabScaffold'

dayjs.extend(relativeTime)

const isErrorLine = (line: Worker['logs'][number]) =>
  (line.kind === 'request' && (line.status ?? 0) >= 500) ||
  (line.kind === 'lifecycle' && line.state === 'errored')

/**
 * Aggregate summary for a worker (Cloudflare-Workers-inspired, alpha-honest):
 * a "Last 24 hours" metric row, errors since last deploy, and the single
 * active deployment. Deep log exploration lives in the Logs tab / Logs
 * Explorer. No CPU/wall-time metrics or version history at alpha.
 */
export const WorkerOverviewTab = ({ worker }: { worker: Worker }) => {
  const { ref } = useParams()
  const base = `/project/${ref}/workers/${worker.slug}`

  // Derived from the mock log buffer — every line in it is recent, so the
  // 24h framing holds for the demo.
  const metrics = useMemo(() => {
    const requests = worker.logs.filter((line) => line.kind === 'request')
    const errors = worker.logs.filter(isErrorLine).length
    const avgDuration =
      requests.length > 0
        ? Math.round(
            requests.reduce((sum, line) => sum + (line.durationMs ?? 0), 0) / requests.length
          )
        : undefined
    return { requests: requests.length, errors, avgDuration }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [worker.logs])

  const sinceDeploy = useMemo(() => {
    const lines = getLinesSinceLastDeploy(worker)
    return {
      requests: lines.filter((line) => line.kind === 'request').length,
      errors: lines.filter(isErrorLine).length,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [worker.logs, worker.lifecycle])

  const hasErrorsSinceDeploy = sinceDeploy.errors > 0

  return (
    <ConstrainedIntegrationTabScaffold>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        {/* Last 24 hours */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <h3 className="text-sm text-foreground">Metrics</h3>
            <span className="rounded-md border border-default bg-surface-100 px-1.5 py-0.5 text-xs text-foreground-lighter">
              Last 24 hours
            </span>
          </div>
          <Chart className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-default bg-border sm:grid-cols-4">
            <div className="bg-surface-100 p-4">
              <ChartMetric label="Requests" value={metrics.requests.toLocaleString()} />
            </div>
            <div className="bg-surface-100 p-4">
              <ChartMetric
                label="Errors"
                value={metrics.errors.toLocaleString()}
                status={metrics.errors > 0 ? 'negative' : 'default'}
              />
            </div>
            <div className="bg-surface-100 p-4">
              <ChartMetric
                label="Avg duration"
                value={metrics.avgDuration !== undefined ? `${metrics.avgDuration}ms` : '—'}
              />
            </div>
            <div className="bg-surface-100 p-4">
              <ChartMetric label="Instances" value={worker.instances} />
            </div>
          </Chart>
        </section>

        {/* Errors since last deploy (mirrors the Edge Functions pattern) */}
        <section>
          <h3 className="mb-4 text-sm text-foreground">Errors</h3>
          <div className="flex items-center justify-between gap-4 rounded-md border border-default bg-surface-100 px-4 py-3">
            <div className="flex items-center gap-3">
              {hasErrorsSinceDeploy ? (
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive-200 text-destructive">
                  !
                </span>
              ) : sinceDeploy.requests > 0 ? (
                <Check size={18} strokeWidth={1.5} className="shrink-0 text-brand" />
              ) : (
                <Eye size={18} strokeWidth={1.5} className="shrink-0 text-foreground-lighter" />
              )}
              <p className="text-sm text-foreground-light">
                {hasErrorsSinceDeploy
                  ? `${sinceDeploy.errors} ${sinceDeploy.errors === 1 ? 'error' : 'errors'} since last deploy — check the logs.`
                  : `There ${sinceDeploy.requests === 1 ? 'has been 1 request' : `have been ${sinceDeploy.requests} requests`} since last deploy and no errors.`}
              </p>
            </div>
            <Button asChild variant="default" icon={<ScrollText />}>
              <Link href={`${base}/logs`}>View logs</Link>
            </Button>
          </div>
        </section>

        {/* Active deployment — single version at alpha: no history, no
            rollback (delete + redeploy is the only versioning). */}
        <section>
          <h3 className="mb-4 text-sm text-foreground">Active deployment</h3>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-md border border-default bg-surface-100 px-4 py-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-foreground-lighter">Deployed</p>
              <p className="mt-0.5 text-sm text-foreground">{dayjs(worker.createdAt).fromNow()}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-foreground-lighter">By</p>
              <p className="mt-0.5 text-sm text-foreground">
                <WorkerActorBadge actor={worker.createdBy} />
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-foreground-lighter">State</p>
              <p className="mt-0.5 text-sm">
                <WorkerStateBadge state={worker.state} />
              </p>
            </div>
            <p className="ml-auto text-xs text-foreground-lighter">
              Single active version — deployment history and rollback arrive after alpha.
            </p>
          </div>
        </section>
      </div>
    </ConstrainedIntegrationTabScaffold>
  )
}
