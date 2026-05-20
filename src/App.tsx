import { useState } from 'react'
import { Download, Code2, Layers, Palette, GitBranch, Database, CheckCircle2, Package, Wrench, ShieldCheck, FlaskConical } from 'lucide-react'
import type { ProjectConfig, Framework, Styling, Routing, StateManagement, BuildTool, PackageManager, Linting, Testing } from './types'
import { FileTree } from './components/FileTree'
import { buildFileTree } from './utils/buildFileTree'
import { DEFAULT_CONFIG } from './types'
import { generateProject } from './generators/projectGenerator'

// ── devicon helper ────────────────────────────────────────────────────────────

function DevIcon({ name, size = 28 }: { name: string; size?: number }) {
  return <i className={`devicon-${name}-plain colored`} style={{ fontSize: size }} />
}

// ── option data ───────────────────────────────────────────────────────────────

const BUILD_TOOLS: { value: BuildTool; label: string; icon: string; desc: string }[] = [
  { value: 'vite',    label: 'Vite',    icon: 'vite',    desc: 'Lightning fast HMR' },
  { value: 'webpack', label: 'Webpack', icon: 'webpack', desc: 'Battle-tested bundler' },
  { value: 'parcel',  label: 'Parcel',  icon: 'html5',   desc: 'Zero config bundler' },
]

const PACKAGE_MANAGERS: { value: PackageManager; label: string; icon: string; desc: string }[] = [
  { value: 'npm',  label: 'npm',  icon: 'npm',      desc: 'Default · Comes with Node' },
  { value: 'pnpm', label: 'pnpm', icon: 'pnpm',     desc: 'Fast · Disk efficient' },
  { value: 'yarn', label: 'yarn', icon: 'yarn',     desc: 'Reliable · Workspaces' },
]

const LINTING_OPTIONS: { value: Linting; label: string; icon: string; desc: string }[] = [
  { value: 'eslint+prettier', label: 'ESLint + Prettier', icon: 'eslint',    desc: 'Lint & format' },
  { value: 'eslint',          label: 'ESLint only',       icon: 'eslint',    desc: 'Lint only' },
  { value: 'none',            label: 'None',              icon: 'javascript', desc: 'No linting' },
]

const TESTING_OPTIONS: { value: Testing; label: string; icon: string; desc: string }[] = [
  { value: 'vitest',  label: 'Vitest',  icon: 'vite',       desc: 'Fast unit tests · Vite-native' },
  { value: 'jest',    label: 'Jest',    icon: 'jest',        desc: 'Battle-tested · Broad ecosystem' },
  { value: 'cypress', label: 'Cypress', icon: 'javascript',  desc: 'E2E testing · Real browser' },
  { value: 'none',    label: 'None',    icon: 'javascript',  desc: 'No testing setup' },
]

const FRAMEWORKS: { value: Framework; label: string; icon: string; desc: string }[] = [
  { value: 'react',   label: 'React',   icon: 'react',     desc: 'v18 · JSX/TSX' },
  { value: 'vue',     label: 'Vue',     icon: 'vuejs',     desc: 'v3 · Composition API' },
  { value: 'angular', label: 'Angular', icon: 'angularjs', desc: 'v17 · Angular CLI' },
]

const STYLING_OPTIONS: Record<Framework, { value: Styling; label: string; icon: string; desc: string }[]> = {
  react: [
    { value: 'tailwind', label: 'Tailwind CSS', icon: 'tailwindcss', desc: 'Utility-first CSS' },
    { value: 'mui',      label: 'Material UI',  icon: 'materialui',  desc: 'Google Material Design' },
    { value: 'css',      label: 'Plain CSS',    icon: 'css3',        desc: 'No framework' },
  ],
  vue: [
    { value: 'tailwind', label: 'Tailwind CSS', icon: 'tailwindcss', desc: 'Utility-first CSS' },
    { value: 'vuetify',  label: 'Vuetify',      icon: 'vuetify',     desc: 'Material Design for Vue' },
    { value: 'css',      label: 'Plain CSS',    icon: 'css3',        desc: 'No framework' },
  ],
  angular: [
    { value: 'angular-material', label: 'Angular Material', icon: 'angularjs',   desc: 'Official component lib' },
    { value: 'tailwind',         label: 'Tailwind CSS',     icon: 'tailwindcss', desc: 'Utility-first CSS' },
    { value: 'css',              label: 'Plain CSS',        icon: 'css3',        desc: 'No framework' },
  ],
}

