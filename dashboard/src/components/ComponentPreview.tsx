import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { SeedDetail } from './SeedDetail'
import { DecisionLog } from './DecisionLog'

// Mock data for component previews
const MOCK_VAULTS = ['frontend', 'backend', 'auth']
const MOCK_SEEDS: Record<string, string[]> = {
  frontend: ['Button', 'Input', 'Modal'],
  backend: ['AuthService', 'UserService'],
  auth: ['auth_model', 'cors'],
}

const MOCK_SEED_DATA = {
  variants: ['primary', 'secondary', 'danger'],
  location: 'src/ui/Button.tsx',
  when_to_use: 'Any clickable action',
  forbidden_extensions: ['custom colors', 'inline styles'],
}

const MOCK_DECISIONS = [
  { id: '003-example', summary: 'Example decision for preview' },
  { id: '002-another', summary: 'Another example decision' },
]

interface ComponentPreviewProps {
  componentName: string
}

export function ComponentPreview({ componentName }: ComponentPreviewProps) {
  const [interactiveState, setInteractiveState] = useState({
    selectedVault: 'frontend',
    selectedSeed: 'Button',
    selectedDecision: null as string | null,
  })

  const PreviewWrapper = ({ children, scale = 1 }: { children: React.ReactNode; scale?: number }) => (
    <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-900">
      <div className="bg-slate-800/50 px-3 py-1.5 border-b border-slate-700 flex items-center justify-between">
        <span className="text-xs text-slate-400">Live Preview</span>
        <span className="text-xs text-slate-500">Interactive</span>
      </div>
      <div
        className="p-4 overflow-auto"
        style={{
          maxHeight: '400px',
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top left',
        }}
      >
        {children}
      </div>
    </div>
  )

  // Component registry with preview configurations
  switch (componentName) {
    case 'Sidebar':
      return (
        <PreviewWrapper>
          <div className="w-64 h-80 border border-slate-700 rounded-lg overflow-hidden">
            <Sidebar
              vaults={MOCK_VAULTS}
              selectedVault={interactiveState.selectedVault}
              selectedSeed={interactiveState.selectedSeed}
              onSelectVault={(v) => setInteractiveState(s => ({ ...s, selectedVault: v, selectedSeed: null }))}
              onSelectSeed={(s) => setInteractiveState(prev => ({ ...prev, selectedSeed: s }))}
              getSeeds={(vault) => MOCK_SEEDS[vault] || []}
            />
          </div>
        </PreviewWrapper>
      )

    case 'SeedDetail':
      return (
        <PreviewWrapper>
          <div className="max-w-md">
            <SeedDetail
              name="Button"
              vault="frontend"
              data={MOCK_SEED_DATA}
            />
          </div>
        </PreviewWrapper>
      )

    case 'DecisionLog':
      return (
        <PreviewWrapper>
          <div className="max-w-lg">
            <DecisionLog
              decisions={MOCK_DECISIONS}
              selectedId={interactiveState.selectedDecision}
              onSelect={(id) => setInteractiveState(s => ({ ...s, selectedDecision: id }))}
              getContent={() => ({ summary: 'Preview content', status: 'approved' })}
            />
          </div>
        </PreviewWrapper>
      )

    case 'TabButton':
      return (
        <PreviewWrapper>
          <TabButtonPreview />
        </PreviewWrapper>
      )

    case 'EmptyState':
      return (
        <PreviewWrapper>
          <EmptyStatePreview />
        </PreviewWrapper>
      )

    case 'Icons':
      return (
        <PreviewWrapper>
          <IconsPreview />
        </PreviewWrapper>
      )

    default:
      return null
  }
}

// Preview for TabButton
function TabButtonPreview() {
  const [active, setActive] = useState<'seeds' | 'decisions'>('seeds')

  return (
    <div className="flex gap-2 p-4 bg-slate-850 rounded-lg">
      <button
        onClick={() => setActive('seeds')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          active === 'seeds'
            ? 'bg-slate-700/50 text-slate-100'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/25'
        }`}
      >
        Seeds
      </button>
      <button
        onClick={() => setActive('decisions')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          active === 'decisions'
            ? 'bg-slate-700/50 text-slate-100'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/25'
        }`}
      >
        Decisions
      </button>
    </div>
  )
}

// Preview for EmptyState
function EmptyStatePreview() {
  return (
    <div className="h-40 flex items-center justify-center text-slate-500 bg-slate-850 rounded-lg">
      <p>Select a seed to view details</p>
    </div>
  )
}

// Preview for Icons
function IconsPreview() {
  const icons = [
    { name: 'Location', path: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
    { name: 'Info', path: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'Grid', path: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { name: 'Check', path: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'Shield', path: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { name: 'Forbidden', path: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' },
    { name: 'Code', path: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
  ]

  return (
    <div className="grid grid-cols-4 gap-4 p-4 bg-slate-850 rounded-lg">
      {icons.map(({ name, path }) => (
        <div key={name} className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 flex items-center justify-center bg-slate-800 rounded-lg">
            <svg className="w-5 h-5 text-seed-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
            </svg>
          </div>
          <span className="text-xs text-slate-500">{name}</span>
        </div>
      ))}
    </div>
  )
}

// Check if a component has a preview available
export function hasPreview(componentName: string): boolean {
  const previewable = ['Sidebar', 'SeedDetail', 'DecisionLog', 'TabButton', 'EmptyState', 'Icons']
  return previewable.includes(componentName)
}
