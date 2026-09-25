import React from 'react'
import {
  X,
  Plane,
  Clock,
  Navigation,
  Gauge,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  LocateFixed,
  MapPin,
} from 'lucide-react'
import { Flight } from '../../types/flight'
import {
  formatDuration,
  formatAltitude,
  formatSpeed,
  formatHeading,
} from '../../utils/geo'
import { formatAirportLocalTime } from '../../utils/timezone'

interface FlightDetailDrawerProps {
  flight: Flight | null
  onClose: () => void
  isPinned: boolean
  onTogglePin: (flightId: string, flight?: Flight) => void
  onFocusCamera: (lat: number, lon: number) => void
}

export const FlightDetailDrawer: React.FC<FlightDetailDrawerProps> = ({
  flight,
  onClose,
  isPinned,
  onTogglePin,
  onFocusCamera,
}) => {
  if (!flight) return null

  const renderVerticalRate = (vSpeed: number) => {
    if (vSpeed > 200) {
      return (
        <span className="flex items-center text-emerald-400 gap-1 font-mono text-xs">
          <ArrowUpRight className="w-3.5 h-3.5" />
          +{vSpeed.toLocaleString()} ft/min (Climbing)
        </span>
      )
    }
    if (vSpeed < -200) {
      return (
        <span className="flex items-center text-amber-400 gap-1 font-mono text-xs">
          <ArrowDownRight className="w-3.5 h-3.5" />
          {vSpeed.toLocaleString()} ft/min (Descending)
        </span>
      )
    }
    return (
      <span className="flex items-center text-sky-400 gap-1 font-mono text-xs">
        <Minus className="w-3.5 h-3.5" />
        Level Cruise
      </span>
    )
  }

  const origin = flight.originAirport
  const dest = flight.destAirport

  return (
    <aside className="absolute top-0 right-0 bottom-0 z-30 w-full sm:w-[400px] bg-[#0c0d12]/95 backdrop-blur-xl border-l border-white/[0.08] shadow-2xl flex flex-col text-neutral-100 overflow-y-auto animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="flex items-start justify-between p-4 border-b border-white/[0.08] bg-neutral-900/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-white font-mono">
              {flight.flightNumber}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-[4px] bg-neutral-800 text-sky-400 border border-white/[0.08]">
              {flight.callsign}
            </span>
            {flight.lastKnown && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-[4px] bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Last Known
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            {flight.airlineName || 'Commercial Flight'} • {flight.aircraftModel || 'Aircraft'}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onTogglePin(flight.id, flight)}
            className={`p-1.5 rounded-[5px] border transition-all cursor-pointer ${
              isPinned
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-neutral-900 border-white/[0.08] text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
            title={isPinned ? 'Unpin flight' : 'Pin flight to watch list'}
          >
            {isPinned ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[5px] bg-neutral-900 hover:bg-neutral-800 border border-white/[0.08] text-neutral-400 hover:text-white transition-all cursor-pointer"
            title="Close flight inspector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Offline / Last Known Banner */}
      {flight.lastKnown && (
        <div className="px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="font-mono text-[11px]">Flight no longer in live feed (last known position)</span>
          </div>
          <button
            onClick={() => onTogglePin(flight.id, flight)}
            className="text-[11px] font-mono text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
          >
            Unpin flight
          </button>
        </div>
      )}

      {/* Main Route & ETA Hero Card */}
      <div className="p-4 border-b border-white/[0.08] bg-neutral-900/20">
        {/* Origin -> Destination Banner */}
        <div className="flex items-center justify-between gap-3 text-center">
          {/* Origin */}
          <div className="flex-1 text-left">
            <span className="text-2xl font-bold font-mono text-sky-300">
              {flight.originIata || '---'}
            </span>
            <p className="text-xs font-medium text-neutral-200 truncate mt-0.5">
              {origin?.city || 'Origin'}
            </p>
            <p className="text-[11px] text-neutral-500 truncate">
              {origin?.name || 'Airport'}
            </p>
          </div>

          {/* Plane Icon */}
          <div className="flex flex-col items-center px-2">
            <Plane className="w-4 h-4 text-neutral-400 rotate-90" />
            <span className="text-[11px] font-mono tabular-nums text-neutral-400 mt-1">
              {flight.distanceTotalNm ? `${flight.distanceTotalNm.toLocaleString()} nm` : 'Direct'}
            </span>
          </div>

          {/* Destination */}
          <div className="flex-1 text-right">
            <span className="text-2xl font-bold font-mono text-rose-300">
              {flight.destIata || '---'}
            </span>
            <p className="text-xs font-medium text-neutral-200 truncate mt-0.5">
              {dest?.city || 'Destination'}
            </p>
            <p className="text-[11px] text-neutral-500 truncate">
              {dest?.name || 'Airport'}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-mono tabular-nums text-neutral-400 mb-1.5">
            <span>Progress: {flight.progressPercent !== undefined ? `${flight.progressPercent}%` : '--'}</span>
            <span>
              {flight.distanceRemainingNm
                ? `${flight.distanceRemainingNm.toLocaleString()} nm remaining`
                : '--'}
            </span>
          </div>
          <div className="relative w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden border border-white/[0.06]">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-rose-400 rounded-full transition-all duration-500"
              style={{ width: `${flight.progressPercent ?? (flight.onGround ? 0 : 50)}%` }}
            />
          </div>
        </div>

        {/* TIME REMAINING UNTIL ARRIVAL (ETA) OR DEPARTURE STATUS */}
        <div className="mt-3.5 grid grid-cols-2 gap-2">
          <div className="bg-neutral-900/80 border border-white/[0.08] p-2.5 rounded-md flex items-center gap-2.5">
            <div className="p-1.5 rounded-[4px] bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider font-mono">
                {flight.onGround ? 'Departure' : 'Time Remaining'}
              </p>
              <p className="text-xs font-bold text-white font-mono tabular-nums truncate mt-0.5">
                {flight.onGround
                  ? `Departs in ~${flight.speed > 5 ? 10 : 20}m`
                  : formatDuration(flight.timeRemainingMinutes)}
              </p>
            </div>
          </div>

          <div className="bg-neutral-900/80 border border-white/[0.08] p-2.5 rounded-md flex items-center gap-2.5">
            <div className="p-1.5 rounded-[4px] bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider font-mono truncate">
                {flight.onGround
                  ? 'Surface Status'
                  : flight.destAirport?.iata
                  ? `Est. Arrival (${flight.destAirport.iata})`
                  : 'Estimated Arrival'}
              </p>
              <p className="text-xs font-bold text-white font-mono tabular-nums truncate mt-0.5">
                {flight.onGround
                  ? (flight.speed > 5 ? `Taxiing (${flight.speed} kts)` : 'Parked at Gate')
                  : (flight.estimatedArrivalTime
                      ? formatAirportLocalTime(flight.estimatedArrivalTime, flight.destAirport, true)
                      : '--')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Physical Telemetry Grid */}
      <div className="p-4 space-y-3.5">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5 text-neutral-400" />
          Live Aircraft Telemetry
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Altitude */}
          <div className="bg-neutral-900/70 border border-white/[0.08] p-2.5 rounded-md">
            <span className="text-neutral-400 block text-[10px] uppercase font-mono tracking-wider">Altitude</span>
            <span className="font-mono font-semibold text-neutral-100 text-sm tabular-nums mt-0.5 block">
              {formatAltitude(flight.altitude)}
            </span>
          </div>

          {/* Ground Speed */}
          <div className="bg-neutral-900/70 border border-white/[0.08] p-2.5 rounded-md">
            <span className="text-neutral-400 block text-[10px] uppercase font-mono tracking-wider">Ground Speed</span>
            <span className="font-mono font-semibold text-neutral-100 text-sm tabular-nums mt-0.5 block">
              {formatSpeed(flight.speed)}
            </span>
          </div>

          {/* Heading */}
          <div className="bg-neutral-900/70 border border-white/[0.08] p-2.5 rounded-md">
            <span className="text-neutral-400 block text-[10px] uppercase font-mono tracking-wider">Heading / Track</span>
            <span className="font-mono font-semibold text-neutral-100 text-sm tabular-nums flex items-center gap-1.5 mt-0.5">
              <Navigation
                className="w-3 h-3 text-sky-400 inline"
                style={{ transform: `rotate(${flight.heading}deg)` }}
              />
              {formatHeading(flight.heading)}
            </span>
          </div>

          {/* Vertical Rate */}
          <div className="bg-neutral-900/70 border border-white/[0.08] p-2.5 rounded-md">
            <span className="text-neutral-400 block text-[10px] uppercase font-mono tracking-wider">Vertical Speed</span>
            <div className="mt-0.5">{renderVerticalRate(flight.verticalSpeed)}</div>
          </div>

          {/* Coordinates */}
          <div className="bg-neutral-900/70 border border-white/[0.08] p-2.5 rounded-md">
            <span className="text-neutral-400 block text-[10px] uppercase font-mono tracking-wider">Coordinates</span>
            <span className="font-mono text-neutral-200 text-xs tabular-nums mt-0.5 block">
              {flight.latitude.toFixed(3)}°, {flight.longitude.toFixed(3)}°
            </span>
          </div>

          {/* Transponder / Squawk */}
          <div className="bg-neutral-900/70 border border-white/[0.08] p-2.5 rounded-md">
            <span className="text-neutral-400 block text-[10px] uppercase font-mono tracking-wider">Squawk / Hex</span>
            <span className="font-mono text-neutral-200 text-xs tabular-nums mt-0.5 block">
              {flight.squawk || '---'} • <span className="text-neutral-400">{flight.id}</span>
            </span>
          </div>
        </div>

        {/* Aircraft Registry Info */}
        <div className="bg-neutral-900/50 border border-white/[0.08] rounded-md p-3 text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-neutral-400">Aircraft Model:</span>
            <span className="font-medium text-neutral-200">{flight.aircraftModel || 'Commercial Jet'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Tail Registration:</span>
            <span className="font-mono font-medium text-sky-400">{flight.registration || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Flight Status:</span>
            <span className={`font-semibold ${flight.lastKnown ? 'text-amber-400' : flight.onGround ? 'text-amber-400' : 'text-emerald-400'}`}>
              {flight.lastKnown ? 'Last Known Position (Offline)' : flight.onGround ? 'On Ground' : 'Airborne'}
            </span>
          </div>
          {flight.lastKnown && flight.lastContact > 0 && (
            <div className="flex justify-between">
              <span className="text-neutral-400">Last Contact:</span>
              <span className="font-mono text-[11px] text-neutral-300">
                {new Date(flight.lastContact > 1e11 ? flight.lastContact : flight.lastContact * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
          {flight.source && (
            <div className="flex justify-between">
              <span className="text-neutral-400">Data Source:</span>
              <span className={`font-mono text-[11px] font-medium ${
                flight.source === 'fr24'
                  ? 'text-emerald-400'
                  : flight.source === 'opensky'
                  ? 'text-sky-400'
                  : 'text-amber-400'
              }`}>
                {flight.source === 'fr24'
                  ? 'Flightradar24 Live'
                  : flight.source === 'opensky'
                  ? 'OpenSky ADS-B'
                  : 'Simulated Radar'}
              </span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={() => onFocusCamera(flight.latitude, flight.longitude)}
            disabled={flight.latitude === 0 && flight.longitude === 0}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-neutral-100 hover:bg-white font-semibold text-xs text-neutral-950 shadow-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <LocateFixed className="w-3.5 h-3.5" />
            Center Map on Flight
          </button>

          <a
            href={`https://www.flightradar24.com/${flight.callsign || flight.flightNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-white/[0.08] text-xs text-neutral-300 hover:text-white transition-all cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
            Open on Flightradar24
          </a>
        </div>
      </div>
    </aside>
  )
}
