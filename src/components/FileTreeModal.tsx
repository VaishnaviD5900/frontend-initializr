import { useEffect } from 'react'
import { X, FolderOpen } from 'lucide-react'
import { FileTree } from './FileTree'
import type { TreeNode } from '../utils/buildFileTree'

interface Props {
  tree: TreeNode
  onClose: () => void
}

export function FileTreeModal({ tree, onClose }: Props) {
  // close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: '#0d1f35', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2">
            <FolderOpen size={15} color="#f59e0b" />
            <span className="text-sm font-medium" style={{ color: '#e2e8f0' }}>Project File Preview</span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#64748b' }}
          >
            <X size={14} />
          </button>
        </div>

        {/* tree */}
        <div className="p-4 max-h-[60vh] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          <FileTree tree={tree} />
        </div>

        {/* footer */}
        <div className="px-5 py-3 border-t text-xs" style={{ borderColor: 'rgba(255,255,255,0.06)', color: '#475569' }}>
          Click outside or press <kbd className="font-mono px-1 py-0.5 rounded text-xs" style={{ background: 'rgba(255,255,255,0.08)', color: '#94a3b8' }}>Esc</kbd> to close
        </div>
      </div>
    </div>
  )
}