const ROUTING_OPTIONS: Record<Framework, { value: Routing; label: string; desc: string }[]> = {
  react: [
    { value: 'react-router',    label: 'React Router',    desc: 'v6 · Most popular' },
    { value: 'tanstack-router', label: 'TanStack Router', desc: 'Type-safe routing' },
    { value: 'none',            label: 'None',            desc: 'No router' },
  ],
  vue: [
    { value: 'vue-router', label: 'Vue Router', desc: 'Official router' },
    { value: 'none',       label: 'None',       desc: 'No router' },
  ],
  angular: [
    { value: 'angular-router', label: 'Angular Router', desc: 'Built-in router' },
    { value: 'none',           label: 'None',           desc: 'No router' },
  ],
}

const STATE_OPTIONS: Record<Framework, { value: StateManagement; label: string; desc: string }[]> = {
  react: [
    { value: 'zustand', label: 'Zustand',       desc: 'Lightweight & simple' },
    { value: 'redux',   label: 'Redux Toolkit', desc: 'Battle-tested' },
    { value: 'none',    label: 'None',          desc: 'No state lib' },
  ],
  vue: [
    { value: 'pinia', label: 'Pinia', desc: 'Official Vue store' },
    { value: 'none',  label: 'None',  desc: 'No state lib' },
  ],
  angular: [
    { value: 'ngrx', label: 'NgRx', desc: 'Redux pattern for Angular' },
    { value: 'none', label: 'None', desc: 'No state lib' },
  ],
}

// ── theme tokens ──────────────────────────────────────────────────────────────

const T = {
  bg:           '#07111f',
  surface:      'rgba(255,255,255,0.04)',
  border:       'rgba(255,255,255,0.08)',
  accent:       '#22d3ee',
  accentDim:    'rgba(34,211,238,0.12)',
  accentBorder: 'rgba(34,211,238,0.35)',
  accentGlow:   'rgba(34,211,238,0.25)',
  text:         '#e2e8f0',
  muted:        '#64748b',
  faint:        'rgba(255,255,255,0.07)',
}

// ── sub-components ────────────────────────────────────────────────────────────

function OptionCard({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="relative w-full text-left rounded-xl border transition-all duration-200 p-4"
      style={{
        background:  selected ? T.accentDim : T.surface,
        borderColor: selected ? T.accent    : T.border,
        boxShadow:   selected ? `0 0 0 1px ${T.accentBorder}, 0 4px 24px ${T.accentGlow}` : 'none',
      }}
    >
      {selected && (
        <div className="absolute top-3 right-3">
          <CheckCircle2 size={13} color={T.accent} />
        </div>
      )}
      {children}
    </button>
  )
}

function Section({ icon, title, children, step }: { icon: React.ReactNode; title: string; children: React.ReactNode; step: number }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-5">
        <div
          className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-mono font-semibold flex-shrink-0"
          style={{ background: T.accentDim, color: T.accent, border: `1px solid ${T.accentBorder}` }}
        >
          {step}
        </div>
        <div className="flex items-center gap-2" style={{ color: T.text }}>
          {icon}
          <span className="font-medium text-xs tracking-widest uppercase">{title}</span>
        </div>
        <div className="flex-1 h-px" style={{ background: T.faint }} />
      </div>
      {children}
    </div>
  )
}

// ── summary panel ─────────────────────────────────────────────────────────────

