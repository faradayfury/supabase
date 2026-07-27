import { useParams } from 'common'
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  MoreVertical,
  Pause,
  Play,
  Plus,
  Trash2,
  Zap,
} from 'lucide-react'
import { useRouter } from 'next/router'
import { parseAsString, useQueryState } from 'nuqs'
import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'ui'
import { Input } from 'ui-patterns/DataInputs/Input'

import { DeleteWorkerModal } from './WorkerDetail/DeleteWorkerModal'
import { WorkerAccessBadge, WorkerRuntimeBadge, WorkerStateBadge } from './WorkerBadges'
import type { Worker } from './Workers.types'
import {
  getWorkerRuntime,
  getWorkerSize,
  WORKER_ACCESS_MODES,
  WORKER_RUNTIMES,
  WORKER_STATE_LABELS,
  type WorkerLifecycleState,
} from '@/lib/constants/workers'
import { workersMockState, WORKERS_PROJECT_INSTANCE_CAP } from '@/state/workers-mock-state'

const FILTERABLE_STATES: WorkerLifecycleState[] = [
  'active',
  'suspended',
  'deploying',
  'resuming',
  'draining',
  'errored',
]
const TRANSITIONAL_STATES: WorkerLifecycleState[] = ['deploying', 'resuming', 'draining']
const PAGE_SIZE = 50
const COLUMN_COUNT = 6

type GroupBy = 'none' | 'tag' | 'state' | 'runtime'

