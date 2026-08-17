import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label?: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  error?: string
  className?: string
}

export function Select({
  label,
  value,
  onChange,
  options,
  placeholder = 'Seçiniz',
  disabled = false,
  error,
  className,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 })

  const selectedOption = options.find((opt) => opt.value === value)
  const displayText = selectedOption?.label || placeholder

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setDropdownPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
    }
  }, [isOpen])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      setIsOpen(false)
    }
  }

  return (
    <div ref={containerRef} className={twMerge('relative flex flex-col gap-1', className)}>
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={twMerge(
          'flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm',
          'bg-slate-100 border-transparent transition-all',
          isOpen && 'border-slate-400 ring-1 ring-slate-300',
          error && 'border-red-500',
          disabled && 'cursor-not-allowed opacity-60',
          !disabled && 'hover:bg-slate-150',
        )}
      >
        <span className={selectedOption ? 'text-slate-900' : 'text-slate-400'}>{displayText}</span>
        {isOpen ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
      </button>

      {isOpen && (
        <div
          className="fixed z-50 max-h-60 overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg"
          style={{
            top: `${dropdownPos.top}px`,
            left: `${dropdownPos.left}px`,
            width: `${dropdownPos.width}px`,
          }}
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-500">Seçenek yok</div>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                onMouseDown={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={twMerge(
                  'w-full px-3 py-2 text-left text-sm transition-colors',
                  option.value === value
                    ? 'bg-slate-50 font-medium text-slate-900'
                    : 'hover:bg-slate-50 text-slate-700',
                )}
              >
                {option.label}
              </button>
            ))
          )}
        </div>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
