import React from 'react'
import {
  Plane,
  RefreshCw,
  Globe,
  MapPin,
  Radio,
  Bookmark,
  Sparkles,
  Clock,
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
    Boolean(filters.airportCode)

  const handleRegionToggle = (newRegion: 'north_america' | 'global') => {
    onFiltersChange({
      ...filters,
      region: newRegion,
    })
  }

  return (
    <header className="absolute top-0 left-0 right-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between text-white shadow-xl">
      {/* Brand & Stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/40 text-sky-400">
            <Plane className="w-5 h-5 -rotate-45" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-100 flex items-center gap-2">
              SkyTrack
            </h1>
          </div>
        </div>

        {/* Live Counters */}
        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-full">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-100 font-semibold">{flightCount.toLocaleString()}</span>
            {totalFlightCount !== undefined && totalFlightCount !== flightCount && (
              <span className="text-slate-500 font-normal">/{totalFlightCount.toLocaleString()}</span>
            )}{' '}
            Active
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-400" />
            <span className="text-sky-300 font-semibold">{arcCount.toLocaleString()}</span> 3D Arcs
          </span>
        </div>
      </div>

      {/* Center: Scope Toggle (North America vs Global) */}
      <div className="flex items-center bg-slate-900/90 border border-slate-800 p-0.5 rounded-lg text-xs font-medium">
        <button
          onClick={() => handleRegionToggle('north_america')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
            filters.region === 'north_america'
              ? 'bg-sky-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          North America
        </button>

        <button
          onClick={() => handleRegionToggle('global')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
            filters.region === 'global'
              ? 'bg-sky-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title={isFilterActive ? 'Global View' : 'Global view has capped flight counts without a filter'}
        >
          <Globe className="w-3.5 h-3.5" />
          Global
          {!isFilterActive && (
            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-normal border border-amber-500/30">
              Capped
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
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono border transition-all ${
            isMockMode
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
              : activeSource === 'opensky'
              ? 'bg-sky-500/15 border-sky-500/40 text-sky-300 hover:bg-sky-500/25'
              : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isMockMode
                ? 'bg-amber-400'
                : activeSource === 'opensky'
                ? 'bg-sky-400 animate-pulse'
                : 'bg-emerald-400 animate-pulse'
            }`}
          />
          {isMockMode
            ? 'Simulated Feed'
            : activeSource === 'opensky'
            ? 'Live: OpenSky'
            : 'Live: FR24'}
        </button>

        {/* Last Updated Timestamp */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono bg-slate-900/90 border border-slate-800 text-slate-400"
          title={lastUpdated ? `APIs last called at ${lastUpdated.toLocaleTimeString()}` : 'Live data not yet fetched'}
        >
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-400 hidden md:inline">Updated:</span>
          <span className="text-slate-200 font-semibold">
            {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Loading...'}
          </span>
        </div>

        {/* Pinned Flights Button */}
        <button
          onClick={onTogglePinnedDrawer}
          className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs border transition-all ${
            pinnedCount > 0
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
          title="View Pinned Flights"
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Pinned</span>
          {pinnedCount > 0 && (
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px]">
              {pinnedCount}
            </span>
          )}
        </button>

        {/* Manual Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isLoading || isRefreshing}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all disabled:opacity-50"
          title={`Last updated: ${lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
    </header>
  )
}
