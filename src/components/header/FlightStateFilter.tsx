import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Check, ChevronDown, X, Gauge } from 'lucide-react'
import { Flight, FlightFilters, FlightState } from '../../types/flight'
import { FLIGHT_STATE_CONFIGS, FlightStateConfig } from '../../constants/flightStates'

interface FlightStateFilterProps {
  filters: FlightFilters
  onFiltersChange: (filters: FlightFilters) => void
  flights: Flight[]
  pinnedIds?: string[]
}

export const FlightStateFilter: React.FC<FlightStateFilterProps> = ({
  filters,
  onFiltersChange,
  flights,
  pinnedIds = [],
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedStates = useMemo(() => {
    return filters.flightStates || []
  }, [filters.flightStates])

  // Count flights per state
  const stateCounts = useMemo(() => {
    const counts: Record<FlightState, number> = {
      high_cruise: 0,
      mid_altitude: 0,
      climb_approach: 0,
      on_ground: 0,
      pinned: 0,
    }

    for (const f of flights) {
      for (const config of FLIGHT_STATE_CONFIGS) {
        if (config.predicate(f, pinnedIds)) {
          counts[config.id]++
        }
      }
    }

    return counts
  }, [flights, pinnedIds])

  // Count total matching flights for currently selected states
  const totalSelectedCount = useMemo(() => {
    if (selectedStates.length === 0) return flights.length
    return flights.filter(f =>
      selectedStates.some(stateId => {
        const config = FLIGHT_STATE_CONFIGS.find(c => c.id === stateId)
        return config ? config.predicate(f, pinnedIds) : false
      })
    ).length
  }, [flights, selectedStates, pinnedIds])

  // Close popover when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return

    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleToggleState = (stateId: FlightState) => {
    let nextStates: FlightState[]
    if (selectedStates.includes(stateId)) {
      nextStates = selectedStates.filter(id => id !== stateId)
    } else {
      nextStates = [...selectedStates, stateId]
    }
    onFiltersChange({
      ...filters,
      flightStates: nextStates,
    })
  }

  const handleSelectOnly = (e: React.MouseEvent, stateId: FlightState) => {
    e.stopPropagation()
    onFiltersChange({
      ...filters,
      flightStates: [stateId],
    })
  }

  const handleClear = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    onFiltersChange({
      ...filters,
      flightStates: [],
    })
  }

  const selectedConfigs = useMemo(() => {
    return FLIGHT_STATE_CONFIGS.filter(c => selectedStates.includes(c.id))
  }, [selectedStates])

  const singleConfig: FlightStateConfig | undefined =
    selectedConfigs.length === 1 ? selectedConfigs[0] : undefined

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Trigger Button */}
      {selectedStates.length === 0 ? (
        <button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs font-medium cursor-pointer ${
            isOpen
              ? 'bg-slate-800 border-slate-600 text-white shadow-lg'
              : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-600'
          }`}
          title="Filter flights by altitude and flight state"
        >
          <Gauge className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Flight State</span>
          <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      ) : singleConfig ? (
        <div
          onClick={() => setIsOpen(prev => !prev)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs font-medium cursor-pointer ${singleConfig.bgClass} ${singleConfig.borderClass} ${singleConfig.textClass}`}
          title={`Filtered to ${singleConfig.label} (${singleConfig.sublabel})`}
        >
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
            style={{
              backgroundColor: singleConfig.colorHex,
              boxShadow: `0 0 8px ${singleConfig.colorHex}aa`,
            }}
          />
          <span className="font-semibold text-white">{singleConfig.shortLabel}</span>
          <span className="text-[10px] opacity-80 font-mono">({stateCounts[singleConfig.id]})</span>
          <button
            type="button"
            onClick={handleClear}
            className="ml-0.5 p-0.5 rounded hover:bg-white/15 text-white/70 hover:text-white transition-colors"
            title="Clear flight state filter"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => setIsOpen(prev => !prev)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border bg-sky-500/15 border-sky-500/40 text-sky-200 transition-all text-xs font-medium cursor-pointer"
          title={`${selectedStates.length} flight states active`}
        >
          <div className="flex items-center -space-x-1">
            {selectedConfigs.map(c => (
              <span
                key={c.id}
                className="w-2.5 h-2.5 rounded-full border border-slate-900"
                style={{
                  backgroundColor: c.colorHex,
                  boxShadow: `0 0 6px ${c.colorHex}88`,
                }}
              />
            ))}
          </div>
          <span className="font-semibold text-white">{selectedStates.length} States</span>
          <span className="text-[10px] opacity-80 font-mono">({totalSelectedCount})</span>
          <button
            type="button"
            onClick={handleClear}
            className="ml-0.5 p-0.5 rounded hover:bg-white/15 text-white/70 hover:text-white transition-colors"
            title="Clear flight state filter"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Floating Dropdown Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-64 bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl z-30 p-2 text-xs flex flex-col gap-1 select-none animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between px-2 py-1 border-b border-slate-800/80 pb-1.5">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              Filter by Flight State
            </span>
            {selectedStates.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="text-[10px] text-sky-400 hover:text-sky-300 transition-colors font-medium cursor-pointer"
              >
                Reset All
              </button>
            )}
          </div>

          {/* List of Flight States */}
          <div className="flex flex-col gap-0.5 pt-1">
            {FLIGHT_STATE_CONFIGS.map(config => {
              const isSelected = selectedStates.includes(config.id)
              const count = stateCounts[config.id]

              return (
                <div
                  key={config.id}
                  onClick={() => handleToggleState(config.id)}
                  className={`group flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900/90 border border-slate-700/80 shadow-sm'
                      : 'hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Checkbox */}
                    <div
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all shrink-0 ${
                        isSelected
                          ? 'border-transparent text-slate-950'
                          : 'border-slate-700 group-hover:border-slate-500'
                      }`}
                      style={{
                        backgroundColor: isSelected ? config.colorHex : 'transparent',
                      }}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3] text-slate-950" />}
                    </div>

                    {/* Color Dot with glow */}
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                      style={{
                        backgroundColor: config.colorHex,
                        boxShadow: `0 0 8px ${config.colorHex}aa`,
                      }}
                    />

                    {/* Label & Sublabel */}
                    <div className="flex flex-col min-w-0">
                      <span className={`font-semibold text-xs leading-tight ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                        {config.label}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono leading-tight">
                        {config.sublabel}
                      </span>
                    </div>
                  </div>

                  {/* Actions / Count */}
                  <div className="flex items-center gap-1.5 pl-2 shrink-0">
                    <button
                      type="button"
                      onClick={e => handleSelectOnly(e, config.id)}
                      className="opacity-0 group-hover:opacity-100 text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 transition-all font-medium"
                      title={`Show only ${config.label}`}
                    >
                      Only
                    </button>
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800/80">
                      {count}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer Note */}
          <div className="px-2 pt-1.5 mt-0.5 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
            <span>Colors match aircraft on radar</span>
            <span>{flights.length} total</span>
          </div>
        </div>
      )}
    </div>
  )
}
