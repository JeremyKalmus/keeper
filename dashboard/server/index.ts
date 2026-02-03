/**
 * Keeper Dashboard Server
 *
 * Serves the dashboard API and provides real-time updates via SSE
 * when seed vault or decision files change.
 */

import { watch } from 'fs'
import { readdir, readFile } from 'fs/promises'
import { join, basename } from 'path'
import YAML from 'yaml'

const PORT = 3333
const KEEPER_DIR = join(import.meta.dir, '../../keeper')
const SEEDS_DIR = join(KEEPER_DIR, 'seeds')
const DECISIONS_DIR = join(KEEPER_DIR, 'decisions')

// SSE clients
const clients = new Set<ReadableStreamDefaultController>()

function broadcast(event: { type: string; payload: unknown }) {
  const data = `data: ${JSON.stringify(event)}\n\n`
  for (const client of clients) {
    try {
      client.enqueue(new TextEncoder().encode(data))
    } catch {
      clients.delete(client)
    }
  }
}

// Watch for file changes
function setupWatchers() {
  const watchHandler = (dir: string, eventType: string) => (event: string, filename: string | null) => {
    if (filename?.endsWith('.yaml') || filename?.endsWith('.yml')) {
      console.log(`[watch] ${eventType}: ${filename}`)
      broadcast({ type: eventType, payload: { file: filename } })
    }
  }

  try {
    watch(SEEDS_DIR, watchHandler(SEEDS_DIR, 'vault-updated'))
    watch(DECISIONS_DIR, watchHandler(DECISIONS_DIR, 'decision-updated'))
    console.log(`[watch] Watching ${SEEDS_DIR}`)
    console.log(`[watch] Watching ${DECISIONS_DIR}`)
  } catch (e) {
    console.warn('[watch] Could not set up watchers:', e)
  }
}

async function listYamlFiles(dir: string): Promise<string[]> {
  try {
    const files = await readdir(dir)
    return files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'))
  } catch {
    return []
  }
}

async function parseYamlFile(filepath: string): Promise<unknown> {
  try {
    const content = await readFile(filepath, 'utf-8')
    return YAML.parse(content)
  } catch (e) {
    console.error(`[yaml] Error parsing ${filepath}:`, e)
    return null
  }
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url)
    const path = url.pathname

    // CORS headers for development
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    // SSE endpoint
    if (path === '/api/events') {
      const stream = new ReadableStream({
        start(controller) {
          clients.add(controller)
          // Send initial connection event
          controller.enqueue(new TextEncoder().encode('data: {"type":"connected"}\n\n'))
        },
        cancel() {
          // Client disconnected
        },
      })

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // List all vaults
    if (path === '/api/vaults') {
      const files = await listYamlFiles(SEEDS_DIR)
      const vaults = files.map(f => ({
        name: basename(f, '.yaml'),
        file: f,
      }))
      return Response.json({ vaults }, { headers: corsHeaders })
    }

    // Get specific vault
    const vaultMatch = path.match(/^\/api\/vault\/(\w+)$/)
    if (vaultMatch) {
      const vaultName = vaultMatch[1]
      const filepath = join(SEEDS_DIR, `${vaultName}.yaml`)
      const content = await parseYamlFile(filepath)
      if (!content) {
        return Response.json({ error: 'Vault not found' }, { status: 404, headers: corsHeaders })
      }
      return Response.json({ name: vaultName, content }, { headers: corsHeaders })
    }

    // List all decisions
    if (path === '/api/decisions') {
      const files = await listYamlFiles(DECISIONS_DIR)
      const decisions = await Promise.all(
        files.sort().reverse().map(async f => {
          const content = await parseYamlFile(join(DECISIONS_DIR, f))
          return {
            id: basename(f, '.yaml'),
            file: f,
            summary: content && typeof content === 'object' ? (content as Record<string, unknown>).summary : null,
          }
        })
      )
      return Response.json({ decisions }, { headers: corsHeaders })
    }

    // Get specific decision
    const decisionMatch = path.match(/^\/api\/decision\/(.+)$/)
    if (decisionMatch) {
      const decisionId = decisionMatch[1]
      const filepath = join(DECISIONS_DIR, `${decisionId}.yaml`)
      const content = await parseYamlFile(filepath)
      if (!content) {
        return Response.json({ error: 'Decision not found' }, { status: 404, headers: corsHeaders })
      }
      return Response.json({ id: decisionId, content }, { headers: corsHeaders })
    }

    // Health check
    if (path === '/api/health') {
      return Response.json({ status: 'ok', timestamp: new Date().toISOString() }, { headers: corsHeaders })
    }

    return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders })
  },
})

setupWatchers()

console.log(`
  ╭─────────────────────────────────────╮
  │                                     │
  │   🌱 Keeper Dashboard Server        │
  │                                     │
  │   Local:  http://localhost:${PORT}    │
  │                                     │
  │   Watching:                         │
  │   • ${SEEDS_DIR}              │
  │   • ${DECISIONS_DIR}          │
  │                                     │
  ╰─────────────────────────────────────╯
`)
