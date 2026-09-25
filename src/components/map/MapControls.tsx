import React from 'react'
import { ZoomIn, ZoomOut, MapPin } from 'lucide-react'
import { Airport } from '../../types/flight'

interface MapControlsProps {
  onZoom: (delta: number) => void
  onFlyTo: (lat: number, lon: number, zoom: number) => void
  showAirportCodes?: boolean
  onToggleAirportCodes?: () => void
  bookmarkedAirports?: Airport[]
  selectedAirportIata?: string
  onSelectAirport?: (airport: Airport) => void
  onResetToAll?: () => void
}

export const MapControls: React.FC<MapControlsProps> = ({
  onZoom,
  onFlyTo,
  showAirportCodes = true,
  onToggleAirportCodes,
  bookmarkedAirports = [],
  selectedAirportIata,
  onSelectAirport,
  onResetToAll,
}) => {
  return (
    <div className="absolute bottom-6 left-4 z-20 flex flex-col gap-2">
      {/* Bookmarked Airport List (Includes 'All (NA)' at minimum) */}
      <div className="flex items-center gap-1 bg-slate-950/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-xl w-fit max-w-[calc(100vw-2rem)] sm:max-w-xl overflow-x-auto scrollbar-none">
        {/* Minimum Option: All (NA) */}
        <button
          onClick={() => {
            if (onResetToAll) {
              onResetToAll()
            } else {
              onFlyTo(39.8, -98.5, 3.8)
            }
          }}
          className={`px-2 py-1 rounded-md text-[11px] font-mono transition-all border cursor-pointer whitespace-nowrap shrink-0 ${
            !selectedAirportIata
              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-sky-600/30 border-transparent hover:border-sky-500/40'
          }`}
          title="All (North America)"
        >
          All (NA)
        </button>

        {bookmarkedAirports.map(airport => {
          const isSelected = selectedAirportIata?.toUpperCase() === airport.iata.toUpperCase()
          const label = airport.city ? `${airport.iata} (${airport.city})` : airport.iata

          return (
            <React.Fragment key={airport.iata}>
              <div className="h-3.5 w-px bg-slate-800 shrink-0" />
              <button
                onClick={() => {
                  if (onSelectAirport) {
                    onSelectAirport(airport)
                  } else {
                    onFlyTo(airport.latitude, airport.longitude, 7.5)
                  }
                }}
                className={`px-2 py-1 rounded-md text-[11px] font-mono transition-all border cursor-pointer whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-sky-600/30 border-transparent hover:border-sky-500/40'
                }`}
                title={`Fly to ${airport.name}`}
              >
                {label}
              </button>
            </React.Fragment>
          )
        })}
      </div>

      {/* Camera & Overlay Controls */}
      <div className="flex items-center gap-1 bg-slate-950/85 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-xl w-fit">
        <button
          onClick={() => onZoom(0.5)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => onZoom(-0.5)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        {onToggleAirportCodes && (
          <div className="relative group flex items-center">
            <button
              onClick={onToggleAirportCodes}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                showAirportCodes
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              aria-label={showAirportCodes ? 'Hide Airport Codes (IATA)' : 'Show Airport Codes (IATA)'}
            >
              <MapPin className="w-4 h-4" />
            </button>
            {/* Custom Tooltip */}
            <div className="pointer-events-none absolute left-full ml-2.5 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-950/95 px-2.5 py-1 text-xs text-slate-200 border border-slate-800 shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-150 z-30 flex items-center gap-1.5">
              <span className="font-medium">
                {showAirportCodes ? 'Hide Airport Codes' : 'Show Airport Codes'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