function SummaryPanel({ cfg, onGenerate, loading }: { cfg: ProjectConfig; onGenerate: () => void; loading: boolean }) {
  const lines = [
    { label: 'Build Tool',  value: cfg.buildTool },
    { label: 'Framework',   value: cfg.framework },
    { label: 'Styling',     value: cfg.styling },
    { label: 'Language',    value: cfg.typescript ? 'TypeScript' : 'JavaScript' },
    { label: 'Routing',     value: cfg.routing },
    { label: 'State',       value: cfg.stateManagement },
    { label: 'Pkg Manager', value: cfg.packageManager },
    { label: 'Linting',     value: cfg.linting },
    { label: 'Testing',     value: cfg.testing },
  ]

  const installCmd = cfg.packageManager === 'yarn' ? 'yarn' : `${cfg.packageManager} install`
  const devCmd     = cfg.packageManager === 'yarn' ? 'yarn dev' : `${cfg.packageManager} run dev`

  return (
    <div className="sticky top-8 rounded-2xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
      {/* Header */}
      <div className="px-6 py-5 border-b" style={{ borderColor: T.border }}>
        <div className="flex items-center gap-2 mb-1">
          <Code2 size={14} color={T.accent} />
          <span className="text-xs font-medium tracking-wide" style={{ color: T.accent }}>Project Summary</span>
        </div>
        <p className="font-mono text-base font-semibold mt-1" style={{ color: '#f1f5f9' }}>{cfg.projectName}/</p>
      </div>

      {/* Stack */}
      <div className="px-6 py-4 space-y-3">
        {lines.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-xs" style={{ color: T.muted }}>{label}</span>
            <span className="font-mono text-xs px-2 py-0.5 rounded"
              style={{ background: T.accentDim, color: T.accent, border: `1px solid ${T.accentBorder}` }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Generate */}
      <div className="px-6 pb-6 pt-2">
        <button
          onClick={onGenerate}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95"
          style={{
            background: loading ? 'rgba(34,211,238,0.25)' : 'linear-gradient(135deg, #22d3ee, #0891b2)',
            color:      '#041e2b',
            boxShadow:  loading ? 'none' : `0 4px 20px ${T.accentGlow}`,
            cursor:     loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: '#041e2b', borderTopColor: 'transparent' }} />
              Generating...
            </>
          ) : (
            <><Download size={15} /> Generate &amp; Download</>
          )}
        </button>
        <p className="text-center text-xs mt-3 font-mono" style={{ color: T.muted }}>
          {installCmd} &amp;&amp; {devCmd}
        </p>
      </div>
    </div>
  )
}

// ── main app ──────────────────────────────────────────────────────────────────

