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
    <div className="absolute bottom-6 left-4 z-20 flex flex-col gap-1.5">
      {/* Bookmarked Airport List (Includes 'All (NA)' at minimum) */}
      <div className="flex items-center gap-1 bg-[#090a0f]/90 backdrop-blur-md p-1 rounded-md border border-white/[0.08] shadow-xl w-fit max-w-[calc(100vw-2rem)] sm:max-w-xl overflow-x-auto scrollbar-none">
        {/* Minimum Option: All (NA) */}
        <button
          onClick={() => {
            if (onResetToAll) {
              onResetToAll()
            } else {
              onFlyTo(39.8, -98.5, 3.8)
            }
          }}
          className={`px-2 py-1 rounded-[4px] text-[11px] font-mono transition-all border cursor-pointer whitespace-nowrap shrink-0 ${
            !selectedAirportIata
              ? 'bg-neutral-800 text-white font-medium border-white/[0.12] shadow-xs'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60 border-transparent'
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
              <div className="h-3.5 w-px bg-white/[0.08] shrink-0" />
              <button
                onClick={() => {
                  if (onSelectAirport) {
                    onSelectAirport(airport)
                  } else {
                    onFlyTo(airport.latitude, airport.longitude, 7.5)
                  }
                }}
                className={`px-2 py-1 rounded-[4px] text-[11px] font-mono transition-all border cursor-pointer whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-neutral-800 text-white font-medium border-white/[0.12] shadow-xs'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60 border-transparent'
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
      <div className="flex items-center gap-0.5 bg-[#090a0f]/90 backdrop-blur-md p-1 rounded-md border border-white/[0.08] shadow-xl w-fit">
        <button
          onClick={() => onZoom(0.5)}
          className="p-1.5 rounded-[4px] text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onZoom(-0.5)}
          className="p-1.5 rounded-[4px] text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        {onToggleAirportCodes && (
          <div className="relative group flex items-center">
            <button
              onClick={onToggleAirportCodes}
              className={`p-1.5 rounded-[4px] transition-all cursor-pointer border ${
                showAirportCodes
                  ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800 border-transparent'
              }`}
              aria-label={showAirportCodes ? 'Hide Airport Codes (IATA)' : 'Show Airport Codes (IATA)'}
            >
              <MapPin className="w-3.5 h-3.5" />
            </button>
            {/* Custom Tooltip */}
            <div className="pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#0c0d12]/95 px-2 py-1 text-[11px] text-neutral-200 border border-white/[0.08] shadow-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-150 z-30 flex items-center gap-1.5 font-mono">
              <span>
                {showAirportCodes ? 'Hide Airport Codes' : 'Show Airport Codes'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
