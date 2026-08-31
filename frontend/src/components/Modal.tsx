import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'md' | 'xl'
  footer?: ReactNode
}

export function Modal({ isOpen, onClose, title, children, size = 'md', footer }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  const isXl = size === 'xl'

  return (
    <div
      className={twMerge(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/40',
        isXl && 'backdrop-blur-sm',
      )}
    >
      <div
        className={twMerge(
          'relative w-full rounded-lg bg-white shadow-xl dark:bg-slate-800',
          isXl ? 'flex max-h-[95vh] w-[90%] max-w-6xl flex-col rounded-2xl bg-slate-50 dark:bg-slate-900' : 'max-w-lg',
        )}
      >
        <div
          className={twMerge(
            'flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-700',
            isXl && 'relative justify-center px-6 py-3.5',
          )}
        >
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          <button
            onClick={onClose}
            className={twMerge(
              'text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200',
              isXl && 'absolute right-6 top-1/2 -translate-y-1/2',
            )}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <div className={twMerge('p-6', isXl && 'flex-1 overflow-hidden')}>{children}</div>
        {footer && (
          <div
            className={twMerge(
              'flex justify-end gap-2 border-t border-slate-200 p-6 dark:border-slate-700',
              isXl && 'px-6 py-3',
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
