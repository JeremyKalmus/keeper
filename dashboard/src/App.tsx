import { useState, useEffect, useCallback } from 'react'
import { Sidebar } from './components/Sidebar'
import { SeedDetail } from './components/SeedDetail'
import { DecisionLog } from './components/DecisionLog'
import { useRealtimeUpdates } from './hooks/useRealtimeUpdates'
import {
  fetchVaults,
  fetchVault,
  fetchDecisions,
  fetchDecision,
  type VaultInfo,
  type VaultContent,
  type DecisionInfo,
  type DecisionContent,
} from './lib/api'

type Tab = 'seeds' | 'decisions'

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('seeds')
  const [selectedVault, setSelectedVault] = useState<string | null>(null)
  const [selectedSeed, setSelectedSeed] = useState<string | null>(null)
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null)

  // Data state
  const [vaultList, setVaultList] = useState<VaultInfo[]>([])
  const [vaultContents, setVaultContents] = useState<Record<string, VaultContent>>({})
  const [decisions, setDecisions] = useState<DecisionInfo[]>([])
  const [decisionContents, setDecisionContents] = useState<Record<string, DecisionContent>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        const [vaults, decisionList] = await Promise.all([
          fetchVaults(),
          fetchDecisions(),
        ])

        setVaultList(vaults)
        setDecisions(decisionList)

        // Load first vault content and select first seed
        if (vaults.length > 0) {
          const firstVault = vaults[0].name
          const content = await fetchVault(firstVault)
          setVaultContents({ [firstVault]: content })
          setSelectedVault(firstVault)

          // Select first seed
          const seeds = getSeedsFromVault(content.content)
          if (seeds.length > 0) {
            setSelectedSeed(seeds[0])
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load data')
        console.error('Failed to load data:', e)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Handle vault selection - load content if not cached
  const handleSelectVault = useCallback(async (vault: string | null) => {
    setSelectedVault(vault)
    setSelectedSeed(null)

    if (vault && !vaultContents[vault]) {
      try {
        const content = await fetchVault(vault)
        setVaultContents(prev => ({ ...prev, [vault]: content }))

        // Select first seed
        const seeds = getSeedsFromVault(content.content)
        if (seeds.length > 0) {
          setSelectedSeed(seeds[0])
        }
      } catch (e) {
        console.error('Failed to load vault:', e)
      }
    } else if (vault && vaultContents[vault]) {
      // Select first seed of cached vault
      const seeds = getSeedsFromVault(vaultContents[vault].content)
      if (seeds.length > 0) {
        setSelectedSeed(seeds[0])
      }
    }
  }, [vaultContents])

  // Handle decision selection - load content if not cached
  const handleSelectDecision = useCallback(async (id: string | null) => {
    setSelectedDecisionId(id)

    if (id && !decisionContents[id]) {
      try {
        const content = await fetchDecision(id)
        setDecisionContents(prev => ({ ...prev, [id]: content }))
      } catch (e) {
        console.error('Failed to load decision:', e)
      }
    }
  }, [decisionContents])

  // Handle real-time updates
  const handleRealtimeEvent = useCallback(async (event: { type: string; payload?: { file: string } }) => {
    console.log('[App] Handling realtime event:', event)

    if (event.type === 'vault-updated' && event.payload?.file) {
      const vaultName = event.payload.file.replace('.yaml', '').replace('.yml', '')
      try {
        const content = await fetchVault(vaultName)
        setVaultContents(prev => ({ ...prev, [vaultName]: content }))
        console.log(`[App] Refreshed vault: ${vaultName}`)
      } catch (e) {
        console.error('Failed to refresh vault:', e)
      }
    }

    if (event.type === 'decision-updated') {
      try {
        const decisionList = await fetchDecisions()
        setDecisions(decisionList)
        // Clear cached decision contents to force refresh
        setDecisionContents({})
        console.log('[App] Refreshed decisions')
      } catch (e) {
        console.error('Failed to refresh decisions:', e)
      }
    }
  }, [])

  const { connected, lastUpdate } = useRealtimeUpdates(handleRealtimeEvent)

  // Get current vault content
  const currentVault = selectedVault ? vaultContents[selectedVault] : null
  const currentSeedData = currentVault && selectedSeed
    ? getSeedFromVault(currentVault.content, selectedSeed)
    : null

  // Get seeds for a vault (from cache or empty)
  const getSeeds = useCallback((vault: string): string[] => {
    const content = vaultContents[vault]
    return content ? getSeedsFromVault(content.content) : []
  }, [vaultContents])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-925">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-seed-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading seed vaults...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-925">
        <div className="text-center">
          <p className="text-red-400 mb-2">Error loading dashboard</p>
          <p className="text-slate-500 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-md text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-slate-925">
      {/* Header */}
      <header className="h-14 border-b border-slate-700/50 flex items-center justify-between px-4 bg-slate-850/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-seed-400" viewBox="0 0 32 32" fill="currentColor">
              <path d="M16 4c-6 6-6 18 0 24 6-6 6-18 0-24z" opacity="0.3"/>
              <path d="M10 16c0-6 6-12 6-12s6 6 6 12-6 12-6 12-6-6-6-12z"/>
            </svg>
            <span className="font-semibold text-slate-100">Keeper</span>
          </div>
          <div className="h-5 w-px bg-slate-700/50" />
          <nav className="flex gap-1">
            <TabButton active={activeTab === 'seeds'} onClick={() => setActiveTab('seeds')}>
              Seeds
            </TabButton>
            <TabButton active={activeTab === 'decisions'} onClick={() => setActiveTab('decisions')}>
              Decisions
            </TabButton>
          </nav>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-seed-400 animate-pulse-soft' : 'bg-red-500'}`} />
          <span>{connected ? 'Live' : 'Disconnected'}</span>
          {lastUpdate && (
            <span className="text-slate-600">
              &middot; Updated {formatTime(lastUpdate)}
            </span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'seeds' ? (
          <>
            <Sidebar
              vaults={vaultList.map(v => v.name)}
              selectedVault={selectedVault}
              selectedSeed={selectedSeed}
              onSelectVault={handleSelectVault}
              onSelectSeed={setSelectedSeed}
              getSeeds={getSeeds}
            />
            <main className="flex-1 overflow-auto p-6">
              {currentSeedData ? (
                <SeedDetail
                  name={selectedSeed!}
                  vault={selectedVault!}
                  data={currentSeedData}
                />
              ) : (
                <EmptyState message="Select a seed to view details" />
              )}
            </main>
          </>
        ) : (
          <main className="flex-1 overflow-auto p-6">
            <DecisionLog
              decisions={decisions}
              selectedId={selectedDecisionId}
              onSelect={handleSelectDecision}
              getContent={(id) => decisionContents[id]?.content}
            />
          </main>
        )}
      </div>
    </div>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        active
          ? 'bg-slate-700/50 text-slate-100'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/25'
      }`}
    >
      {children}
    </button>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="h-full flex items-center justify-center text-slate-500">
      <p>{message}</p>
    </div>
  )
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Helper to extract seeds from vault content
function getSeedsFromVault(content: unknown): string[] {
  if (!content || typeof content !== 'object') return []
  const obj = content as Record<string, unknown>

  // Frontend: components, hooks
  if (obj.components || obj.hooks) {
    return [
      ...Object.keys((obj.components || {}) as object),
      ...Object.keys((obj.hooks || {}) as object),
    ]
  }
  // Backend: api_routes + services
  if (obj.api_routes || obj.services) {
    return [
      ...Object.keys((obj.api_routes || {}) as object),
      ...Object.keys((obj.services || {}) as object),
    ]
  }
  // Auth: auth_model, scopes, roles, cors
  if (obj.auth_model || obj.scopes || obj.roles) {
    const items: string[] = []
    if (obj.auth_model) items.push('auth_model')
    if (obj.cors) items.push('cors')
    if (obj.security_headers) items.push('security_headers')
    items.push(...Object.keys((obj.scopes || {}) as object))
    items.push(...Object.keys((obj.roles || {}) as object))
    return items
  }
  // Data: types, api_responses, sse_events
  if (obj.types || obj.api_responses) {
    return [
      ...Object.keys((obj.types || {}) as object),
      ...Object.keys((obj.api_responses || {}) as object),
      ...Object.keys((obj.sse_events || {}) as object),
    ]
  }
  // Config: config_files, constants, build_tools
  if (obj.config_files || obj.constants || obj.build_tools) {
    return [
      ...Object.keys((obj.config_files || {}) as object),
      ...(obj.constants ? ['constants'] : []),
      ...(obj.build_tools ? ['build_tools'] : []),
      ...(obj.scripts ? ['scripts'] : []),
    ]
  }
  // Testing: test_framework, recommended_setup
  if (obj.test_framework || obj.recommended_setup) {
    return [
      'test_framework',
      ...(obj.recommended_setup ? ['recommended_setup'] : []),
      ...(obj.recommended_structure ? ['recommended_structure'] : []),
    ]
  }
  // Generic: top-level keys
  return Object.keys(obj)
}

// Helper to get specific seed data
function getSeedFromVault(content: unknown, seedName: string): unknown {
  if (!content || typeof content !== 'object') return null
  const obj = content as Record<string, Record<string, unknown>>

  // Check each container
  const containers = [
    'components', 'hooks', 'api_routes', 'services',
    'scopes', 'roles', 'types', 'api_responses', 'sse_events',
    'config_files', 'design_tokens'
  ]

  for (const container of containers) {
    if (obj[container] && obj[container][seedName]) {
      return obj[container][seedName]
    }
  }

  // Direct top-level keys (auth_model, cors, constants, etc.)
  if (obj[seedName]) {
    return obj[seedName]
  }

  return null
}
