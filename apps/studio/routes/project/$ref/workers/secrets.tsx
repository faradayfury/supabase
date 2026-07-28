import { createFileRoute } from '@tanstack/react-router'

import WorkersSecretsPage, {
  WorkersSecretsPageWrapper,
} from '@/pages/project/[ref]/workers/secrets'

export const Route = createFileRoute('/project/$ref/workers/secrets')({
  component: WorkersSecretsRoute,
  staticData: {
    workersLayoutTitle: 'Secrets',
  },
})

function WorkersSecretsRoute() {
  return (
    <WorkersSecretsPageWrapper>
      <WorkersSecretsPage dehydratedState={undefined} />
    </WorkersSecretsPageWrapper>
  )
}
