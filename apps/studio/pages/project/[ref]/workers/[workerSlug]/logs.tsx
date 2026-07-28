import { useParams } from 'common'

import { WorkerLogsTab } from '@/components/interfaces/Workers/WorkerDetail/WorkerLogsTab'
import { DefaultLayout } from '@/components/layouts/DefaultLayout'
import WorkerDetailsLayout from '@/components/layouts/WorkersLayout/WorkerDetailsLayout'
import { useWorkerBySlug } from '@/state/workers-mock-state'
import type { NextPageWithLayout } from '@/types'

const WorkerLogsPage: NextPageWithLayout = () => {
  const { workerSlug } = useParams()
  const worker = useWorkerBySlug(workerSlug)

  if (!worker) return null

  return <WorkerLogsTab worker={worker} />
}

WorkerLogsPage.getLayout = (page) => (
  <DefaultLayout>
    <WorkerDetailsLayout title="Logs">{page}</WorkerDetailsLayout>
  </DefaultLayout>
)

export default WorkerLogsPage
