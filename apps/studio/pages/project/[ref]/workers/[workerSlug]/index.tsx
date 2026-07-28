import { useParams } from 'common'

import { WorkerOverviewTab } from '@/components/interfaces/Workers/WorkerDetail/WorkerOverviewTab'
import { DefaultLayout } from '@/components/layouts/DefaultLayout'
import WorkerDetailsLayout from '@/components/layouts/WorkersLayout/WorkerDetailsLayout'
import { useWorkerBySlug } from '@/state/workers-mock-state'
import type { NextPageWithLayout } from '@/types'

// Primary tab: the aggregate Overview (metrics, errors since last deploy,
// active deployment). The full log stream lives under /logs.
const WorkerOverviewPage: NextPageWithLayout = () => {
  const { workerSlug } = useParams()
  const worker = useWorkerBySlug(workerSlug)

  if (!worker) return null

  return <WorkerOverviewTab worker={worker} />
}

WorkerOverviewPage.getLayout = (page) => (
  <DefaultLayout>
    <WorkerDetailsLayout title="Overview">{page}</WorkerDetailsLayout>
  </DefaultLayout>
)

export default WorkerOverviewPage
