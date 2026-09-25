import { X, Bookmark, BookmarkCheck, ChevronRight, Trash2 } from 'lucide-react'
import { Flight } from '../../types/flight'
import { formatDuration } from '../../utils/geo'

interface PinnedFlightsDrawerProps {
  isOpen: boolean
  onClose: () => void
  pinnedFlights: Flight[]
  onSelectFlight: (flight: Flight) => void
  onUnpin: (flightId: string) => void
  onClearAll?: () => void
  isPinnedOnly?: boolean
  onTogglePinnedOnly?: () => void
}

export const PinnedFlightsDrawer: React.FC<PinnedFlightsDrawerProps> = ({
  isOpen,
  onClose,
  pinnedFlights,
  onSelectFlight,
  onUnpin,
  onClearAll,
  isPinnedOnly = false,
  onTogglePinnedOnly,
}) => {
  if (!isOpen) return null

  return (
    <aside className="absolute top-0 right-0 bottom-0 z-30 w-full sm:w-[380px] bg-[#0c0d12]/95 backdrop-blur-xl border-l border-white/[0.08] shadow-2xl flex flex-col text-neutral-100 overflow-y-auto animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/[0.08] bg-neutral-900/60">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            Watched Flights ({pinnedFlights.length})
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          {pinnedFlights.length > 0 && onClearAll && (
            <button
              onClick={onClearAll}
              className="text-[11px] font-mono px-2 py-1 rounded-[4px] bg-neutral-900 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-300 border border-white/[0.08] hover:border-rose-500/30 transition-all cursor-pointer"
              title="Unpin all watched flights"
            >
              Clear All
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-[5px] bg-neutral-900 hover:bg-neutral-800 border border-white/[0.08] text-neutral-400 hover:text-white transition-all cursor-pointer"
            title="Close watched flights drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Map Filter Toggle */}
      {pinnedFlights.length > 0 && onTogglePinnedOnly && (
        <div className="px-4 py-2 bg-neutral-900/40 border-b border-white/[0.08] flex items-center justify-between text-xs">
          <span className="text-neutral-400 font-mono text-[11px]">Map Filter:</span>
          <button
            onClick={onTogglePinnedOnly}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] border text-xs font-medium transition-all cursor-pointer ${
              isPinnedOnly
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-neutral-900 hover:bg-neutral-800 border-white/[0.08] text-neutral-300 hover:text-white'
            }`}
          >
            {isPinnedOnly ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Showing Pinned Only</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 text-neutral-400" />
                <span>Filter Map to Pinned</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Flight List */}
      <div className="p-2.5 space-y-1.5 flex-1 overflow-y-auto">
        {pinnedFlights.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Bookmark className="w-8 h-8 text-neutral-600 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium text-neutral-400">No pinned flights yet</p>
            <p className="text-xs text-neutral-500 mt-1">
              Click any flight on the radar map and tap the bookmark icon to watch it here.
            </p>
          </div>
        ) : (
          pinnedFlights.map(flight => (
            <div
              key={flight.id}
              onClick={() => onSelectFlight(flight)}
              className="group bg-neutral-900/50 hover:bg-neutral-900 border border-white/[0.06] hover:border-white/[0.14] rounded-[5px] p-2.5 cursor-pointer transition-all flex items-center justify-between shadow-xs"
            >
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-amber-400 tracking-tight">
                    {flight.flightNumber}
                  </span>
                  <span className="text-[10px] text-neutral-400 truncate">
                    {flight.airlineName || flight.callsign}
                  </span>
                  {flight.lastKnown && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-amber-400/90 border border-amber-500/20 shrink-0">
                      Last Known
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-neutral-300 mt-1">
                  <span className="font-bold text-sky-300">{flight.originIata || '---'}</span>
                  <span className="text-neutral-600 font-bold">→</span>
                  <span className="font-bold text-emerald-300">{flight.destIata || '---'}</span>
                  {flight.lastKnown ? (
                    <span className="text-neutral-500 text-[10px] ml-auto font-mono">
                      Offline / Out of range
                    </span>
                  ) : flight.timeRemainingMinutes ? (
                    <span className="text-neutral-400 text-[10px] ml-auto font-mono tabular-nums">
                      {formatDuration(flight.timeRemainingMinutes)} left
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={e => {
                    e.stopPropagation()
                    onUnpin(flight.id)
                  }}
                  className="p-1 rounded-[4px] hover:bg-rose-500/20 text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Remove from watched"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-sky-400 transition-colors" />
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  )
}
