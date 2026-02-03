interface Decision {
  id: string
  summary: string | null
}

interface DecisionLogProps {
  decisions: Decision[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  getContent: (id: string) => Record<string, unknown> | undefined
}

export function DecisionLog({ decisions, selectedId, onSelect, getContent }: DecisionLogProps) {
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-100">Decision Log</h1>
        <p className="text-slate-500 mt-1">
          Architectural decisions made by the Keeper
        </p>
      </div>

      <div className="space-y-3">
        {decisions.map((decision, index) => {
          const isSelected = selectedId === decision.id
          const isLatest = index === 0
          const content = isSelected ? getContent(decision.id) : undefined

          return (
            <button
              key={decision.id}
              onClick={() => onSelect(isSelected ? null : decision.id)}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                isSelected
                  ? 'bg-slate-800/70 border-seed-500/50'
                  : 'bg-slate-850/50 border-slate-700/50 hover:border-slate-600/50'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-seed-400">
                      {decision.id}
                    </span>
                    {isLatest && (
                      <span className="px-1.5 py-0.5 bg-seed-500/20 text-seed-400 text-xs rounded">
                        Latest
                      </span>
                    )}
                  </div>
                  {decision.summary && (
                    <p className="text-slate-300 text-sm truncate">
                      {decision.summary}
                    </p>
                  )}
                </div>
                <svg
                  className={`w-5 h-5 text-slate-500 transition-transform flex-shrink-0 ${
                    isSelected ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              {isSelected && (
                <div className="mt-4 pt-4 border-t border-slate-700/50 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                  {content ? (
                    <DecisionContent content={content} />
                  ) : (
                    <div className="flex items-center justify-center py-4">
                      <div className="w-5 h-5 border-2 border-seed-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {decisions.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <svg
            className="w-12 h-12 mx-auto mb-4 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p>No decisions recorded yet</p>
        </div>
      )}
    </div>
  )
}

function DecisionContent({ content }: { content: Record<string, unknown> }) {
  // Render decision fields nicely
  const { summary, ...rest } = content

  return (
    <div className="space-y-4">
      {/* Summary if exists */}
      {summary && (
        <div>
          <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Summary</h4>
          <p className="text-slate-300">{String(summary)}</p>
        </div>
      )}

      {/* Other fields */}
      {Object.entries(rest).map(([key, value]) => (
        <div key={key}>
          <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
            {key.replace(/_/g, ' ')}
          </h4>
          <div className="bg-slate-900/50 rounded-lg p-3">
            {typeof value === 'object' ? (
              <pre className="text-sm font-mono text-slate-400 whitespace-pre-wrap overflow-auto">
                {JSON.stringify(value, null, 2)}
              </pre>
            ) : (
              <p className="text-slate-300 text-sm">{String(value)}</p>
            )}
          </div>
        </div>
      ))}

      {/* Raw YAML preview */}
      <div>
        <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Raw Content</h4>
        <pre className="bg-slate-900/50 rounded-lg p-3 text-sm font-mono text-slate-500 whitespace-pre-wrap overflow-auto max-h-64">
          {JSON.stringify(content, null, 2)}
        </pre>
      </div>
    </div>
  )
}
