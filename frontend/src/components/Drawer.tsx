import { useEffect, useState } from 'react'
import { twMerge } from 'tailwind-merge'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export function Drawer({ isOpen, onClose, children, className }: DrawerProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true)
      const raf = requestAnimationFrame(() => setIsVisible(true))
      return () => cancelAnimationFrame(raf)
    }

    setIsVisible(false)
    const timeout = setTimeout(() => setIsMounted(false), 300)
    return () => clearTimeout(timeout)
  }, [isOpen])

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

  if (!isMounted) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 cursor-default" onClick={(e) => e.stopPropagation()}>
      <div
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        className={twMerge(
          'absolute inset-0 bg-black/40 transition-opacity duration-300',
          isVisible ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div
        onClick={(e) => e.stopPropagation()}
        className={twMerge(
          'absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out',
          isVisible ? 'translate-x-0' : 'translate-x-full',
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}
