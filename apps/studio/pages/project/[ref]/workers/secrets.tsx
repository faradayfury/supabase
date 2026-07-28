import type { PropsWithChildren } from 'react'
import { PageContainer } from 'ui-patterns/PageContainer'
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderMeta,
  PageHeaderSummary,
  PageHeaderTitle,
} from 'ui-patterns/PageHeader'
import { PageSection, PageSectionContent } from 'ui-patterns/PageSection'

import { WorkerSecrets } from '@/components/interfaces/Workers/WorkerSecrets'
import { DefaultLayout } from '@/components/layouts/DefaultLayout'
import WorkersLayout from '@/components/layouts/WorkersLayout/WorkersLayout'
import { UNIT_NAME_PLURAL_LOWER } from '@/lib/constants/workers'
import type { NextPageWithLayout } from '@/types'

const WorkersSecretsPage: NextPageWithLayout = () => (
  <PageContainer size="large">
    <PageSection>
      <PageSectionContent>
        <WorkerSecrets />
      </PageSectionContent>
    </PageSection>
  </PageContainer>
)

// Hoisted so the TanStack route can import it directly (mirrors Edge Functions).
export const WorkersSecretsPageWrapper = ({ children }: PropsWithChildren) => (
  <div className="flex min-h-full w-full flex-col items-stretch">
    <PageHeader size="large">
      <PageHeaderMeta>
        <PageHeaderSummary>
          <PageHeaderTitle>Secrets</PageHeaderTitle>
          <PageHeaderDescription>
            Environment variables available to your {UNIT_NAME_PLURAL_LOWER}
          </PageHeaderDescription>
        </PageHeaderSummary>
      </PageHeaderMeta>
    </PageHeader>
    {children}
  </div>
)

WorkersSecretsPage.getLayout = (page) => (
  <DefaultLayout>
    <WorkersLayout title="Secrets">
      <WorkersSecretsPageWrapper>{page}</WorkersSecretsPageWrapper>
    </WorkersLayout>
  </DefaultLayout>
)

export default WorkersSecretsPage
