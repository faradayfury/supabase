import { createFileRoute } from '@tanstack/react-router'

import WorkerOverviewPage from '@/pages/project/[ref]/workers/[workerSlug]/index'

export const Route = createFileRoute('/project/$ref/workers/$workerSlug/')({
  component: WorkerOverviewRoute,
  staticData: {
    workerDetailsTitle: 'Overview',
  },
})

function WorkerOverviewRoute() {
  return <WorkerOverviewPage dehydratedState={undefined} />
}
