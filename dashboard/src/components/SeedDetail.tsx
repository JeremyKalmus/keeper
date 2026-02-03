import { ComponentPreview, hasPreview } from './ComponentPreview'

interface SeedDetailProps {
  name: string
  vault: string
  data: unknown
}

export function SeedDetail({ name, vault, data }: SeedDetailProps) {
  const seedData = data as Record<string, unknown>
  const showPreview = vault === 'frontend' && hasPreview(name)

  return (
    <div className="max-w-3xl animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
          <span className="capitalize">{vault}</span>
          <span>/</span>
        </div>
        <h1 className="text-2xl font-semibold text-slate-100 font-mono">{name}</h1>
      </div>

      {/* Live Component Preview */}
      {showPreview && (
        <Section icon={PreviewIcon} title="Live Preview">
          <ComponentPreview componentName={name} />
        </Section>
      )}

      {/* Location */}
      {seedData.location && (
        <Section icon={LocationIcon} title="Location">
          <code className="text-seed-400 bg-slate-800/50 px-2 py-1 rounded text-sm font-mono">
            {String(seedData.location)}
          </code>
        </Section>
      )}

      {/* When to use */}
      {seedData.when_to_use && (
        <Section icon={InfoIcon} title="When to use">
          <p className="text-slate-300">{String(seedData.when_to_use)}</p>
        </Section>
      )}

      {/* Purpose (for API routes) */}
      {seedData.purpose && (
        <Section icon={InfoIcon} title="Purpose">
          <p className="text-slate-300">{String(seedData.purpose)}</p>
        </Section>
      )}

      {/* Props (for components) */}
      {Array.isArray(seedData.props) && seedData.props.length > 0 && (
        <Section icon={CodeIcon} title="Props">
          <div className="flex flex-wrap gap-2">
            {seedData.props.map((prop) => (
              <span
                key={String(prop)}
                className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-sm font-mono text-slate-300"
              >
                {String(prop)}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Variants */}
      {Array.isArray(seedData.variants) && seedData.variants.length > 0 && (
        <Section icon={GridIcon} title="Variants">
          <div className="flex flex-wrap gap-2">
            {seedData.variants.map((variant) => (
              <span
                key={String(variant)}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-md text-sm font-mono text-slate-300"
              >
                {String(variant)}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Responsibilities (for services) */}
      {Array.isArray(seedData.responsibilities) && (
        <Section icon={CheckIcon} title="Responsibilities">
          <ul className="space-y-1">
            {seedData.responsibilities.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-300">
                <span className="text-seed-500 mt-1">+</span>
                <span>{String(item)}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Scopes (for API routes) */}
      {Array.isArray(seedData.scopes) && seedData.scopes.length > 0 && (
        <Section icon={ShieldIcon} title="Required Scopes">
          <div className="flex flex-wrap gap-2">
            {seedData.scopes.map((scope) => (
              <span
                key={String(scope)}
                className="px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded text-sm font-mono text-blue-400"
              >
                {String(scope)}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Auth required */}
      {typeof seedData.auth_required === 'boolean' && (
        <Section icon={ShieldIcon} title="Authentication">
          <span className={`px-2 py-1 rounded text-sm ${
            seedData.auth_required
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              : 'bg-slate-700 text-slate-400'
          }`}>
            {seedData.auth_required ? 'Required' : 'Not required'}
          </span>
        </Section>
      )}

      {/* Returns (for API routes) */}
      {seedData.returns && (
        <Section icon={CodeIcon} title="Returns">
          <code className="text-slate-300 bg-slate-800/50 px-2 py-1 rounded text-sm font-mono">
            {String(seedData.returns)}
          </code>
        </Section>
      )}

      {/* Forbidden extensions */}
      {Array.isArray(seedData.forbidden_extensions) && seedData.forbidden_extensions.length > 0 && (
        <Section icon={ForbiddenIcon} title="Forbidden Extensions" variant="danger">
          <ul className="space-y-1">
            {seedData.forbidden_extensions.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-400">
                <span className="text-red-500 mt-0.5">-</span>
                <span>{String(item)}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Forbidden (for services) */}
      {Array.isArray(seedData.forbidden) && seedData.forbidden.length > 0 && (
        <Section icon={ForbiddenIcon} title="Forbidden" variant="danger">
          <ul className="space-y-1">
            {seedData.forbidden.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-400">
                <span className="text-red-500 mt-0.5">-</span>
                <span>{String(item)}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Raw data preview */}
      <Section icon={CodeIcon} title="Raw Data">
        <pre className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 text-sm font-mono text-slate-400 overflow-auto max-h-64">
          {JSON.stringify(seedData, null, 2)}
        </pre>
      </Section>
    </div>
  )
}

function Section({
  icon: Icon,
  title,
  children,
  variant = 'default',
}: {
  icon: React.FC<{ className?: string }>
  title: string
  children: React.ReactNode
  variant?: 'default' | 'danger'
}) {
  return (
    <div className="mb-6">
      <div className={`flex items-center gap-2 mb-2 ${
        variant === 'danger' ? 'text-red-400' : 'text-slate-500'
      }`}>
        <Icon className="w-4 h-4" />
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      <div className="pl-6">{children}</div>
    </div>
  )
}

// Icons
function PreviewIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
}

function ForbiddenIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  )
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  )
}
