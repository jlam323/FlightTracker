import { Flight, FlightFilters } from '../types/flight'
import { FLIGHT_STATE_CONFIGS } from '../constants/flightStates'

// North America Bounding Box (US, Canada, Mexico)
export const NA_BOUNDS = {
  minLat: 15.0,
  maxLat: 72.0,
  minLon: -170.0,
  maxLon: -50.0,
}

export function isWithinNorthAmerica(lat: number, lon: number): boolean {
  return (
    lat >= NA_BOUNDS.minLat &&
    lat <= NA_BOUNDS.maxLat &&
    lon >= NA_BOUNDS.minLon &&
    lon <= NA_BOUNDS.maxLon
  )
}

/**
 * Filters a list of flights based on user criteria
 */
export function filterFlights(
  flights: Flight[],
  filters: FlightFilters,
  pinnedIds?: string[]
): Flight[] {
  const hasFlightStates = Boolean(filters.flightStates && filters.flightStates.length > 0)
  const activeStateConfigs = hasFlightStates
    ? FLIGHT_STATE_CONFIGS.filter(c => filters.flightStates!.includes(c.id))
    : []

  const hasSearchQuery = Boolean(filters.searchQuery?.trim())
  const query = hasSearchQuery ? filters.searchQuery.trim().toUpperCase() : ''

  return flights.filter(flight => {
    // Check if flight matches active search query (Flight ID, Callsign, Registration)
    const matchesSearch = hasSearchQuery && (
      flight.flightNumber.toUpperCase().includes(query) ||
      flight.callsign.toUpperCase().includes(query) ||
      Boolean(flight.registration?.toUpperCase().includes(query)) ||
      flight.id.toUpperCase().includes(query)
    )

    // 1. If search query is typed, flight must match it
    if (hasSearchQuery && !matchesSearch) {
      return false
    }

    // 2. Region filter
    if (filters.region === 'north_america') {
      const lat = flight.onGround && flight.originAirport ? flight.originAirport.latitude : flight.latitude
      const lon = flight.onGround && flight.originAirport ? flight.originAirport.longitude : flight.longitude
      if (!isWithinNorthAmerica(lat, lon)) {
        return false
      }
    }

    // 3. Hide on ground (bypassed if flight matches user's active search query or is pinned when pinnedOnly is set)
    const isPinnedFlight = Boolean(pinnedIds?.includes(flight.id))
    if (!matchesSearch && filters.hideOnGround && flight.onGround && !(filters.pinnedOnly && isPinnedFlight)) {
      return false
    }

    // 4. Flight State filter (High Cruise, Mid Altitude, Climb/Approach, Pinned)
    // Bypassed if flight matches user's active search query
    if (!matchesSearch && hasFlightStates && activeStateConfigs.length > 0) {
      const matchesAnyState = activeStateConfigs.some(config =>
        config.predicate(flight, pinnedIds)
      )
      if (!matchesAnyState) {
        return false
      }
    }

    // 5. Pinned Only filter (bypassed if flight matches user's active search query)
    if (!matchesSearch && filters.pinnedOnly) {
      if (!isPinnedFlight) {
        return false
      }
    }

    // 5. Airline filter
    if (filters.airlineIcao) {
      const airlineCode = filters.airlineIcao.toUpperCase()
      const matchAirline = flight.airlineIcao?.toUpperCase() === airlineCode
      const matchCallsignPrefix = flight.callsign.startsWith(airlineCode)
      if (!matchAirline && !matchCallsignPrefix) {
        return false
      }
    }

    // 6. Origin airport filter
    if (filters.originAirport.trim()) {
      const orig = filters.originAirport.trim().toUpperCase()
      const matchIata = flight.originIata?.toUpperCase() === orig
      const matchIcao = flight.originAirport?.icao.toUpperCase() === orig
      if (!matchIata && !matchIcao) {
        return false
      }
    }

    // 7. Destination airport filter
    if (filters.destAirport.trim()) {
      const dest = filters.destAirport.trim().toUpperCase()
      const matchIata = flight.destIata?.toUpperCase() === dest
      const matchIcao = flight.destAirport?.icao.toUpperCase() === dest
      if (!matchIata && !matchIcao) {
        return false
      }
    }

    // 8. Airport filter (either Origin OR Destination)
    if (filters.airportCode && filters.airportCode.trim()) {
      const airport = filters.airportCode.trim().toUpperCase()
      const matchOrigIata = flight.originIata?.toUpperCase() === airport
      const matchOrigIcao = flight.originAirport?.icao.toUpperCase() === airport
      const matchDestIata = flight.destIata?.toUpperCase() === airport
      const matchDestIcao = flight.destAirport?.icao.toUpperCase() === airport
      if (!matchOrigIata && !matchOrigIcao && !matchDestIata && !matchDestIcao) {
        return false
      }
    }

    return true
  })
}

export const applyFlightFilters = filterFlights
