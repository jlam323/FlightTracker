import type { StyleSpecification } from 'maplibre-gl'

export const AIRPLANE_ICON_ATLAS = '/airplane.svg'

export const AIRPLANE_ICON_MAPPING = {
  airplane: {
    x: 0,
    y: 0,
    width: 64,
    height: 64,
    anchorX: 32,
    anchorY: 32,
    mask: true,
  },
}

// Major international hubs displayed by default on map load
export const MAJOR_HUB_IATAS = new Set([
  'ATL', 'LAX', 'ORD', 'DFW', 'DEN', 'JFK', 'SFO', 'SEA', 'LAS', 'MCO',
  'EWR', 'CLT', 'PHX', 'IAH', 'MIA', 'BOS', 'MSP', 'DTW', 'FLL', 'PHL',
  'LGA', 'BWI', 'SLC', 'SAN', 'IAD', 'DCA', 'MDW', 'TPA', 'PDX', 'HNL',
  'ANC', 'AUS', 'BNA', 'STL', 'YYZ', 'YVR', 'YUL', 'YYC', 'LHR', 'CDG',
  'FRA', 'AMS', 'HND', 'NRT', 'MEX', 'CUN',
])

export const CARTO_API_KEY = import.meta.env.VITE_CARTO_API_KEY || ''
const apiKeyParam = CARTO_API_KEY ? `?key=${CARTO_API_KEY}` : ''

// High-performance dark command-center raster basemap
export const CARTO_DARK_RASTER_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'carto-dark': {
      type: 'raster',
      tiles: [
        `https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png${apiKeyParam}`,
        `https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png${apiKeyParam}`,
        `https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png${apiKeyParam}`,
        `https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png${apiKeyParam}`,
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
  },
  layers: [
    {
      id: 'carto-dark-layer',
      type: 'raster',
      source: 'carto-dark',
      minzoom: 0,
      maxzoom: 20,
    },
  ],
}
