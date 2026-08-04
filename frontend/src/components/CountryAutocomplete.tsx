import { useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { COUNTRIES } from '@/data/countries'

interface CountryAutocompleteProps {
  label: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
}

export function CountryAutocomplete({
  label,
  value,
  onChange,
  onBlur,
  error,
}: CountryAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filtered, setFiltered] = useState<typeof COUNTRIES>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setSelectedIndex(-1)

    if (newValue.length >= 3) {
      const lower = newValue.toLowerCase()
      const matches = COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().startsWith(lower) ||
          c.name.toLowerCase().includes(lower),
      ).slice(0, 8)
      setFiltered(matches)
      setIsOpen(matches.length > 0)
    } else {
      setFiltered([])
      setIsOpen(false)
    }
  }

  const handleSelectCountry = (countryName: string) => {
    onChange(countryName)
    setIsOpen(false)
    setFiltered([])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < filtered.length - 1 ? prev + 1 : prev,
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && filtered[selectedIndex]) {
          handleSelectCountry(filtered[selectedIndex].name)
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        break
      default:
        break
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1">
      <label htmlFor="country-input" className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id="country-input"
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (value.length >= 3) {
            const lower = value.toLowerCase()
            const matches = COUNTRIES.filter(
              (c) =>
                c.name.toLowerCase().startsWith(lower) ||
                c.name.toLowerCase().includes(lower),
            ).slice(0, 8)
            setFiltered(matches)
            setIsOpen(matches.length > 0)
          }
        }}
        className={twMerge(
          'rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none',
          error && 'border-red-500',
        )}
        placeholder=""
      />
      {error && <p className="text-xs text-red-600">{error}</p>}

      {isOpen && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-10 mt-1 max-h-48 overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg">
          {filtered.map((country, index) => (
            <button
              key={country.code}
              type="button"
              onMouseDown={() => handleSelectCountry(country.name)}
              className={twMerge(
                'w-full px-3 py-2 text-left text-sm hover:bg-slate-100',
                index === selectedIndex && 'bg-slate-100',
              )}
            >
              <span className="font-medium">{country.name}</span>
              <span className="ml-2 text-xs text-slate-500">({country.code})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
