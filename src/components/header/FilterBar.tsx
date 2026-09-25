import React from 'react'
import {
  Search,
  X,
  PlaneTakeoff,
  PlaneLanding,
  Building2,
  MapPin,
} from 'lucide-react'
import { Flight, FlightFilters } from '../../types/flight'
import { AIRLINES } from '../../data/airlines'
import { FlightStateFilter } from './FlightStateFilter'

interface FilterBarProps {
  filters: FlightFilters
  onFiltersChange: (filters: FlightFilters) => void
  flights: Flight[]
  pinnedIds?: string[]
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFiltersChange,
  flights,
  pinnedIds = [],
}) => {

  const isFiltered =
    Boolean(filters.searchQuery.trim()) ||
    Boolean(filters.airlineIcao) ||
    Boolean(filters.originAirport.trim()) ||
    Boolean(filters.destAirport.trim()) ||
    Boolean(filters.airportCode) ||
    Boolean(filters.flightStates && filters.flightStates.length > 0)

  const handleClearAll = () => {
    onFiltersChange({
      ...filters,
      searchQuery: '',
      airlineIcao: '',
      originAirport: '',
      destAirport: '',
      airportCode: undefined,
      flightStates: [],
    })
  }



  return (
    <div className="absolute top-14 left-4 z-20 flex flex-wrap items-center gap-2 bg-slate-950/85 backdrop-blur-md p-2 rounded-xl border border-slate-800/80 shadow-2xl text-xs max-w-[calc(100vw-2rem)]">
      {/* Search Input: Flight ID / Callsign */}
      <div className="relative flex items-center min-w-[160px] sm:min-w-[190px]">
        <Search className="absolute left-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={filters.searchQuery}
          onChange={e => onFiltersChange({ ...filters, searchQuery: e.target.value })}
          placeholder="Flight ID (e.g. DL1234)"
          className="w-full bg-slate-900 border border-slate-700/80 focus:border-sky-500 rounded-lg pl-8 pr-7 py-1.5 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all font-mono"
        />
        {filters.searchQuery && (
          <button
            onClick={() => onFiltersChange({ ...filters, searchQuery: '' })}
            className="absolute right-2 text-slate-400 hover:text-slate-200"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Airline Dropdown */}
      <div className="relative flex items-center">
        <Building2 className="absolute left-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <select
          value={filters.airlineIcao}
          onChange={e => onFiltersChange({ ...filters, airlineIcao: e.target.value })}
          className="bg-slate-900 border border-slate-700/80 focus:border-sky-500 rounded-lg pl-8 pr-6 py-1.5 text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all appearance-none cursor-pointer"
        >
          <option value="">All Airlines</option>
          {Object.values(AIRLINES).map(a => (
            <option key={a.icao} value={a.icao}>
              {a.name} ({a.icao})
            </option>
          ))}
        </select>
      </div>

      {/* Flight State Filter */}
      <FlightStateFilter
        filters={filters}
        onFiltersChange={onFiltersChange}
        flights={flights}
        pinnedIds={pinnedIds}
      />


      {/* Route: Origin Airport */}
      <div className="relative flex items-center w-24">
        <PlaneTakeoff className="absolute left-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          maxLength={4}
          value={filters.originAirport}
          onChange={e => onFiltersChange({ ...filters, originAirport: e.target.value.toUpperCase() })}
          placeholder="Origin"
          className="w-full bg-slate-900 border border-slate-700/80 focus:border-sky-500 rounded-lg pl-8 pr-2 py-1.5 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 uppercase font-mono"
        />
      </div>

      <span className="text-slate-500 font-bold hidden sm:inline">→</span>

      {/* Route: Destination Airport */}
      <div className="relative flex items-center w-24">
        <PlaneLanding className="absolute left-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          maxLength={4}
          value={filters.destAirport}
          onChange={e => onFiltersChange({ ...filters, destAirport: e.target.value.toUpperCase() })}
          placeholder="Dest"
          className="w-full bg-slate-900 border border-slate-700/80 focus:border-sky-500 rounded-lg pl-8 pr-2 py-1.5 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 uppercase font-mono"
        />
      </div>

      {/* Active Airport Hub Filter Badge */}
      {filters.airportCode && (
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sky-500/20 border border-sky-500/50 text-sky-200 font-mono text-xs">
          <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>Hub: <strong className="text-white">{filters.airportCode}</strong></span>
          <button
            onClick={() => onFiltersChange({ ...filters, airportCode: undefined })}
            className="text-sky-300 hover:text-white ml-0.5 p-0.5 rounded hover:bg-sky-500/30 transition-colors"
            title={`Clear ${filters.airportCode} hub filter`}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}



      {/* Clear All button */}
      {isFiltered && (
        <button
          onClick={handleClearAll}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30 text-xs transition-all cursor-pointer font-medium ml-0.5"
          title="Clear all active filters"
        >
          <X className="w-3.5 h-3.5" />
          <span>Clear All</span>
        </button>
      )}

    </div>
  )
}
