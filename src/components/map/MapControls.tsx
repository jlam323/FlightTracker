import React from 'react'
import { Compass, ZoomIn, ZoomOut, MapPin } from 'lucide-react'

interface MapControlsProps {
  onResetBearing: () => void
  onZoom: (delta: number) => void
  onFlyTo: (lat: number, lon: number, zoom: number) => void
  showAirportCodes?: boolean
  onToggleAirportCodes?: () => void
}

const HUBS = [
  { name: 'All NA', lat: 39.8, lon: -98.5, zoom: 3.8 },
  { name: 'JFK / NYC', lat: 40.64, lon: -73.78, zoom: 7.5 },
  { name: 'LAX / SoCal', lat: 33.94, lon: -118.41, zoom: 7.5 },
  { name: 'ORD / Chicago', lat: 41.98, lon: -87.90, zoom: 7.5 },
  { name: 'ATL / Atlanta', lat: 33.64, lon: -84.43, zoom: 7.5 },
  { name: 'DFW / Texas', lat: 32.90, lon: -97.04, zoom: 7.5 },
  { name: 'YYZ / Toronto', lat: 43.68, lon: -79.62, zoom: 7.5 },
]

export const MapControls: React.FC<MapControlsProps> = ({
  onResetBearing,
  onZoom,
  onFlyTo,
  showAirportCodes = true,
  onToggleAirportCodes,
}) => {
  return (
    <div className="absolute bottom-6 left-4 z-20 flex flex-col gap-2">
      {/* Quick Hub Bookmarks */}
      <div className="flex flex-wrap gap-1 bg-slate-950/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-xl max-w-sm">
        {HUBS.map(hub => (
          <button
            key={hub.name}
            onClick={() => onFlyTo(hub.lat, hub.lon, hub.zoom)}
            className="px-2 py-1 rounded-md text-[11px] font-mono text-slate-300 hover:text-white hover:bg-sky-600/30 transition-all border border-transparent hover:border-sky-500/40"
          >
            {hub.name}
          </button>
        ))}
      </div>

      {/* Camera & Overlay Controls */}
      <div className="flex items-center gap-1 bg-slate-950/85 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-xl w-fit">
        <button
          onClick={() => onZoom(0.5)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => onZoom(-0.5)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={onResetBearing}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          title="Reset North Orientation"
        >
          <Compass className="w-4 h-4" />
        </button>
        {onToggleAirportCodes && (
          <button
            onClick={onToggleAirportCodes}
            className={`p-1.5 rounded-lg transition-all ${
              showAirportCodes
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title={showAirportCodes ? 'Hide Airport Codes (IATA)' : 'Show Airport Codes (IATA)'}
          >
            <MapPin className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
