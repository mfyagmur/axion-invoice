import { useRef, useState, useEffect, useLayoutEffect } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { HelpCircle } from 'lucide-react'

interface InfoTooltipProps {
  title: string
  description: string | ReactNode
  className?: string
}

export function InfoTooltip({ title, description, className = '' }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)

  useLayoutEffect(() => {
    if (!isOpen) {
      setIsVisible(false)
      const timer = setTimeout(() => setIsMounted(false), 150)
      return () => clearTimeout(timer)
    }

    setIsMounted(true)
    const updatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        const tooltipWidth = 256 // w-64 = 256px
        const padding = 8

        let left = rect.left + rect.width / 2 + window.scrollX
        left = Math.min(Math.max(left, padding + tooltipWidth / 2), window.innerWidth - padding - tooltipWidth / 2)

        const top = rect.top + window.scrollY - 8

        setPosition({ top, left })
      }
    }

    updatePosition()
    const timer = requestAnimationFrame(() => setIsVisible(true))

    const handleScroll = () => updatePosition()
    const handleResize = () => updatePosition()

    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(timer)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleResize)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isMounted) return

    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMounted])

  const tooltipContent = (
    <div
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translate(-50%, -100%)',
        zIndex: 9999,
        transformOrigin: 'bottom center',
      }}
      className={`transition-all duration-150 ease-out ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
    >
      <div className="mb-2 w-64 rounded-lg bg-white shadow-lg border border-slate-200 p-3">
        <div className="text-xs font-semibold text-slate-900 mb-1">{title}</div>
        <div className="text-xs text-slate-600 font-normal leading-relaxed">{description}</div>
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white"
          style={{ borderTopColor: 'white' }}
        />
      </div>
    </div>
  )

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className={`inline-flex items-center justify-center p-0 text-slate-400 transition-colors hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-1 rounded ${className}`}
        aria-label={title}
      >
        <HelpCircle size={14} />
      </button>

      {isMounted && createPortal(tooltipContent, document.body)}
    </>
  )
}
