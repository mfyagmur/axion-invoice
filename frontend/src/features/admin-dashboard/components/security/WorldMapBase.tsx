import { useMemo } from 'react'
import * as DottedMapWithoutCountriesModule from 'dotted-map/without-countries'
import worldMapData from '@/features/admin-dashboard/components/security/worldMapData'

type DottedMapCtor = new (settings: { map: unknown; avoidOuterPins?: boolean }) => {
  getPin: (pin: { lat: number; lng: number }) => { x: number; y: number }
  getSVG: (settings: { shape: 'circle' | 'hexagon'; backgroundColor: string; color: string; radius: number }) => string
  image: { width: number; height: number }
}

function resolveDottedMapCtor(mod: unknown): DottedMapCtor {
  let candidate = mod as { default?: unknown }
  for (let i = 0; i < 3 && typeof candidate !== 'function'; i += 1) {
    candidate = (candidate as { default?: unknown })?.default as typeof candidate
  }
  return candidate as unknown as DottedMapCtor
}

const DottedMapWithoutCountries = resolveDottedMapCtor(DottedMapWithoutCountriesModule)

const worldMap = new DottedMapWithoutCountries({ map: worldMapData })

export function latLonToPercent(lat: number, lon: number): { left: string; top: string } {
  const pin = worldMap.getPin({ lat, lng: lon })
  return {
    left: `${(pin.x / worldMap.image.width) * 100}%`,
    top: `${(pin.y / worldMap.image.height) * 100}%`,
  }
}

interface WorldMapBaseProps {
  dotRadius?: number
  className?: string
}

export function WorldMapBase({ dotRadius = 0.32, className }: WorldMapBaseProps) {
  const svgMarkup = useMemo(() => {
    const raw = worldMap.getSVG({ shape: 'circle', backgroundColor: 'transparent', color: 'currentColor', radius: dotRadius })
    return raw.replace('<svg ', '<svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" ')
  }, [dotRadius])

  return (
    <div
      className={`absolute inset-0 text-slate-300 dark:text-slate-700 ${className ?? ''}`}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  )
}