export default function App() {
  const [cfg, setCfg]     = useState<ProjectConfig>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(false)
  const [done, setDone]   = useState(false)

  const set = <K extends keyof ProjectConfig>(key: K, value: ProjectConfig[K]) => {
    setCfg(prev => {
      const next = { ...prev, [key]: value }
      if (key === 'framework') {
        const fw = value as Framework
        next.styling         = STYLING_OPTIONS[fw][0].value
        next.routing         = ROUTING_OPTIONS[fw][0].value
        next.stateManagement = STATE_OPTIONS[fw][0].value
      }
      return next
    })
    setDone(false)
  }

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const blob = await generateProject(cfg)
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `${cfg.projectName}.zip`
      a.click()
      URL.revokeObjectURL(url)
      setDone(true)
    } finally {
      setLoading(false)
    }
  }

  const installCmd = cfg.packageManager === 'yarn' ? 'yarn' : `${cfg.packageManager} install`
  const devCmd     = cfg.packageManager === 'yarn' ? 'yarn dev' : `${cfg.packageManager} run dev`

  return (
    <div className="min-h-screen font-sans" style={{ background: T.bg, color: '#cbd5e1' }}>

      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.07] blur-3xl"
          style={{ background: 'radial-gradient(circle, #22d3ee, transparent)' }} />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-[0.05] blur-3xl"
          style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />
      </div>

      {/* Header */}
      <header className="relative border-b px-8 py-4 flex items-center justify-between"
        style={{ borderColor: T.border, background: 'rgba(255,255,255,0.02)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ background: 'linear-gradient(135deg, #22d3ee, #0891b2)' }}>
            <Layers size={15} color="#041e2b" />
          </div>
          <div>
            <div className="font-mono font-semibold text-sm" style={{ color: '#f1f5f9' }}>Frontend Initializr</div>
            <div className="text-xs" style={{ color: T.muted }}>Scaffold your frontend in seconds</div>
          </div>
        </div>
        <div className="font-mono text-xs px-3 py-1 rounded-full"
          style={{ background: T.accentDim, color: T.accent, border: `1px solid ${T.accentBorder}` }}>
          v0.1.0
        </div>
      </header>

      {/* Body */}
      <div className="relative max-w-6xl mx-auto px-8 py-12 grid grid-cols-3 gap-12">

        <div className="col-span-2">

          {/* Project name */}
          <div className="mb-10">
            <label className="block text-xs uppercase tracking-widest mb-3" style={{ color: T.muted }}>
              Project Name
            </label>
            <input
              value={cfg.projectName}
              onChange={e => set('projectName', e.target.value.replace(/\s+/g, '-').toLowerCase())}
              className="w-full px-4 py-3 rounded-xl font-mono text-sm outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`, color: '#f1f5f9' }}
              placeholder="my-app"
              spellCheck={false}
            />
          </div>

          {/* Build Tool */}
          <Section step={1} icon={<Wrench size={13} />} title="Build Tool">
            <div className="grid grid-cols-3 gap-3">
              {BUILD_TOOLS.map(b => (
                <OptionCard key={b.value} selected={cfg.buildTool === b.value} onClick={() => set('buildTool', b.value)}>
                  <DevIcon name={b.icon} size={26} />
                  <div className="font-semibold text-sm mt-2 mb-0.5" style={{ color: '#f1f5f9' }}>{b.label}</div>
                  <div className="text-xs" style={{ color: T.muted }}>{b.desc}</div>
                </OptionCard>
              ))}
            </div>
          </Section>

          {/* Framework */}
          <Section step={2} icon={<Code2 size={13} />} title="Framework">
            <div className="grid grid-cols-3 gap-3">
              {FRAMEWORKS.map(f => (
                <OptionCard key={f.value} selected={cfg.framework === f.value} onClick={() => set('framework', f.value)}>
                  <DevIcon name={f.icon} size={26} />
                  <div className="font-semibold text-sm mt-2 mb-0.5" style={{ color: '#f1f5f9' }}>{f.label}</div>
                  <div className="text-xs" style={{ color: T.muted }}>{f.desc}</div>
                </OptionCard>
              ))}
            </div>
          </Section>

          {/* Styling */}
          <Section step={3} icon={<Palette size={13} />} title="Styling">
            <div className="grid grid-cols-3 gap-3">
              {STYLING_OPTIONS[cfg.framework].map(s => (
                <OptionCard key={s.value} selected={cfg.styling === s.value} onClick={() => set('styling', s.value)}>
                  <DevIcon name={s.icon} size={26} />
                  <div className="font-semibold text-sm mt-2 mb-0.5" style={{ color: '#f1f5f9' }}>{s.label}</div>
                  <div className="text-xs" style={{ color: T.muted }}>{s.desc}</div>
                </OptionCard>
              ))}
            </div>
          </Section>

          {/* Language */}
          <Section step={4} icon={<Code2 size={13} />} title="Language">
            <div className="grid grid-cols-2 gap-3">
              {([true, false] as const).map(ts => (
                <OptionCard key={String(ts)} selected={cfg.typescript === ts} onClick={() => set('typescript', ts)}>
                  <DevIcon name={ts ? 'typescript' : 'javascript'} size={26} />
                  <div className="font-semibold text-sm mt-2 mb-0.5" style={{ color: '#f1f5f9' }}>
                    {ts ? 'TypeScript' : 'JavaScript'}
                  </div>
                  <div className="text-xs" style={{ color: T.muted }}>
                    {ts ? 'Strict typing · tsconfig included' : 'No type checking'}
                  </div>
                </OptionCard>
              ))}
            </div>
          </Section>

          {/* Routing */}
          <Section step={5} icon={<GitBranch size={13} />} title="Routing">
            <div className="grid grid-cols-3 gap-3">
              {ROUTING_OPTIONS[cfg.framework].map(r => (
                <OptionCard key={r.value} selected={cfg.routing === r.value} onClick={() => set('routing', r.value)}>
                  <div className="font-semibold text-sm mb-0.5" style={{ color: '#f1f5f9' }}>{r.label}</div>
                  <div className="text-xs" style={{ color: T.muted }}>{r.desc}</div>
                </OptionCard>
              ))}
            </div>
          </Section>

          {/* State */}
          <Section step={6} icon={<Database size={13} />} title="State Management">
            <div className="grid grid-cols-3 gap-3">
              {STATE_OPTIONS[cfg.framework].map(s => (
                <OptionCard key={s.value} selected={cfg.stateManagement === s.value} onClick={() => set('stateManagement', s.value)}>
                  <div className="font-semibold text-sm mb-0.5" style={{ color: '#f1f5f9' }}>{s.label}</div>
                  <div className="text-xs" style={{ color: T.muted }}>{s.desc}</div>
                </OptionCard>
              ))}
            </div>
          </Section>

          {/* Package Manager */}
          <Section step={7} icon={<Package size={13} />} title="Package Manager">
            <div className="grid grid-cols-3 gap-3">
              {PACKAGE_MANAGERS.map(p => (
                <OptionCard key={p.value} selected={cfg.packageManager === p.value} onClick={() => set('packageManager', p.value)}>
                  <DevIcon name={p.icon} size={26} />
                  <div className="font-semibold text-sm mt-2 mb-0.5" style={{ color: '#f1f5f9' }}>{p.label}</div>
                  <div className="text-xs" style={{ color: T.muted }}>{p.desc}</div>
                </OptionCard>
              ))}
            </div>
          </Section>

          {/* Linting */}
          <Section step={8} icon={<ShieldCheck size={13} />} title="Linting">
            <div className="grid grid-cols-3 gap-3">
              {LINTING_OPTIONS.map(l => (
                <OptionCard key={l.value} selected={cfg.linting === l.value} onClick={() => set('linting', l.value)}>
                  <DevIcon name={l.icon} size={26} />
                  <div className="font-semibold text-sm mt-2 mb-0.5" style={{ color: '#f1f5f9' }}>{l.label}</div>
                  <div className="text-xs" style={{ color: T.muted }}>{l.desc}</div>
                </OptionCard>
              ))}
            </div>
          </Section>

          {/* Testing */}
          <Section step={9} icon={<FlaskConical size={13} />} title="Testing">
            <div className="grid grid-cols-4 gap-3">
              {TESTING_OPTIONS.map(t => (
                <OptionCard key={t.value} selected={cfg.testing === t.value} onClick={() => set('testing', t.value)}>
                  <DevIcon name={t.icon} size={26} />
                  <div className="font-semibold text-sm mt-2 mb-0.5" style={{ color: '#f1f5f9' }}>{t.label}</div>
                  <div className="text-xs" style={{ color: T.muted }}>{t.desc}</div>
                </OptionCard>
              ))}
            </div>
          </Section>

        </div>

        {/* Summary sidebar */}
        <div className="col-span-1 space-y-4">
          <SummaryPanel cfg={cfg} onGenerate={handleGenerate} loading={loading} />
          <FileTree tree={buildFileTree(cfg)} />
          {done && (
            <div className="px-4 py-3 rounded-xl text-sm flex items-center gap-2"
              style={{ background: T.accentDim, border: `1px solid ${T.accentBorder}`, color: T.accent }}>
              <CheckCircle2 size={14} />
              <span>
                Done! Run{' '}
                <code className="font-mono text-xs">{installCmd} &amp;&amp; {devCmd}</code>
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
