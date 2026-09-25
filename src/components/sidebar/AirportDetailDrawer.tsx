import React, { useState, useMemo, useEffect } from 'react'
import {
  X,
  PlaneLanding,
  PlaneTakeoff,
  LocateFixed,
  ExternalLink,
  ChevronRight,
  Filter,
  Plane,
  Navigation,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react'
import { Airport, Flight, FlightFilters } from '../../types/flight'
import {
  formatAltitude,
  formatDuration,
  calculateDistanceNm,
} from '../../utils/geo'
import { formatAirportLocalTime } from '../../utils/timezone'

interface AirportDetailDrawerProps {
  airport: Airport | null
  onClose: () => void
  flights: Flight[]
  filters?: FlightFilters
  onFiltersChange?: (filters: FlightFilters) => void
  onSelectFlight: (flight: Flight) => void
  onFocusCamera: (lat: number, lon: number) => void
  isFilteredByThisAirport: boolean
  onToggleFilterHub: (airportCode: string) => void
  isBookmarked?: boolean
  onToggleBookmark?: (airport: Airport) => void
}

type AirportTab = 'inbound' | 'outbound' | 'ground'

interface FlightTimingInfo {
  badgeText: string
  subText: string
  badgeClass: string
}

function getFlightTimingDetails(flight: Flight, airport: Airport): FlightTimingInfo {
  const code = airport.iata.toUpperCase()
  const isDest =
    flight.destIata?.toUpperCase() === code ||
    flight.destAirport?.iata.toUpperCase() === code
  const isOrigin =
    flight.originIata?.toUpperCase() === code ||
    flight.originAirport?.iata.toUpperCase() === code

  // 1. INBOUND FLIGHT (heading towards this airport)
  if (isDest && !isOrigin) {
    if (flight.onGround) {
      return {
        badgeText: 'Landed',
        subText: flight.speed > 5 ? 'Taxiing to gate' : 'Parked at gate',
        badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
      }
    }

    let timeRem = flight.timeRemainingMinutes
    if (timeRem === undefined && flight.destAirport && flight.speed > 50) {
      const dist = calculateDistanceNm(
        flight.latitude,
        flight.longitude,
        airport.latitude,
        airport.longitude
      )
      timeRem = Math.round((dist / flight.speed) * 60)
    }

    // Format ETA in the destination airport's local timezone
    const etaStr = formatAirportLocalTime(flight.estimatedArrivalTime, airport, true)
    const timeDisplay =
      timeRem !== undefined && timeRem > 0
        ? `Landing in ${formatDuration(timeRem)}`
        : 'Landing soon'

    return {
      badgeText: timeDisplay,
      subText: etaStr ? `ETA ${etaStr}` : 'Inbound approach',
      badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
    }
  }

  // 2. OUTBOUND FLIGHT (originating from this airport)
  if (isOrigin) {
    if (flight.onGround) {
      // Ground flight getting ready to depart
      const isTaxiing = flight.speed > 5
      const departureMins = isTaxiing ? 10 : 20
      return {
        badgeText: `Departs in ~${departureMins}m`,
        subText: isTaxiing ? 'Taxiing to runway' : 'At gate / Boarding',
        badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
      }
    }

    // Airborne outbound flight (has departed)
    let elapsedMinutes: number | undefined
    if (
      flight.distanceTotalNm &&
      flight.distanceRemainingNm &&
      flight.speed > 50
    ) {
      const flown = Math.max(0, flight.distanceTotalNm - flight.distanceRemainingNm)
      elapsedMinutes = Math.round((flown / flight.speed) * 60)
    } else {
      const dist = calculateDistanceNm(
        airport.latitude,
        airport.longitude,
        flight.latitude,
        flight.longitude
      )
      if (flight.speed > 50) {
        elapsedMinutes = Math.round((dist / flight.speed) * 60)
      }
    }

    const elapsedDisplay =
      elapsedMinutes !== undefined && elapsedMinutes > 0
        ? `Departed ${formatDuration(elapsedMinutes)} ago`
        : 'Just departed'

    return {
      badgeText: elapsedDisplay,
      subText:
        flight.altitude > 0
          ? `En route • ${formatAltitude(flight.altitude)}`
          : 'En route',
      badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
    }
  }

  // 3. FALLBACK / GENERAL GROUND
  if (flight.onGround) {
    return {
      badgeText: 'On Ground',
      subText: flight.speed > 5 ? 'Taxiing' : 'Parked',
      badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
    }
  }

  return {
    badgeText: 'En route',
    subText: formatAltitude(flight.altitude),
    badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
  }
}

export const AirportDetailDrawer: React.FC<AirportDetailDrawerProps> = ({
  airport,
  onClose,
  flights,
  filters,
  onFiltersChange,
  onSelectFlight,
  onFocusCamera,
  isFilteredByThisAirport: _isFilteredByThisAirport,
  onToggleFilterHub: _onToggleFilterHub,
  isBookmarked = false,
  onToggleBookmark,
}) => {
  const [activeTab, setActiveTab] = useState<AirportTab>('inbound')

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const searchQuery = filters?.searchQuery
  const airlineIcao = filters?.airlineIcao

  // Apply active search query & airline filters from top FilterBar to candidate flights
  const filteredCandidateFlights = useMemo(() => {
    let list = flights

    // 1. Search Query filter (flight ID, callsign, registration, hex ID)
    if (searchQuery?.trim()) {
      const q = searchQuery.trim().toUpperCase()
      list = list.filter(
        f =>
          f.flightNumber.toUpperCase().includes(q) ||
          f.callsign.toUpperCase().includes(q) ||
          f.registration?.toUpperCase().includes(q) ||
          f.id.toUpperCase().includes(q)
      )
    }

    // 2. Airline filter
    if (airlineIcao) {
      const airlineCode = airlineIcao.toUpperCase()
      list = list.filter(
        f =>
          f.airlineIcao?.toUpperCase() === airlineCode ||
          f.callsign.startsWith(airlineCode)
      )
    }

    return list
  }, [flights, searchQuery, airlineIcao])

  const hasActiveFilters = Boolean(
    filters?.searchQuery?.trim() || filters?.airlineIcao
  )

  const handleClearActiveFilters = () => {
    if (!onFiltersChange || !filters) return
    onFiltersChange({
      ...filters,
      searchQuery: '',
      airlineIcao: '',
    })
  }

  // Inbound flights: destination matches this airport and currently in-flight
  const inboundFlights = useMemo(() => {
    if (!airport) return []
    const code = airport.iata.toUpperCase()
    return filteredCandidateFlights.filter(
      f =>
        !f.onGround &&
        (f.destIata?.toUpperCase() === code || f.destAirport?.iata.toUpperCase() === code)
    )
  }, [filteredCandidateFlights, airport])

  // Outbound flights: origin matches this airport (both airborne departures and departing ground flights)
  const outboundFlights = useMemo(() => {
    if (!airport) return []
    const code = airport.iata.toUpperCase()
    return filteredCandidateFlights.filter(f => {
      const isOrigin =
        f.originIata?.toUpperCase() === code || f.originAirport?.iata.toUpperCase() === code
      if (!isOrigin) return false
      if (!f.onGround) return true
      // If on the ground, ensure it is physically at this airport preparing to depart
      const distFromAirport = calculateDistanceNm(
        airport.latitude,
        airport.longitude,
        f.latitude,
        f.longitude
      )
      return distFromAirport < 25
    })
  }, [filteredCandidateFlights, airport])

  // Ground flights: onGround is true and aircraft is physically located at this airport
  const groundFlights = useMemo(() => {
    if (!airport) return []
    return filteredCandidateFlights.filter(f => {
      if (!f.onGround) return false
      const dist = calculateDistanceNm(
        airport.latitude,
        airport.longitude,
        f.latitude,
        f.longitude
      )
      return dist < 25
    })
  }, [filteredCandidateFlights, airport])

  if (!airport) return null

  const activeFlightList =
    activeTab === 'inbound'
      ? inboundFlights
      : activeTab === 'outbound'
      ? outboundFlights
      : groundFlights

  const getFlightColorHex = (flight: Flight) => {
    if (flight.onGround) return '#94a3b8'
    if (flight.altitude > 30000) return '#38bdf8'
    if (flight.altitude > 10000) return '#818cf8'
    return '#34d399'
  }

  return (
    <aside className="absolute top-0 right-0 bottom-0 z-30 w-full sm:w-[420px] bg-[#0c0d12]/95 backdrop-blur-xl border-l border-white/[0.08] shadow-2xl flex flex-col text-neutral-100 overflow-hidden animate-in slide-in-from-right duration-200">
      {/* 1. Header: Airport Identity & Quick Actions */}
      <div className="p-4 border-b border-white/[0.08] bg-neutral-900/60 shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight text-white">
                {airport.iata}
              </span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-[4px] bg-neutral-800 text-neutral-300 border border-white/[0.08]">
                {airport.icao}
              </span>
            </div>
            <h2 className="text-sm font-semibold text-white truncate mt-1" title={airport.name}>
              {airport.name}
            </h2>
            <p className="text-xs text-neutral-400 truncate">
              {airport.city}, {airport.country}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Bookmark Airport Button */}
            {onToggleBookmark && (
              <button
                onClick={() => onToggleBookmark(airport)}
                className={`p-1.5 rounded-[5px] border transition-all cursor-pointer ${
                  isBookmarked
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    : 'bg-neutral-900 hover:bg-neutral-800 border-white/[0.08] text-neutral-400 hover:text-white'
                }`}
                title={isBookmarked ? 'Remove airport bookmark' : 'Bookmark airport to MapControls'}
                aria-label={isBookmarked ? 'Remove airport bookmark' : 'Bookmark airport to MapControls'}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-4 h-4 text-amber-400" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Focus Camera Button */}
            <button
              onClick={() => onFocusCamera(airport.latitude, airport.longitude)}
              className="p-1.5 rounded-[5px] bg-neutral-900 hover:bg-neutral-800 border border-white/[0.08] text-neutral-400 hover:text-white transition-all cursor-pointer"
              title="Focus map on airport"
            >
              <LocateFixed className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-[5px] bg-neutral-900 hover:bg-neutral-800 border border-white/[0.08] text-neutral-400 hover:text-white transition-all cursor-pointer"
              title="Close airport drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active Filter Status Banner */}
        {hasActiveFilters && (
          <div className="mt-2.5 flex items-center justify-between px-2.5 py-1.5 rounded-[5px] bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 font-medium">
            <span className="flex items-center gap-1.5 truncate">
              <Filter className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span className="truncate">
                Filtered by:{' '}
                {[
                  filters?.searchQuery?.trim() && `"${filters.searchQuery.trim()}"`,
                  filters?.airlineIcao && `Airline (${filters.airlineIcao})`,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </span>
            </span>
            {onFiltersChange && (
              <button
                onClick={handleClearActiveFilters}
                className="text-[11px] underline hover:text-white shrink-0 ml-2 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. Operations Summary Grid */}
      <div className="p-3 border-b border-white/[0.08] bg-neutral-900/20 shrink-0">
        <div className="grid grid-cols-3 gap-1.5 bg-neutral-900/80 p-1 rounded-md border border-white/[0.08]">
          {/* Inbound Tab */}
          <button
            onClick={() => setActiveTab('inbound')}
            className={`flex flex-col items-center justify-center py-2 px-1.5 rounded-[4px] text-center transition-all cursor-pointer ${
              activeTab === 'inbound'
                ? 'bg-neutral-800 text-white shadow-xs border border-white/[0.08]'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
          >
            <div className="flex items-center gap-1 text-rose-400 mb-0.5">
              <PlaneLanding className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold uppercase tracking-wider font-mono">Inbound</span>
            </div>
            <span className="text-base font-bold font-mono tabular-nums text-white leading-tight">
              {inboundFlights.length}
            </span>
          </button>

          {/* Outbound Tab */}
          <button
            onClick={() => setActiveTab('outbound')}
            className={`flex flex-col items-center justify-center py-2 px-1.5 rounded-[4px] text-center transition-all cursor-pointer ${
              activeTab === 'outbound'
                ? 'bg-neutral-800 text-white shadow-xs border border-white/[0.08]'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
          >
            <div className="flex items-center gap-1 text-sky-400 mb-0.5">
              <PlaneTakeoff className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold uppercase tracking-wider font-mono">Outbound</span>
            </div>
            <span className="text-base font-bold font-mono tabular-nums text-white leading-tight">
              {outboundFlights.length}
            </span>
          </button>

          {/* On Ground Tab */}
          <button
            onClick={() => setActiveTab('ground')}
            className={`flex flex-col items-center justify-center py-2 px-1.5 rounded-[4px] text-center transition-all cursor-pointer ${
              activeTab === 'ground'
                ? 'bg-neutral-800 text-white shadow-xs border border-white/[0.08]'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
          >
            <div className="flex items-center gap-1 text-neutral-400 mb-0.5">
              <Plane className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold uppercase tracking-wider font-mono">On Ground</span>
            </div>
            <span className="text-base font-bold font-mono tabular-nums text-white leading-tight">
              {groundFlights.length}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Section Title & Current Tab Filter */}
      <div className="px-4 py-1.5 bg-[#090a0f] border-b border-white/[0.08] flex items-center justify-between text-xs shrink-0">
        <span className="font-semibold text-neutral-400 uppercase tracking-wider font-mono text-[10px]">
          {activeTab === 'inbound'
            ? `Inbound Flights (${inboundFlights.length})`
            : activeTab === 'outbound'
            ? `Outbound Flights (${outboundFlights.length})`
            : `Grounded & Taxiing (${groundFlights.length})`}
        </span>
      </div>

      {/* 4. Scrollable Flight List */}
      <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-1.5">
        {activeFlightList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-10 h-10 rounded-md bg-neutral-900 border border-white/[0.08] flex items-center justify-center text-neutral-500 mb-3">
              {activeTab === 'inbound' ? (
                <PlaneLanding className="w-5 h-5 text-neutral-500" />
              ) : activeTab === 'outbound' ? (
                <PlaneTakeoff className="w-5 h-5 text-neutral-500" />
              ) : (
                <Plane className="w-5 h-5 text-neutral-500" />
              )}
            </div>
            <p className="text-sm font-semibold text-neutral-300">
              {hasActiveFilters
                ? `No matching ${activeTab} flights`
                : `No active ${activeTab} flights`}
            </p>
            <p className="text-xs text-neutral-500 mt-1 max-w-xs">
              {hasActiveFilters ? (
                <span>
                  No {activeTab} flights match the active search or airline filter.{' '}
                  {onFiltersChange && (
                    <button
                      onClick={handleClearActiveFilters}
                      className="text-sky-400 underline hover:text-sky-300 cursor-pointer ml-1"
                    >
                      Clear filters
                    </button>
                  )}
                </span>
              ) : (
                `There are currently no tracked flights ${
                  activeTab === 'inbound'
                    ? 'heading into'
                    : activeTab === 'outbound'
                    ? 'departing from'
                    : 'on the ground at'
                } ${airport.iata}.`
              )}
            </p>
          </div>
        ) : (
          activeFlightList.map(flight => {
            const colorHex = getFlightColorHex(flight)
            const originStr = flight.originIata || flight.originAirport?.iata || '---'
            const destStr = flight.destIata || flight.destAirport?.iata || '---'
            const airlineDisplay = flight.airlineName || flight.airlineIcao || 'Commercial Flight'
            const timing = getFlightTimingDetails(flight, airport)

            return (
              <div
                key={flight.id}
                onClick={() => onSelectFlight(flight)}
                className="group relative flex flex-col p-2.5 rounded-[5px] bg-neutral-900/50 hover:bg-neutral-900 border border-white/[0.06] hover:border-white/[0.14] transition-all cursor-pointer shadow-xs"
              >
                {/* Top Row: 1. Flight ID & 4. Timing Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Radar Color Dot */}
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: colorHex,
                        boxShadow: `0 0 6px ${colorHex}88`,
                      }}
                    />

                    {/* 1. Flight ID */}
                    <span className="font-mono font-bold text-xs text-white group-hover:text-sky-400 transition-colors tracking-tight">
                      {flight.flightNumber}
                    </span>

                    {/* Optional Callsign badge */}
                    {flight.callsign && flight.callsign !== flight.flightNumber && (
                      <span className="text-[10px] font-mono text-neutral-400 bg-neutral-800 px-1 py-0.2 rounded border border-white/[0.06]">
                        {flight.callsign}
                      </span>
                    )}
                  </div>

                  {/* 4. Timing Pill Badge */}
                  <div
                    className={`px-1.5 py-0.5 rounded-[4px] border text-[10px] font-mono font-semibold shrink-0 tabular-nums ${timing.badgeClass}`}
                  >
                    {timing.badgeText}
                  </div>
                </div>

                {/* Middle Row: 2. Origin -> Destination & Timing Subtext */}
                <div className="flex items-center justify-between gap-2 mt-1.5">
                  {/* 2. Origin -> Destination */}
                  <div className="flex items-center gap-1.5 font-mono text-xs tabular-nums">
                    <span className="font-bold text-sky-300">{originStr}</span>
                    <span className="text-neutral-600 font-bold">→</span>
                    <span className="font-bold text-emerald-300">{destStr}</span>
                  </div>

                  {/* Timing secondary subtext */}
                  <span className="text-[10px] font-mono text-neutral-400 truncate text-right">
                    {timing.subText}
                  </span>
                </div>

                {/* Bottom Row: 3. Airline Name & Inspect Action */}
                <div className="flex items-center justify-between gap-2 mt-1.5 pt-1.5 border-t border-white/[0.04] text-[10px] text-neutral-400">
                  {/* 3. Airline */}
                  <span className="truncate max-w-[250px]">
                    {airlineDisplay}
                  </span>

                  <div className="flex items-center gap-1 text-[10px] text-neutral-500 group-hover:text-neutral-300 font-mono transition-colors shrink-0">
                    <span>Inspect</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* 5. Footer: Coordinates & External Link */}
      <div className="p-3 border-t border-white/[0.08] bg-neutral-900/60 flex items-center justify-between text-xs text-neutral-400 shrink-0">
        <div className="flex items-center gap-1.5 font-mono text-[11px] tabular-nums">
          <Navigation className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
          <span>
            {airport.latitude.toFixed(2)}°, {airport.longitude.toFixed(2)}°
          </span>
        </div>

        <a
          href={`https://www.flightradar24.com/data/airports/${airport.iata.toLowerCase()}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors font-medium text-[11px]"
        >
          <span>FR24 Live Board</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </aside>
  )
}
