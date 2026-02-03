import { useState } from 'react'

interface SidebarProps {
  vaults: string[]
  selectedVault: string | null
  selectedSeed: string | null
  onSelectVault: (vault: string | null) => void
  onSelectSeed: (seed: string | null) => void
  getSeeds: (vault: string) => string[]
}

const VAULT_ICONS: Record<string, string> = {
  frontend: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm12 0a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
  backend: 'M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 8a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zm6-6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zm0 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
  auth: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  data: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4',
  config: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  testing: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
}

export function Sidebar({
  vaults,
  selectedVault,
  selectedSeed,
  onSelectVault,
  onSelectSeed,
  getSeeds,
}: SidebarProps) {
  const [expandedVaults, setExpandedVaults] = useState<Set<string>>(
    new Set(selectedVault ? [selectedVault] : [])
  )

  const toggleVault = (vault: string) => {
    const next = new Set(expandedVaults)
    if (next.has(vault)) {
      next.delete(vault)
    } else {
      next.add(vault)
    }
    setExpandedVaults(next)
    onSelectVault(vault)
  }

  return (
    <aside className="w-64 border-r border-slate-700/50 bg-slate-850/30 overflow-auto">
      <div className="p-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Seed Vaults
        </h2>
        <nav className="space-y-1">
          {vaults.map((vault) => {
            const isExpanded = expandedVaults.has(vault)
            const isSelected = selectedVault === vault
            const seeds = getSeeds(vault)

            return (
              <div key={vault}>
                <button
                  onClick={() => toggleVault(vault)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors group ${
                    isSelected
                      ? 'bg-slate-700/50 text-slate-100'
                      : 'text-slate-400 hover:bg-slate-700/25 hover:text-slate-200'
                  }`}
                >
                  <svg
                    className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <svg
                    className="w-4 h-4 text-slate-500 group-hover:text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d={VAULT_ICONS[vault] || VAULT_ICONS.config}
                    />
                  </svg>
                  <span className="capitalize">{vault}</span>
                  <span className="ml-auto text-xs text-slate-600">{seeds.length}</span>
                </button>

                {isExpanded && seeds.length > 0 && (
                  <div className="ml-6 mt-1 space-y-0.5 animate-fade-in">
                    {seeds.map((seed) => (
                      <button
                        key={seed}
                        onClick={() => {
                          onSelectVault(vault)
                          onSelectSeed(seed)
                        }}
                        className={`w-full text-left px-2 py-1 rounded text-sm truncate transition-colors ${
                          selectedSeed === seed && selectedVault === vault
                            ? 'bg-seed-500/20 text-seed-400 border-l-2 border-seed-400 pl-1.5'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/25'
                        }`}
                      >
                        <span className="font-mono text-xs">{seed}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
