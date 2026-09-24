import React from 'react'
import { X, Bookmark, Plane, ChevronRight, Trash2 } from 'lucide-react'
import { Flight } from '../../types/flight'
import { formatDuration } from '../../utils/geo'

interface PinnedFlightsDrawerProps {
  isOpen: boolean
  onClose: () => void
  pinnedFlights: Flight[]
  onSelectFlight: (flight: Flight) => void
  onUnpin: (flightId: string) => void
}

export const PinnedFlightsDrawer: React.FC<PinnedFlightsDrawerProps> = ({
  isOpen,
  onClose,
  pinnedFlights,
  onSelectFlight,
  onUnpin,
}) => {
  if (!isOpen) return null

  return (
    <aside className="absolute top-0 right-0 bottom-0 z-30 w-full sm:w-[380px] bg-slate-950/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl flex flex-col text-slate-100 overflow-y-auto animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800/80 bg-slate-900/50">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Watched Flights ({pinnedFlights.length})
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Flight List */}
      <div className="p-3 space-y-2 flex-1 overflow-y-auto">
        {pinnedFlights.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Bookmark className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium text-slate-400">No pinned flights yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Click any flight on the radar map and tap the bookmark icon to watch it here.
            </p>
          </div>
        ) : (
          pinnedFlights.map(flight => (
            <div
              key={flight.id}
              onClick={() => onSelectFlight(flight)}
              className="group bg-slate-900/80 hover:bg-slate-850 border border-slate-800/80 hover:border-sky-500/50 rounded-xl p-3 cursor-pointer transition-all flex items-center justify-between shadow-sm"
            >
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-sky-400">
                    {flight.flightNumber}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    {flight.airlineName || flight.callsign}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-300 mt-1">
                  <span>{flight.originIata || '---'}</span>
                  <Plane className="w-3 h-3 text-slate-500 rotate-90" />
                  <span>{flight.destIata || '---'}</span>
                  {flight.timeRemainingMinutes && (
                    <span className="text-emerald-400 text-[11px] ml-auto font-sans font-medium">
                      {formatDuration(flight.timeRemainingMinutes)} left
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={e => {
                    e.stopPropagation()
                    onUnpin(flight.id)
                  }}
                  className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Remove from watched"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-sky-400 transition-colors" />
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  )
}
