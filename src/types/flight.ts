export interface Coordinates {
  latitude: number
  longitude: number
}

export interface Airport {
  iata: string
  icao: string
  name: string
  city: string
  country: string
  latitude: number
  longitude: number
  timezone?: string
}

export interface Flight {
  id: string                    // Unique transponder hex or ID
  flightNumber: string          // e.g. "DL1234"
  callsign: string              // e.g. "DAL1234"
  airlineIcao?: string          // e.g. "DAL"
  airlineName?: string          // e.g. "Delta Air Lines"
  aircraftModel?: string        // e.g. "B738"
  registration?: string         // e.g. "N824DN"
  latitude: number
  longitude: number
  altitude: number              // in feet
  heading: number               // in degrees (0-359)
  speed: number                 // ground speed in knots
  verticalSpeed: number         // ft/min
  squawk?: string
  onGround: boolean
  lastContact: number           // Unix timestamp

  // Origin & Destination
  originIata?: string
  originAirport?: Airport
  destIata?: string
  destAirport?: Airport

  // Calculated Navigation & ETA
  distanceTotalNm?: number
  distanceRemainingNm?: number
  progressPercent?: number
  timeRemainingMinutes?: number
  estimatedArrivalTime?: Date

  // Data feed source
  source?: FlightSource
}

export interface FlightArc {
  id: string
  flightId: string
  flightNumber: string
  // Full route segment: Origin Airport -> Destination Airport
  source: [number, number] // [lon, lat]
  target: [number, number] // [lon, lat]
  originIata?: string
  destIata?: string
  isHighlighted?: boolean
  // Optional backward-compatibility fields
  flownSource?: [number, number]
  flownTarget?: [number, number]
  remSource?: [number, number]
  remTarget?: [number, number]
}

export type FlightState =
  | 'high_cruise'
  | 'mid_altitude'
  | 'climb_approach'
  | 'on_ground'
  | 'pinned'

export interface FlightFilters {
  searchQuery: string           // Matches flightNumber or callsign
  airlineIcao: string           // Matches airline prefix
  originAirport: string         // Origin IATA or ICAO
  destAirport: string           // Destination IATA or ICAO
  airportCode?: string          // Matches either Origin OR Destination IATA/ICAO
  hideOnGround?: boolean        // Optional: Filter out parked / taxiing planes
  region: 'north_america' | 'global'
  flightStates?: FlightState[]  // Filter by altitude / status flight states
}


export type FlightSource = 'fr24' | 'opensky' | 'mock'
export type DataSourceMode = 'live' | 'mock'
