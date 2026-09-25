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

interface FlightDetailDrawerProps {
  flight: Flight | null
  onClose: () => void
  isPinned: boolean
  onTogglePin: (flightId: string) => void
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
    <aside className="absolute top-0 right-0 bottom-0 z-30 w-full sm:w-[420px] bg-slate-950/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl flex flex-col text-slate-100 overflow-y-auto animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="flex items-start justify-between p-4 border-b border-slate-800/80 bg-slate-900/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-white font-mono">
              {flight.flightNumber}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
              {flight.callsign}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {flight.airlineName || 'Commercial Flight'} • {flight.aircraftModel || 'Aircraft'}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onTogglePin(flight.id)}
            className={`p-2 rounded-lg border transition-all ${
              isPinned
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={isPinned ? 'Unpin flight' : 'Pin flight to watch list'}
          >
            {isPinned ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all"
            title="Close flight inspector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Route & ETA Hero Card */}
      <div className="p-4 border-b border-slate-800/80 bg-gradient-to-b from-sky-950/30 to-transparent">
        {/* Origin -> Destination Banner */}
        <div className="flex items-center justify-between gap-3 text-center">
          {/* Origin */}
          <div className="flex-1 text-left">
            <span className="text-2xl font-black font-mono text-sky-300">
              {flight.originIata || '---'}
            </span>
            <p className="text-xs font-medium text-slate-200 truncate">
              {origin?.city || 'Origin'}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {origin?.name || 'Airport'}
            </p>
          </div>

          {/* Plane Icon */}
          <div className="flex flex-col items-center px-2">
            <Plane className="w-5 h-5 text-sky-400 rotate-90" />
            <span className="text-[10px] font-mono text-slate-400 mt-1">
              {flight.distanceTotalNm ? `${flight.distanceTotalNm.toLocaleString()} nm` : 'Direct'}
            </span>
          </div>

          {/* Destination */}
          <div className="flex-1 text-right">
            <span className="text-2xl font-black font-mono text-emerald-300">
              {flight.destIata || '---'}
            </span>
            <p className="text-xs font-medium text-slate-200 truncate">
              {dest?.city || 'Destination'}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {dest?.name || 'Airport'}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1.5">
            <span>Progress: {flight.progressPercent !== undefined ? `${flight.progressPercent}%` : '--'}</span>
            <span>
              {flight.distanceRemainingNm
                ? `${flight.distanceRemainingNm.toLocaleString()} nm remaining`
                : '--'}
            </span>
          </div>
          <div className="relative w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${flight.progressPercent ?? (flight.onGround ? 0 : 50)}%` }}
            />
          </div>
        </div>

        {/* TIME REMAINING UNTIL ARRIVAL (ETA) */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Time Remaining
              </p>
              <p className="text-sm font-bold text-white font-mono mt-0.5">
                {formatDuration(flight.timeRemainingMinutes)}
              </p>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Estimated Arrival
              </p>
              <p className="text-sm font-bold text-white font-mono mt-0.5">
                {flight.estimatedArrivalTime
                  ? flight.estimatedArrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '--'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Physical Telemetry Grid */}
      <div className="p-4 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Gauge className="w-3.5 h-3.5 text-sky-400" />
          Live Aircraft Telemetry
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Altitude */}
          <div className="bg-slate-900/70 border border-slate-800/80 p-2.5 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase">Altitude</span>
            <span className="font-mono font-semibold text-slate-100 text-sm">
              {formatAltitude(flight.altitude)}
            </span>
          </div>

          {/* Ground Speed */}
          <div className="bg-slate-900/70 border border-slate-800/80 p-2.5 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase">Ground Speed</span>
            <span className="font-mono font-semibold text-slate-100 text-sm">
              {formatSpeed(flight.speed)}
            </span>
          </div>

          {/* Heading */}
          <div className="bg-slate-900/70 border border-slate-800/80 p-2.5 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase">Heading / Track</span>
            <span className="font-mono font-semibold text-slate-100 text-sm flex items-center gap-1.5">
              <Navigation
                className="w-3.5 h-3.5 text-sky-400 inline"
                style={{ transform: `rotate(${flight.heading}deg)` }}
              />
              {formatHeading(flight.heading)}
            </span>
          </div>

          {/* Vertical Rate */}
          <div className="bg-slate-900/70 border border-slate-800/80 p-2.5 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase">Vertical Speed</span>
            <div className="mt-0.5">{renderVerticalRate(flight.verticalSpeed)}</div>
          </div>

          {/* Coordinates */}
          <div className="bg-slate-900/70 border border-slate-800/80 p-2.5 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase">Latitude / Longitude</span>
            <span className="font-mono text-slate-200">
              {flight.latitude.toFixed(3)}°, {flight.longitude.toFixed(3)}°
            </span>
          </div>

          {/* Transponder / Squawk */}
          <div className="bg-slate-900/70 border border-slate-800/80 p-2.5 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase">Squawk / Hex</span>
            <span className="font-mono text-slate-200">
              {flight.squawk || '---'} • <span className="text-slate-400">{flight.id}</span>
            </span>
          </div>
        </div>

        {/* Aircraft Registry Info */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-400">Aircraft Model:</span>
            <span className="font-medium text-slate-200">{flight.aircraftModel || 'Commercial Jet'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Tail Registration:</span>
            <span className="font-mono font-medium text-sky-400">{flight.registration || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Flight Status:</span>
            <span className={`font-semibold ${flight.onGround ? 'text-amber-400' : 'text-emerald-400'}`}>
              {flight.onGround ? 'On Ground' : 'Airborne'}
            </span>
          </div>
          {flight.source && (
            <div className="flex justify-between">
              <span className="text-slate-400">Data Source:</span>
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
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 font-semibold text-xs text-white shadow-lg shadow-sky-600/20 transition-all"
          >
            <LocateFixed className="w-4 h-4" />
            Center Map on Flight
          </button>

          <a
            href={`https://www.flightradar24.com/${flight.callsign || flight.flightNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open on Flightradar24
          </a>
        </div>
      </div>
    </aside>
  )
}
