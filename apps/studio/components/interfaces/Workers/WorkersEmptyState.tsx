import { Plus } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from 'ui'

import { WorkerSnippetTabs } from './WorkerSnippetTabs'
import { buildWorkerSnippets } from './workerSnippets'
import CopyButton from '@/components/ui/CopyButton'
import { DocsButton } from '@/components/ui/DocsButton'
import { DOCS_URL } from '@/lib/constants'
import { UNIT_NAME_LOWER, WORKERS_SKILL_MARKDOWN } from '@/lib/constants/workers'
import { workersMockState } from '@/state/workers-mock-state'

// Code-first empty state: lead with an agent prompt / CLI (Select is a
// code-first launch), with the dashboard create flow as a secondary path.
const DEFAULT_SNIPPETS = buildWorkerSnippets({
  name: 'my-worker',
  runtime: 'node',
  size: '2x1',
  access: 'public',
  instances: 1,
})

export const WorkersEmptyState = ({ onCreate }: { onCreate: () => void }) => {
  return (
    <div className="mx-auto w-full max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Deploy your first {UNIT_NAME_LOWER}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <p className="text-sm text-foreground-light">
            Workers run managed compute in microVMs right next to your database. Kick one off with
            an agent prompt or the CLI — or create one from the dashboard.
          </p>

          <WorkerSnippetTabs snippets={DEFAULT_SNIPPETS} tabs={['ai', 'cli']} />

          <div className="flex flex-wrap items-center gap-2">
            <Button icon={<Plus />} onClick={onCreate}>
              Create {UNIT_NAME_LOWER}
            </Button>
            <DocsButton href={`${DOCS_URL}/guides/workers`} />
            <CopyButton
              variant="text"
              text={WORKERS_SKILL_MARKDOWN}
              copyLabel="Copy SKILL.md for agents"
              copiedLabel="Copied SKILL.md"
            />
          </div>
        </CardContent>
      </Card>

      {/* Demo affordance: jump from empty to a large fleet to preview the list
          at the scale we expect once the alpha instance cap is lifted. */}
      <div className="mt-3 text-center">
        <Button
          variant="text"
          size="tiny"
          className="text-foreground-lighter"
          onClick={() => workersMockState.seedSampleFleet()}
        >
          Preview at scale — load a sample fleet
        </Button>
      </div>
    </div>
  )
}
