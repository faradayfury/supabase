import { Code2, Sparkles, Terminal } from 'lucide-react'
import { cn, Tabs, TabsContent, TabsList, TabsTrigger } from 'ui'

import CopyButton from '@/components/ui/CopyButton'
import type { WorkerSnippets } from './workerSnippets'

type SnippetKey = 'ai' | 'cli' | 'curl'

/**
 * The "AI Prompt | CLI | curl" snippet card, mirroring the code-first prompt
 * pattern in the docs. Tabs + code render as one bordered widget: a light tab
 * header over a darker snippet panel. Every panel is copyable so a user can run
 * it themselves instead of (or alongside) the dashboard create flow.
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
    <Tabs
      defaultValue={tabs[0]}
      className={cn('overflow-hidden rounded-md border border-default', className)}
    >
      <TabsList className="gap-4 bg-surface-100 px-3">
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
        <SnippetPanel value="ai" text={snippets.aiPrompt} prose />
      )}
      {tabs.includes('cli') && <SnippetPanel value="cli" text={snippets.cli} />}
      {tabs.includes('curl') && <SnippetPanel value="curl" text={snippets.curl} />}
    </Tabs>
  )
}

const SnippetPanel = ({
  value,
  text,
  prose = false,
}: {
  value: SnippetKey
  text: string
  prose?: boolean
}) => (
  <TabsContent value={value} className="relative mt-0 bg-surface-75 p-3 pr-10">
    {prose ? (
      <p className="text-xs leading-relaxed text-foreground-light">{text}</p>
    ) : (
      <pre className="overflow-x-auto whitespace-pre font-mono text-xs leading-relaxed text-foreground-light">
        {text}
      </pre>
    )}
    <CopyButton
      iconOnly
      variant="text"
      size="tiny"
      className="absolute right-1.5 top-1.5"
      text={text}
    />
  </TabsContent>
)
