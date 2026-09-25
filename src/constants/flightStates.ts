import { Flight, FlightState } from '../types/flight'
import { PALETTE, ColorRGBA } from './palette'

export interface FlightStateConfig {
  id: FlightState
  label: string
  shortLabel: string
  sublabel: string
  colorHex: string
  colorRgba: ColorRGBA
  bgClass: string
  borderClass: string
  textClass: string
  predicate: (flight: Flight, pinnedIds?: string[]) => boolean
}

export const FLIGHT_STATE_CONFIGS: FlightStateConfig[] = [
  {
    id: 'high_cruise',
    label: 'High Cruise',
    shortLabel: 'Cruise',
    sublabel: '> 30,000 ft',
    colorHex: '#38bdf8',
    colorRgba: PALETTE.CYAN,
    bgClass: 'bg-sky-500/15',
    borderClass: 'border-sky-500/50',
    textClass: 'text-sky-300',
    predicate: f => !f.onGround && f.altitude > 30000,
  },
  {
    id: 'mid_altitude',
    label: 'Mid Altitude',
    shortLabel: 'Mid Alt',
    sublabel: '10,000 – 30,000 ft',
    colorHex: '#818cf8',
    colorRgba: PALETTE.INDIGO,
    bgClass: 'bg-indigo-500/15',
    borderClass: 'border-indigo-500/50',
    textClass: 'text-indigo-300',
    predicate: f => !f.onGround && f.altitude > 10000 && f.altitude <= 30000,
  },
  {
    id: 'climb_approach',
    label: 'Climb / Approach',
    shortLabel: 'Climb/App',
    sublabel: '≤ 10,000 ft',
    colorHex: '#34d399',
    colorRgba: PALETTE.EMERALD,
    bgClass: 'bg-emerald-500/15',
    borderClass: 'border-emerald-500/50',
    textClass: 'text-emerald-300',
    predicate: f => !f.onGround && f.altitude <= 10000,
  },
  {
    id: 'on_ground',
    label: 'On Ground',
    shortLabel: 'Ground',
    sublabel: 'Taxi / Parked',
    colorHex: '#94a3b8',
    colorRgba: PALETTE.SLATE_GROUND,
    bgClass: 'bg-slate-500/20',
    borderClass: 'border-slate-500/50',
    textClass: 'text-slate-300',
    predicate: f => f.onGround,
  },
  {
    id: 'pinned',
    label: 'Pinned Flights',
    shortLabel: 'Pinned',
    sublabel: 'Watchlist',
    colorHex: '#f59e0b',
    colorRgba: PALETTE.AMBER,
    bgClass: 'bg-amber-500/15',
    borderClass: 'border-amber-500/50',
    textClass: 'text-amber-300',
    predicate: (f, pinnedIds) => Boolean(pinnedIds?.includes(f.id)),
  },
]

export function getFlightStateConfig(id: FlightState): FlightStateConfig | undefined {
  return FLIGHT_STATE_CONFIGS.find(c => c.id === id)
}
