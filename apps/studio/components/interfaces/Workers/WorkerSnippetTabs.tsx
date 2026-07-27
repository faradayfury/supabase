import { Code2, Sparkles, Terminal } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'ui'
import { CodeBlock } from 'ui-patterns/CodeBlock'

import CopyButton from '@/components/ui/CopyButton'
import type { WorkerSnippets } from './workerSnippets'

type SnippetKey = 'ai' | 'cli' | 'curl'

/**
 * The "AI Prompt | CLI | curl" snippet card, mirroring the code-first prompt
 * pattern in the docs. Every panel is copyable so a user can run it themselves
 * instead of (or alongside) the dashboard create flow.
 */
export const WorkerSnippetTabs = ({
  snippets,
  tabs = ['ai', 'cli', 'curl'],
  className,
}: {
  snippets: WorkerSnippets
  tabs?: SnippetKey[]
  className?: string
}) => {
  return (
    <Tabs defaultValue={tabs[0]} className={className}>
      <TabsList>
        {tabs.includes('ai') && (
          <TabsTrigger value="ai" className="gap-1.5">
            <Sparkles size={13} strokeWidth={1.5} /> AI Prompt
          </TabsTrigger>
        )}
        {tabs.includes('cli') && (
          <TabsTrigger value="cli" className="gap-1.5">
            <Terminal size={13} strokeWidth={1.5} /> CLI
          </TabsTrigger>
        )}
        {tabs.includes('curl') && (
          <TabsTrigger value="curl" className="gap-1.5">
            <Code2 size={13} strokeWidth={1.5} /> curl
          </TabsTrigger>
        )}
      </TabsList>

      {tabs.includes('ai') && (
        <TabsContent value="ai" className="mt-2">
          <div className="relative rounded-md border border-default bg-surface-100 p-3 pr-10">
            <p className="text-xs leading-relaxed text-foreground-light">{snippets.aiPrompt}</p>
            <CopyButton
              iconOnly
              variant="text"
              size="tiny"
              className="absolute right-1.5 top-1.5"
              text={snippets.aiPrompt}
            />
          </div>
        </TabsContent>
      )}
      {tabs.includes('cli') && (
        <TabsContent value="cli" className="mt-2">
          <CodeBlock language="bash" hideLineNumbers className="text-xs">
            {snippets.cli}
          </CodeBlock>
        </TabsContent>
      )}
      {tabs.includes('curl') && (
        <TabsContent value="curl" className="mt-2">
          <CodeBlock language="bash" hideLineNumbers className="text-xs">
            {snippets.curl}
          </CodeBlock>
        </TabsContent>
      )}
    </Tabs>
  )
}
