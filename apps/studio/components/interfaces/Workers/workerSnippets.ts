import {
  getWorkerRuntime,
  type WorkerAccessMode,
  type WorkerRuntimeId,
  type WorkerSizeId,
} from '@/lib/constants/workers'

export interface WorkerSnippetParams {
  name: string
  runtime: WorkerRuntimeId
  size: WorkerSizeId
  access: WorkerAccessMode
  instances: number
}

export interface WorkerSnippets {
  aiPrompt: string
  cli: string
  curl: string
}

/**
 * Build the three copy-paste snippets for deploying a worker, kept in sync with
 * whatever params the caller passes (create-dialog form state, or defaults on
 * the empty state). The AI prompt is the code-first entry point for agents.
 */
export const buildWorkerSnippets = (
  params: WorkerSnippetParams,
  projectRef?: string
): WorkerSnippets => {
  const runtime = getWorkerRuntime(params.runtime)
  const name = params.name || 'my-worker'
  const plural = params.instances === 1 ? 'instance' : 'instances'

  return {
    aiPrompt: [
      `Deploy a Supabase Worker for me named "${name}".`,
      `Use the ${runtime.label} runtime, the ${params.size} size, ${params.access} access, and ${params.instances} ${plural}.`,
      `If the Supabase CLI isn't installed, install it and link this project first.`,
      `Deploy it with "supabase workers deploy", then tail the logs and confirm it reaches the active state.`,
    ].join(' '),
    cli: [
      `supabase workers deploy ${name} \\`,
      `  --runtime ${runtime.cliValue} \\`,
      `  --size ${params.size} \\`,
      `  --access ${params.access} \\`,
      `  --instances ${params.instances}`,
    ].join('\n'),
    curl: [
      `curl -X POST 'https://api.supabase.com/v1/projects/${projectRef ?? '<project-ref>'}/workers' \\`,
      `  -H 'Authorization: Bearer $SUPABASE_ACCESS_TOKEN' \\`,
      `  -H 'Content-Type: application/json' \\`,
      `  -d '${JSON.stringify({
        name,
        runtime: runtime.cliValue,
        size: params.size,
        access: params.access,
        instances: params.instances,
      })}'`,
    ].join('\n'),
  }
}
