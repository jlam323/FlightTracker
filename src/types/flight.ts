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
}

export interface FlightArc {
  id: string
  flightId: string
  flightNumber: string
  // Flown segment: Origin -> Current Position
  flownSource: [number, number] // [lon, lat]
  flownTarget: [number, number]
  // Remaining segment: Current Position -> Destination
  remSource: [number, number]
  remTarget: [number, number]
  isHighlighted?: boolean
}

export interface FlightFilters {
  searchQuery: string           // Matches flightNumber or callsign
  airlineIcao: string           // Matches airline prefix
  originAirport: string         // Origin IATA or ICAO
  destAirport: string           // Destination IATA or ICAO
  hideOnGround: boolean         // Filter out parked / taxiing planes
  region: 'north_america' | 'global'
}

export type DataSourceMode = 'live' | 'mock'
