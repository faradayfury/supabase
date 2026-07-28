import { useParams } from 'common'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, type PropsWithChildren } from 'react'
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  NavMenu,
  NavMenuItem,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from 'ui'
import { PageBreadcrumbs, PageBreadcrumbsActions } from 'ui-patterns/PageBreadcrumbs'
import { PageContainer } from 'ui-patterns/PageContainer'
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderMeta,
  PageHeaderSummary,
  PageHeaderTitle,
} from 'ui-patterns/PageHeader'
import { PageNav } from 'ui-patterns/PageNav'

import WorkersLayout from './WorkersLayout'
import {
  WorkerSimulateTrafficButton,
  WorkerStartStopButton,
} from '@/components/interfaces/Workers/WorkerActions'
import {
  WorkerAccessBadge,
  WorkerConfigBadges,
  WorkerRuntimeBadge,
  WorkerStateBadge,
} from '@/components/interfaces/Workers/WorkerBadges'
import { WorkerEndpointBar } from '@/components/interfaces/Workers/WorkerEndpointBar'
import { DocsButton } from '@/components/ui/DocsButton'
import { withAuth } from '@/hooks/misc/withAuth'
import { DOCS_URL } from '@/lib/constants'
import { PRODUCT_NAME } from '@/lib/constants/workers'
import { ensureWorkersMockTicker, useWorkerBySlug } from '@/state/workers-mock-state'

// The de facto page-chrome horizontal padding (see pageChromeClassName in
// PageBreadcrumbs/PageNav) — applied to the header pieces so the title,
// endpoint row and tabs line up with the breadcrumb above them.
const CHROME_PADDING = 'px-4 xl:px-4'

interface WorkerDetailsLayoutProps {
  title: string
}

const WorkerDetailsLayout = ({ title, children }: PropsWithChildren<WorkerDetailsLayoutProps>) => {
  const router = useRouter()
  const { ref, workerSlug } = useParams()
  const worker = useWorkerBySlug(workerSlug)

  useEffect(() => {
    ensureWorkersMockTicker()
  }, [])

  // If the worker can't be found (e.g. just deleted), bounce to the list.
  useEffect(() => {
    if (workerSlug && !worker) {
      router.push(`/project/${ref}/workers`)
    }
  }, [workerSlug, worker, ref, router])

  const browserTitle = { entity: worker?.name ?? workerSlug, section: title }

  if (!worker) {
    return <WorkersLayout title={title} browserTitle={browserTitle} />
  }

  const base = `/project/${ref}/workers/${worker.slug}`
  // Overview is the aggregate summary; Logs carries the session-grouped stream.
  // Filesystem is disabled for the alpha: instances are stateless (no
  // persistent disks).
  const navigationItems: { label: string; href: string; disabled?: boolean }[] = [
    { label: 'Overview', href: base },
    { label: 'Logs', href: `${base}/logs` },
    { label: 'Terminal', href: `${base}/terminal` },
    { label: 'Filesystem', href: `${base}/filesystem`, disabled: true },
    { label: 'Settings', href: `${base}/settings` },
  ]

  return (
    <WorkersLayout title={title} browserTitle={browserTitle}>
      <div className="flex min-h-full w-full flex-col items-stretch">
        <PageBreadcrumbs
          slotClassName="sticky top-0 z-20 bg-dash-sidebar"
          actions={
            <PageBreadcrumbsActions>
              <WorkerSimulateTrafficButton worker={worker} />
              <DocsButton href={`${DOCS_URL}/guides/workers`} />
              <WorkerStartStopButton worker={worker} />
            </PageBreadcrumbsActions>
          }
        >
          <BreadcrumbList className="flex-1 min-w-0 flex-nowrap [&_li]:text-xs">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/project/${ref}/workers`}>{PRODUCT_NAME}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className="block min-w-0 truncate">{worker.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </PageBreadcrumbs>

        <PageHeader size="full">
          <PageHeaderMeta containerClassName={CHROME_PADDING}>
            <PageHeaderSummary>
              <PageHeaderTitle>{worker.name}</PageHeaderTitle>
              <PageHeaderDescription className="flex flex-row flex-wrap items-center gap-x-3 gap-y-1 text-sm!">
                <WorkerStateBadge state={worker.state} />
                <WorkerRuntimeBadge runtime={worker.runtime} />
                <WorkerAccessBadge access={worker.access} />
                <WorkerConfigBadges worker={worker} />
              </PageHeaderDescription>
            </PageHeaderSummary>
          </PageHeaderMeta>

          {/* Endpoint row for public workers only — private workers simply
              don't have one (the Private badge tooltip carries the context). */}
          {worker.access === 'public' && worker.endpoint && (
            <PageContainer size="full" className={CHROME_PADDING}>
              <WorkerEndpointBar endpoint={worker.endpoint} />
            </PageContainer>
          )}
        </PageHeader>

        {/* Tabs live outside PageHeader so they can stick just below the
            breadcrumb bar once the title/meta scrolls away. */}
        <div className="sticky top-(--header-height) z-10 mt-4 bg-dash-sidebar">
          <PageNav>
            <NavMenu>
              {navigationItems.map((item) => {
                if (item.disabled) {
                  return (
                    <NavMenuItem key={item.label} className="opacity-60">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-not-allowed">{item.label}</span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-56 text-center">
                          Coming soon — worker instances are stateless at alpha (no persistent
                          disks)
                        </TooltipContent>
                      </Tooltip>
                    </NavMenuItem>
                  )
                }
                const isActive = router.asPath.split('?')[0] === item.href
                return (
                  <NavMenuItem key={item.label} active={isActive}>
                    <Link href={item.href}>{item.label}</Link>
                  </NavMenuItem>
                )
              })}
            </NavMenu>
          </PageNav>
        </div>

        {children}
      </div>
    </WorkersLayout>
  )
}

export default withAuth(WorkerDetailsLayout)
