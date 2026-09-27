import { Flight } from '../../../types/flight'

/**
 * Resolves 3D map position coordinates for a flight, properly handling
 * on-ground aircraft with transponder telemetry or airport fallback.
 */
export function getFlightPosition(flight: Flight): [number, number, number] {
  if (flight.onGround) {
    if (flight.latitude !== 0 && flight.longitude !== 0) {
      return [flight.longitude, flight.latitude, 0]
    }
    const airport = flight.originAirport || flight.destAirport
    if (airport) {
      return [airport.longitude, airport.latitude, 0]
    }
  }
  return [flight.longitude, flight.latitude, 0]
}

/**
 * Checks if a flight matches an active search query across flight number,
 * callsign, aircraft registration, or transponder ID.
 */
export function matchesFlightSearch(flight: Flight, cleanQuery: string): boolean {
  if (!cleanQuery) return false
  return (
    flight.flightNumber.toUpperCase().includes(cleanQuery) ||
    flight.callsign.toUpperCase().includes(cleanQuery) ||
    Boolean(flight.registration?.toUpperCase().includes(cleanQuery)) ||
    flight.id.toUpperCase().includes(cleanQuery)
  )
}

/**
 * Creates an optimized matcher predicate for a flight search query.
 * Normalizes query string once up-front to prevent per-flight string allocation.
 */
export function createFlightSearchMatcher(query?: string): (flight: Flight) => boolean {
  const cleanQuery = query?.trim().toUpperCase()
  if (!cleanQuery) return () => false
  return (flight: Flight) => matchesFlightSearch(flight, cleanQuery)
}

/**
 * Checks whether a flight is actively highlighted (selected, pinned, or matching active search).
 */
export function isFlightHighlighted(
  flight: Flight,
  selectedFlightId: string | undefined,
  pinnedSet: Set<string>,
  isSearchMatch: (flight: Flight) => boolean
): boolean {
  return flight.id === selectedFlightId || pinnedSet.has(flight.id) || isSearchMatch(flight)
}

/**
 * Determines whether a flight should be rendered on the map.
 * Airborne flights are always rendered. Grounded/taxiing flights are only
 * rendered when highlighted (selected, pinned, or matching active search).
 */
export function shouldRenderFlight(
  flight: Flight,
  selectedFlightId: string | undefined,
  pinnedSet: Set<string>,
  isSearchMatch: (flight: Flight) => boolean
): boolean {
  return !flight.onGround || isFlightHighlighted(flight, selectedFlightId, pinnedSet, isSearchMatch)
}

/**
 * Resolves origin-destination text formatted as "SFO → JFK".
 * Returns null if neither origin nor destination is known.
 */
export function getFlightOdText(flight: Flight): string | null {
  const orig = flight.originIata || flight.originAirport?.iata || null
  const dest = flight.destIata || flight.destAirport?.iata || null
  if (!orig && !dest) return null
  return `${orig || '---'} → ${dest || '---'}`
}
