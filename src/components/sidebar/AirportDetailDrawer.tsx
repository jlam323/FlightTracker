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
    <aside className="absolute top-0 right-0 bottom-0 z-30 w-full sm:w-[420px] bg-slate-950/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl flex flex-col text-slate-100 overflow-hidden animate-in slide-in-from-right duration-200">
      {/* 1. Header: Airport Identity & Quick Actions */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/50 shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black font-mono tracking-tight text-sky-400">
                {airport.iata}
              </span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {airport.icao}
              </span>
            </div>
            <h2 className="text-sm font-bold text-white truncate mt-1" title={airport.name}>
              {airport.name}
            </h2>
            <p className="text-xs text-slate-400 truncate">
              {airport.city}, {airport.country}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Bookmark Airport Button */}
            {onToggleBookmark && (
              <button
                onClick={() => onToggleBookmark(airport)}
                className={`p-2 rounded-lg border transition-all cursor-pointer ${
                  isBookmarked
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white'
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
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Focus map on airport"
            >
              <LocateFixed className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Close airport drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active Filter Status Banner */}
        {hasActiveFilters && (
          <div className="mt-2.5 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 font-medium">
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
      <div className="p-4 border-b border-slate-800/80 bg-gradient-to-b from-slate-900/40 to-transparent shrink-0">
        <div className="grid grid-cols-3 gap-2">
          {/* Inbound Card */}
          <button
            onClick={() => setActiveTab('inbound')}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
              activeTab === 'inbound'
                ? 'bg-rose-500/15 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.15)]'
                : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-1.5 text-rose-400 mb-1">
              <PlaneLanding className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Inbound</span>
            </div>
            <span className="text-xl font-black font-mono text-white leading-none">
              {inboundFlights.length}
            </span>
          </button>

          {/* Outbound Card */}
          <button
            onClick={() => setActiveTab('outbound')}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
              activeTab === 'outbound'
                ? 'bg-sky-500/15 border-sky-500/50 shadow-[0_0_12px_rgba(56,189,248,0.15)]'
                : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-1.5 text-sky-400 mb-1">
              <PlaneTakeoff className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Outbound</span>
            </div>
            <span className="text-xl font-black font-mono text-white leading-none">
              {outboundFlights.length}
            </span>
          </button>

          {/* On Ground Card */}
          <button
            onClick={() => setActiveTab('ground')}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
              activeTab === 'ground'
                ? 'bg-slate-700/30 border-slate-600 shadow-[0_0_12px_rgba(148,163,184,0.15)]'
                : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Plane className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">On Ground</span>
            </div>
            <span className="text-xl font-black font-mono text-white leading-none">
              {groundFlights.length}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Section Title & Current Tab Filter */}
      <div className="px-4 py-2 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between text-xs shrink-0">
        <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
          {activeTab === 'inbound'
            ? `Inbound Flights (${inboundFlights.length})`
            : activeTab === 'outbound'
            ? `Outbound Flights (${outboundFlights.length})`
            : `Grounded & Taxiing (${groundFlights.length})`}
        </span>
      </div>

      {/* 4. Scrollable Flight List */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {activeFlightList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
              {activeTab === 'inbound' ? (
                <PlaneLanding className="w-6 h-6 text-slate-600" />
              ) : activeTab === 'outbound' ? (
                <PlaneTakeoff className="w-6 h-6 text-slate-600" />
              ) : (
                <Plane className="w-6 h-6 text-slate-600" />
              )}
            </div>
            <p className="text-sm font-semibold text-slate-300">
              {hasActiveFilters
                ? `No matching ${activeTab} flights`
                : `No active ${activeTab} flights`}
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
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
                className="group relative flex flex-col p-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer shadow-sm hover:shadow-md"
              >
                {/* Top Row: 1. Flight ID & 4. Timing Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Radar Color Dot */}
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                      style={{
                        backgroundColor: colorHex,
                        boxShadow: `0 0 8px ${colorHex}aa`,
                      }}
                    />

                    {/* 1. Flight ID */}
                    <span className="font-mono font-black text-sm text-white group-hover:text-sky-400 transition-colors tracking-tight">
                      {flight.flightNumber}
                    </span>

                    {/* Optional Callsign badge */}
                    {flight.callsign && flight.callsign !== flight.flightNumber && (
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-800/90 px-1.5 py-0.5 rounded border border-slate-700/60">
                        {flight.callsign}
                      </span>
                    )}
                  </div>

                  {/* 4. Timing Pill Badge: Time before landing / Time before departure */}
                  <div
                    className={`px-2 py-0.5 rounded-md border text-[11px] font-mono font-semibold shrink-0 ${timing.badgeClass}`}
                  >
                    {timing.badgeText}
                  </div>
                </div>

                {/* Middle Row: 2. Origin -> Destination & Timing Subtext */}
                <div className="flex items-center justify-between gap-2 mt-2">
                  {/* 2. Origin -> Destination */}
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <span className="font-bold text-sky-300">{originStr}</span>
                    <span className="text-slate-500 font-bold">→</span>
                    <span className="font-bold text-rose-500">{destStr}</span>
                  </div>

                  {/* Timing secondary subtext (ETA, Taxiing, Altitude, etc.) */}
                  <span className="text-[11px] font-mono text-slate-400 truncate text-right">
                    {timing.subText}
                  </span>
                </div>

                {/* Bottom Row: 3. Airline Name & Inspect Action */}
                <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-800/50 text-xs">
                  {/* 3. Airline */}
                  <span className="text-slate-400 text-[11px] truncate max-w-[250px]">
                    {airlineDisplay}
                  </span>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500 group-hover:text-sky-400 font-medium transition-colors shrink-0">
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* 5. Footer: Coordinates & External Link */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400 shrink-0">
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <Navigation className="w-3.5 h-3.5 text-slate-500 shrink-0" />
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
