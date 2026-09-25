import React from 'react'
import {
  RefreshCw,
  Globe,
  MapPin,
  Radio,
  Bookmark,
  Clock,
  Redo,
} from 'lucide-react'
import { FlightFilters } from '../../types/flight'

interface HeaderProps {
  filters: FlightFilters
  onFiltersChange: (filters: FlightFilters) => void
  flightCount: number
  totalFlightCount?: number
  arcCount: number
  pinnedCount: number
  onTogglePinnedDrawer: () => void
  isLoading: boolean
  isRefreshing: boolean
  isMockMode: boolean
  activeSource?: 'fr24' | 'opensky' | 'mock'
  onToggleMockMode: () => void
  lastUpdated: Date | null
  onRefresh: () => void
}

export const Header: React.FC<HeaderProps> = ({
  filters,
  onFiltersChange,
  flightCount,
  totalFlightCount,
  arcCount,
  pinnedCount,
  onTogglePinnedDrawer,
  isLoading,
  isRefreshing,
  isMockMode,
  activeSource = 'fr24',
  onToggleMockMode,
  lastUpdated,
  onRefresh,
}) => {
  const isFilterActive =
    Boolean(filters.searchQuery.trim()) ||
    Boolean(filters.airlineIcao) ||
    Boolean(filters.originAirport.trim()) ||
    Boolean(filters.destAirport.trim()) ||
    Boolean(filters.airportCode) ||
    Boolean(filters.pinnedOnly) ||
    Boolean(filters.flightStates && filters.flightStates.length > 0)

  const handleRegionToggle = (newRegion: 'north_america' | 'global') => {
    onFiltersChange({
      ...filters,
      region: newRegion,
    })
  }

  return (
    <header className="absolute top-0 left-0 right-0 z-20 bg-[#090a0f]/90 backdrop-blur-md border-b border-white/[0.08] px-4 py-2 flex items-center justify-between text-neutral-100 shadow-md">
      {/* Brand & Stats */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-2.5">
          <img src={`${import.meta.env.BASE_URL}airplane-header.svg`} alt="Flight Tracker" className="w-8 h-8 object-contain" />
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-neutral-100 flex items-center gap-2">
              Flight Tracker
            </h1>
          </div>
        </div>

        {/* Live Counters */}
        <div className="hidden md:flex items-center gap-2 text-[11px] font-mono tracking-tight text-neutral-400 bg-neutral-900/80 border border-white/[0.08] px-2.5 py-1 rounded-md">
          <span className="flex items-center gap-1.5 tabular-nums">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-neutral-100 font-bold">{flightCount.toLocaleString()}</span>
            {totalFlightCount !== undefined && totalFlightCount !== flightCount && (
              <span className="text-neutral-500">/{totalFlightCount.toLocaleString()}</span>
            )}{' '}
            <span className="text-neutral-400 font-sans text-[11px]">AIRCRAFT</span>
          </span>
          <span className="text-neutral-700">|</span>
          <span className="flex items-center gap-1 tabular-nums text-neutral-300">
            <Redo className="w-3 h-3 text-sky-400" />
            <span className="text-sky-400 font-bold">{arcCount.toLocaleString()}</span>
            <span className="text-neutral-400 font-sans text-[11px]">ROUTES</span>
          </span>
        </div>
      </div>

      {/* Center: Scope Toggle (North America vs Global) */}
      <div className="flex items-center bg-neutral-900/90 border border-white/[0.08] p-0.5 rounded-md text-xs font-medium">
        <button
          onClick={() => handleRegionToggle('north_america')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] transition-all cursor-pointer ${
            filters.region === 'north_america'
              ? 'bg-neutral-800 text-white font-medium shadow-xs border border-white/[0.08]'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>North America</span>
        </button>

        <button
          onClick={() => handleRegionToggle('global')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] transition-all cursor-pointer ${
            filters.region === 'global'
              ? 'bg-neutral-800 text-white font-medium shadow-xs border border-white/[0.08]'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
          title={isFilterActive ? 'Global View' : 'Global view has capped flight counts without a filter'}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Global</span>
          {!isFilterActive && (
            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/15 text-amber-300 font-mono border border-amber-500/30">
              CAPPED
            </span>
          )}
        </button>
      </div>

      {/* Right Controls: Mock Mode Toggle, Pinned, Refresh */}
      <div className="flex items-center gap-2">
        {/* Mock / Live Data Source Indicator & Toggle */}
        <button
          onClick={onToggleMockMode}
          title={
            isMockMode
              ? 'Currently in Simulated Mode. Click to switch to Live ADS-B'
              : `Active Feed: ${
                  activeSource === 'fr24'
                    ? 'Flightradar24'
                    : activeSource === 'opensky'
                    ? 'OpenSky Network'
                    : 'Simulated'
                }. Click to switch to Simulated Mode.`
          }
          className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-mono tracking-tight border transition-all cursor-pointer ${
            isMockMode
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
              : activeSource === 'opensky'
              ? 'bg-sky-500/10 border-sky-500/30 text-sky-300 hover:bg-sky-500/20'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isMockMode
                ? 'bg-amber-400'
                : activeSource === 'opensky'
                ? 'bg-sky-400'
                : 'bg-emerald-400'
            }`}
          />
          {isMockMode
            ? 'SIMULATED'
            : activeSource === 'opensky'
            ? 'OPENSKY'
            : 'FR24 LIVE'}
        </button>

        {/* Last Updated Timestamp */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-mono tabular-nums bg-neutral-900/80 border border-white/[0.08] text-neutral-400"
          title={lastUpdated ? `APIs last called at ${lastUpdated.toLocaleTimeString()}` : 'Live data not yet fetched'}
        >
          <Clock className="w-3 h-3 text-neutral-500 shrink-0" />
          <span className="text-neutral-200">
            {'Updated '}
            {lastUpdated ? lastUpdated.toLocaleTimeString() : '--:--:--'}
          </span>
        </div>

        {/* Pinned Flights Button */}
        <button
          onClick={onTogglePinnedDrawer}
          className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all cursor-pointer ${
            pinnedCount > 0
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
              : 'bg-neutral-900/80 border-white/[0.08] text-neutral-300 hover:bg-neutral-800 hover:text-white'
          }`}
          title="View Pinned Flights"
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Pinned</span>
          {pinnedCount > 0 && (
            <span className="flex items-center justify-center min-w-[16px] h-4 px-1 rounded bg-amber-400 text-neutral-950 font-bold text-[10px] font-mono tabular-nums">
              {pinnedCount}
            </span>
          )}
        </button>

        {/* Manual Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isLoading || isRefreshing}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-900/80 hover:bg-neutral-800 border border-white/[0.08] text-neutral-300 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
          title={`Last updated: ${lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-400' : 'text-neutral-400'}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
    </header>
  )
}
