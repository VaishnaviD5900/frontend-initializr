import { useState } from 'react'
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText } from 'lucide-react'
import type { TreeNode } from '../utils/buildFileTree'

// ── file icon color by extension ─────────────────────────────────────────────

function fileColor(name: string): string {
  if (name.endsWith('.tsx') || name.endsWith('.jsx')) return '#61dafb'
  if (name.endsWith('.ts'))  return '#3178c6'
  if (name.endsWith('.js'))  return '#f7df1e'
  if (name.endsWith('.vue')) return '#42b883'
  if (name.endsWith('.css')) return '#38bdf8'
  if (name.endsWith('.html'))return '#e34c26'
  if (name.endsWith('.json'))return '#cbcb41'
  if (name.endsWith('.md'))  return '#8b949e'
  if (name.startsWith('.eslint')) return '#4b32c3'
  if (name.startsWith('.prettier')) return '#f7b93e'
  if (name.includes('vitest') || name.includes('jest') || name.includes('cypress')) return '#a3e635'
  if (name.includes('tailwind') || name.includes('postcss')) return '#38bdf8'
  if (name.includes('vite'))   return '#a855f7'
  if (name.includes('webpack')) return '#8dd6f9'
  return '#94a3b8'
}

// ── single tree node ──────────────────────────────────────────────────────────

function TreeNodeRow({ node, depth = 0, defaultOpen = false }: { node: TreeNode; depth?: number; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const isFolder = node.type === 'folder'
  const indent = depth * 12

  return (
    <div>
      <div
        className="flex items-center gap-1.5 py-0.5 px-2 rounded cursor-pointer group transition-colors duration-100"
        style={{ paddingLeft: `${8 + indent}px` }}
        onClick={() => isFolder && setOpen(o => !o)}
      >
        {/* chevron */}
        <div className="w-3 flex-shrink-0" style={{ color: '#475569' }}>
          {isFolder
            ? open
              ? <ChevronDown size={11} />
              : <ChevronRight size={11} />
            : null}
        </div>

        {/* icon */}
        {isFolder
          ? open
            ? <FolderOpen size={13} color="#f59e0b" />
            : <Folder     size={13} color="#f59e0b" />
          : <FileText size={13} color={fileColor(node.name)} />
        }

        {/* name */}
        <span
          className="text-xs font-mono leading-5 group-hover:text-white transition-colors"
          style={{ color: isFolder ? '#e2e8f0' : '#94a3b8' }}
        >
          {node.name}
        </span>
      </div>

      {/* children */}
      {isFolder && open && node.children && (
        <div>
          {node.children.map((child, i) => (
            <TreeNodeRow key={i} node={child} depth={depth + 1} defaultOpen={depth < 1} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── exported component ────────────────────────────────────────────────────────

export function FileTree({ tree }: { tree: TreeNode }) {
  const fileCount = countFiles(tree)

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* header */}
      <div
        className="px-4 py-3 flex items-center justify-between border-b"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-2">
          <FolderOpen size={13} color="#f59e0b" />
          <span className="text-xs font-medium tracking-wide" style={{ color: '#e2e8f0' }}>
            File Preview
          </span>
        </div>
        <span
          className="font-mono text-xs px-2 py-0.5 rounded"
          style={{ background: 'rgba(255,255,255,0.06)', color: '#64748b' }}
        >
          {fileCount} files
        </span>
      </div>

      {/* tree */}
      <div className="py-2 max-h-80 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        <TreeNodeRow node={tree} depth={0} defaultOpen={true} />
      </div>
    </div>
  )
}

function countFiles(node: TreeNode): number {
  if (node.type === 'file') return 1
  return (node.children ?? []).reduce((acc, child) => acc + countFiles(child), 0)
}
