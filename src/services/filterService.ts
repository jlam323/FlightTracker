import { Flight, FlightFilters } from '../types/flight'

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
export function applyFlightFilters(flights: Flight[], filters: FlightFilters): Flight {
  return flights.filter(flight => {
    // 1. Region filter
    if (filters.region === 'north_america') {
      if (!isWithinNorthAmerica(flight.latitude, flight.longitude)) {
        return false
      }
    }

    // 2. Hide on ground
    if (filters.hideOnGround && flight.onGround) {
      return false
    }

    // 3. Search query (Flight ID, Callsign, Registration)
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.trim().toUpperCase()
      const matchNum = flight.flightNumber.toUpperCase().includes(query)
      const matchCall = flight.callsign.toUpperCase().includes(query)
      const matchReg = flight.registration?.toUpperCase().includes(query)
      const matchId = flight.id.toUpperCase().includes(query)
      if (!matchNum && !matchCall && !matchReg && !matchId) {
        return false
      }
    }

    // 4. Airline filter
    if (filters.airlineIcao) {
      const airlineCode = filters.airlineIcao.toUpperCase()
      if (flight.airlineIcao?.toUpperCase() !== airlineCode) {
        // Also check callsign prefix
        if (!flight.callsign.startsWith(airlineCode)) {
          return false
        }
      }
    }

    // 5. Origin airport filter
    if (filters.originAirport.trim()) {
      const orig = filters.originAirport.trim().toUpperCase()
      const matchIata = flight.originIata?.toUpperCase() === orig
      const matchIcao = flight.originAirport?.icao.toUpperCase() === orig
      if (!matchIata && !matchIcao) {
        return false
      }
    }

    // 6. Destination airport filter
    if (filters.destAirport.trim()) {
      const dest = filters.destAirport.trim().toUpperCase()
      const matchIata = flight.destIata?.toUpperCase() === dest
      const matchIcao = flight.destAirport?.icao.toUpperCase() === dest
      if (!matchIata && !matchIcao) {
        return false
      }
    }

    // 7. Airport filter (either Origin OR Destination)
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
  }) as unknown as Flight
}

export function filterFlights(flights: Flight[], filters: FlightFilters): Flight[] {
  return flights.filter(flight => {
    // 1. Region filter
    if (filters.region === 'north_america') {
      if (!isWithinNorthAmerica(flight.latitude, flight.longitude)) {
        return false
      }
    }

    // 2. Hide on ground
    if (filters.hideOnGround && flight.onGround) {
      return false
    }

    // 3. Search query (Flight ID, Callsign, Registration)
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.trim().toUpperCase()
      const matchNum = flight.flightNumber.toUpperCase().includes(query)
      const matchCall = flight.callsign.toUpperCase().includes(query)
      const matchReg = flight.registration?.toUpperCase().includes(query)
      const matchId = flight.id.toUpperCase().includes(query)
      if (!matchNum && !matchCall && !matchReg && !matchId) {
        return false
      }
    }

    // 4. Airline filter
    if (filters.airlineIcao) {
      const airlineCode = filters.airlineIcao.toUpperCase()
      const matchAirline = flight.airlineIcao?.toUpperCase() === airlineCode
      const matchCallsignPrefix = flight.callsign.startsWith(airlineCode)
      if (!matchAirline && !matchCallsignPrefix) {
        return false
      }
    }

    // 5. Origin airport filter
    if (filters.originAirport.trim()) {
      const orig = filters.originAirport.trim().toUpperCase()
      const matchIata = flight.originIata?.toUpperCase() === orig
      const matchIcao = flight.originAirport?.icao.toUpperCase() === orig
      if (!matchIata && !matchIcao) {
        return false
      }
    }

    // 6. Destination airport filter
    if (filters.destAirport.trim()) {
      const dest = filters.destAirport.trim().toUpperCase()
      const matchIata = flight.destIata?.toUpperCase() === dest
      const matchIcao = flight.destAirport?.icao.toUpperCase() === dest
      if (!matchIata && !matchIcao) {
        return false
      }
    }

    // 7. Airport filter (either Origin OR Destination)
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
