import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface Props {
  label: string
  command: string
  accent?: string
}

const T = {
  accent:       '#22d3ee',
  accentDim:    'rgba(34,211,238,0.12)',
  accentBorder: 'rgba(34,211,238,0.35)',
}

export function CopyButton({ label, command, accent = T.accent }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="min-w-0">
        <div className="text-xs mb-0.5" style={{ color: '#475569' }}>{label}</div>
        <div className="font-mono text-xs truncate" style={{ color: '#94a3b8' }}>{command}</div>
      </div>
      <button
        onClick={handleCopy}
        className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200"
        style={{
          background: copied ? 'rgba(34,211,238,0.15)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${copied ? T.accentBorder : 'rgba(255,255,255,0.1)'}`,
          color: copied ? accent : '#64748b',
        }}
        title={`Copy ${label} command`}
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
      </button>
    </div>
  )
}