export const WorkersList = ({
  workers,
  onCreate,
}: {
  workers: Worker[]
  onCreate: () => void
}) => {
  const router = useRouter()
  const { ref } = useParams()

  const [search, setSearch] = useQueryState('search', parseAsString.withDefault(''))
  const [stateFilter, setStateFilter] = useQueryState('state', parseAsString.withDefault('all'))
  const [accessFilter, setAccessFilter] = useQueryState('access', parseAsString.withDefault('all'))
  const [runtimeFilter, setRuntimeFilter] = useQueryState(
    'runtime',
    parseAsString.withDefault('all')
  )
  const [tagFilter, setTagFilter] = useQueryState('tag', parseAsString.withDefault('all'))
  const [groupBy, setGroupBy] = useQueryState('group', parseAsString.withDefault('none'))

  const [page, setPage] = useState(1)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [pendingDelete, setPendingDelete] = useState<Worker | undefined>(undefined)

  const allTags = useMemo(
    () => Array.from(new Set(workers.flatMap((w) => w.tags))).sort(),
    [workers]
  )

  const summary = useMemo(() => {
    const counts = { active: 0, suspended: 0, errored: 0 }
    let instances = 0
    workers.forEach((w) => {
      instances += w.instances
      if (w.state === 'active') counts.active++
      else if (w.state === 'suspended') counts.suspended++
      else if (w.state === 'errored') counts.errored++
    })
    return { total: workers.length, instances, ...counts }
  }, [workers])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return workers.filter((w) => {
      if (q && !`${w.name} ${w.tags.join(' ')}`.toLowerCase().includes(q)) return false
      if (stateFilter !== 'all' && w.state !== stateFilter) return false
      if (accessFilter !== 'all' && w.access !== accessFilter) return false
      if (runtimeFilter !== 'all' && w.runtime !== runtimeFilter) return false
      if (tagFilter !== 'all' && !w.tags.includes(tagFilter)) return false
      return true
    })
  }, [workers, search, stateFilter, accessFilter, runtimeFilter, tagFilter])

  // Reset to the first page whenever the filtered set changes shape.
  useEffect(() => {
    setPage(1)
  }, [search, stateFilter, accessFilter, runtimeFilter, tagFilter, groupBy])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageStart = (safePage - 1) * PAGE_SIZE
  const pageRows = filtered.slice(pageStart, pageStart + PAGE_SIZE)

  const groups = useMemo(() => {
    if (groupBy === 'none') return []
    const map = new Map<string, Worker[]>()
    filtered.forEach((w) => {
      const key =
        groupBy === 'tag'
          ? (w.tags[0] ?? 'untagged')
          : groupBy === 'state'
            ? WORKER_STATE_LABELS[w.state]
            : getWorkerRuntime(w.runtime).label
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(w)
    })
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [filtered, groupBy])

  const openWorker = (worker: Worker) => router.push(`/project/${ref}/workers/${worker.slug}`)

  const renderRow = (worker: Worker) => {
    const size = getWorkerSize(worker.size)
    return (
      <TableRow key={worker.id} className="cursor-pointer" onClick={() => openWorker(worker)}>
        <TableCell>
          <div className="flex flex-col gap-1">
            <span className="font-medium text-foreground">{worker.name}</span>
            {worker.tags.length > 0 && (
              <span className="flex flex-wrap gap-1">
                {worker.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-sm bg-surface-300 px-1.5 text-[10px] leading-4 text-foreground-lighter"
                  >
                    {tag}
                  </span>
                ))}
              </span>
            )}
          </div>
        </TableCell>
        <TableCell>
          <WorkerStateBadge state={worker.state} />
        </TableCell>
        <TableCell>
          <WorkerRuntimeBadge runtime={worker.runtime} />
        </TableCell>
        <TableCell>
          <WorkerAccessBadge access={worker.access} />
        </TableCell>
        <TableCell className="font-mono text-xs text-foreground-light">
          {size.vcpu} · {size.memory} · {worker.instances} inst
        </TableCell>
        <TableCell onClick={(event) => event.stopPropagation()}>
          <div className="flex items-center justify-end gap-1">
            <StartStopButton worker={worker} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="text" size="tiny" icon={<MoreVertical />} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => openWorker(worker)}>
                  <ChevronRight size={14} className="mr-2" /> Open detail
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={worker.state === 'killed'}
                  onClick={() => workersMockState.simulateTraffic(worker.id)}
                >
                  <Zap size={14} className="mr-2" /> Simulate traffic
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setPendingDelete(worker)}
                >
                  <Trash2 size={14} className="mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Summary strip — fleet health at a glance, independent of filters. */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-default bg-border sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="Workers" value={summary.total} />
        <Stat label="Active" value={summary.active} tone="brand" />
        <Stat label="Suspended" value={summary.suspended} tone="muted" />
        <Stat label="Errored" value={summary.errored} tone="destructive" />
        <Stat
          label="Instances"
          value={summary.instances}
          sub={`alpha cap ${WORKERS_PROJECT_INSTANCE_CAP}`}
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          size="tiny"
          className="w-full md:w-56"
          placeholder="Search name or tag"
          value={search}
          onChange={(event) => setSearch(event.target.value || null)}
        />
        <FilterSelect
          value={stateFilter}
          onChange={setStateFilter}
          placeholder="State"
          allLabel="All states"
        >
          {FILTERABLE_STATES.map((state) => (
            <SelectItem key={state} value={state}>
              {WORKER_STATE_LABELS[state]}
            </SelectItem>
          ))}
        </FilterSelect>
        <FilterSelect
          value={accessFilter}
          onChange={setAccessFilter}
          placeholder="Access"
          allLabel="All access"
        >
          {Object.values(WORKER_ACCESS_MODES).map((mode) => (
            <SelectItem key={mode.id} value={mode.id}>
              {mode.label}
            </SelectItem>
          ))}
        </FilterSelect>
        <FilterSelect
          value={runtimeFilter}
          onChange={setRuntimeFilter}
          placeholder="Runtime"
          allLabel="All runtimes"
        >
          {WORKER_RUNTIMES.map((runtime) => (
            <SelectItem key={runtime.id} value={runtime.id}>
              {runtime.label}
            </SelectItem>
          ))}
        </FilterSelect>
        {allTags.length > 0 && (
          <FilterSelect
            value={tagFilter}
            onChange={setTagFilter}
            placeholder="Tag"
            allLabel="All tags"
          >
            {allTags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </FilterSelect>
        )}

        <Select value={groupBy} onValueChange={(value) => setGroupBy(value as GroupBy)}>
          <SelectTrigger size="tiny" className="w-36">
            <span className="text-foreground-lighter">Group:</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="tag">Tag</SelectItem>
            <SelectItem value="state">State</SelectItem>
            <SelectItem value="runtime">Runtime</SelectItem>
          </SelectContent>
        </Select>

        <span className="ml-auto text-xs text-foreground-light">
          {filtered.length === workers.length
            ? `${workers.length} ${workers.length === 1 ? 'worker' : 'workers'}`
            : `${filtered.length} of ${workers.length}`}
        </span>
        <Button icon={<Plus />} onClick={onCreate}>
          Create worker
        </Button>
      </div>

      <div className="overflow-hidden rounded-md border border-default">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-36">State</TableHead>
              <TableHead className="w-40">Runtime</TableHead>
              <TableHead className="w-28">Access</TableHead>
              <TableHead>Resources</TableHead>
              <TableHead className="w-28" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={COLUMN_COUNT}>
                  <p className="text-sm text-foreground">No workers found</p>
                  <p className="text-sm text-foreground-light">
                    Try adjusting your search or filters.
                  </p>
                </TableCell>
              </TableRow>
            ) : groupBy === 'none' ? (
              pageRows.map(renderRow)
            ) : (
              groups.map(([key, items]) => {
                const isOpen = expandedGroups[key] ?? false
                const active = items.filter((w) => w.state === 'active').length
                return (
                  <Fragment key={key}>
                    <TableRow
                      className="cursor-pointer bg-surface-100 hover:bg-surface-200"
                      onClick={() => setExpandedGroups((prev) => ({ ...prev, [key]: !isOpen }))}
                    >
                      <TableCell colSpan={COLUMN_COUNT}>
                        <div className="flex items-center gap-2 text-sm">
                          {isOpen ? (
                            <ChevronDown size={14} className="text-foreground-lighter" />
                          ) : (
                            <ChevronRight size={14} className="text-foreground-lighter" />
                          )}
                          <span className="font-medium text-foreground">{key}</span>
                          <span className="text-xs text-foreground-lighter">
                            {items.length} {items.length === 1 ? 'worker' : 'workers'} · {active}{' '}
                            active
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                    {isOpen && items.map(renderRow)}
                  </Fragment>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {groupBy === 'none' && filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-foreground-light">
            Showing {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, filtered.length)} of{' '}
            {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="default"
              size="tiny"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="default"
              size="tiny"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {pendingDelete && (
        <DeleteWorkerModal
          worker={pendingDelete}
          visible={!!pendingDelete}
          onCancel={() => setPendingDelete(undefined)}
          onConfirm={() => {
            workersMockState.deleteWorker(pendingDelete.id)
            setPendingDelete(undefined)
          }}
        />
      )}
    </div>
  )
}

const Stat = ({
  label,
  value,
  sub,
  tone = 'default',
}: {
  label: string
  value: number
  sub?: string
  tone?: 'default' | 'brand' | 'muted' | 'destructive'
}) => {
  const dot =
    tone === 'brand'
      ? 'bg-brand'
      : tone === 'muted'
        ? 'bg-foreground-muted'
        : tone === 'destructive'
          ? 'bg-destructive'
          : undefined
  return (
    <div className="bg-surface-100 p-3">
      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-foreground-lighter">
        {dot && <span className={cn('h-2 w-2 rounded-full', dot)} />}
        {label}
      </p>
      <p className="mt-1 text-lg tabular-nums text-foreground">{value.toLocaleString()}</p>
      {sub && <p className="text-xs text-foreground-lighter">{sub}</p>}
    </div>
  )
}

const FilterSelect = ({
  value,
  onChange,
  placeholder,
  allLabel,
  children,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  allLabel: string
  children: ReactNode
}) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger size="tiny" className="w-36">
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">{allLabel}</SelectItem>
      {children}
    </SelectContent>
  </Select>
)

const StartStopButton = ({ worker }: { worker: Worker }) => {
  if (TRANSITIONAL_STATES.includes(worker.state)) {
    return (
      <Button variant="text" size="tiny" disabled icon={<Loader2 className="animate-spin" />} />
    )
  }
  if (worker.state === 'active') {
    return (
      <Button
        variant="text"
        size="tiny"
        icon={<Pause />}
        title="Suspend"
        onClick={() => workersMockState.suspendWorker(worker.id)}
      />
    )
  }
  if (worker.state === 'suspended' || worker.state === 'errored') {
    return (
      <Button
        variant="text"
        size="tiny"
        icon={<Play />}
        title={worker.state === 'errored' ? 'Restart' : 'Start'}
        onClick={() => workersMockState.resumeWorker(worker.id)}
      />
    )
  }
  return null
}
