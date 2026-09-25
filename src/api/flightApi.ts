import { Flight, FlightArc, FlightSource } from '../types/flight'
import { parseRawFlight, buildFlightArcs, RawFr24Flight } from '../services/flightProcessor'
import { getAirport } from '../data/airports'
import { interpolateGreatCirclePoint, calculateBearing } from '../utils/geo'
import { fetchOpenSkyFeed } from './openSkyApi'
import { MOCK_FLIGHTS_FEED } from './mockData'

// North America Bounding Box for FR24 zone feed
// Format: maxLat,minLat,minLon,maxLon
const FR24_NA_BOUNDS = '55,24,-125,-65'

export interface FlightFeedResponse {
  flights: Flight[]
  arcs: FlightArc[]
  timestamp: number
  isMock: boolean
  source: FlightSource
  error?: string
}

/**
 * Simulates continuous progress for mock flights moving forward along their Great-Circle Arcs
 */
let mockSimulationOffset = 0

function getSimulatedMockFeed(): Record<string, RawFr24Flight> {
  mockSimulationOffset += 1
  const copy: Record<string, RawFr24Flight> = {}

  let idx = 0
  for (const [id, raw] of Object.entries(MOCK_FLIGHTS_FEED)) {
    idx += 1
    const cloned = [...raw] as RawFr24Flight
    const origin = getAirport(cloned[11])
    const dest = getAirport(cloned[12])

    if (origin && dest && cloned[14] !== 1) {
      // Stagger initial progress and smoothly advance forward along the route arc
      const baseProgress = 0.12 + ((idx * 0.17) % 0.65)
      const currentProgress = ((baseProgress + mockSimulationOffset * 0.006) % 0.82) + 0.08
      const point = interpolateGreatCirclePoint(
        origin.latitude,
        origin.longitude,
        dest.latitude,
        dest.longitude,
        currentProgress
      )
      const bearing = calculateBearing(
        point.latitude,
        point.longitude,
        dest.latitude,
        dest.longitude
      )

      cloned[1] = point.latitude
      cloned[2] = point.longitude
      cloned[3] = bearing
    }

    copy[id] = cloned
  }

  return copy
}

/**
 * Resilient multi-source flight data pipeline:
 * 1. Primary: Flightradar24 zone feed (rich telemetry + native origin/destination for all flights)
 * 2. Secondary: OpenSky Network (raw ADS-B state vectors with bounding box)
 * 3. Fallback: Simulated Mock Feed (offline / dev mode)
 */
export async function fetchFlightFeed(
  region: 'north_america' | 'global' = 'north_america',
  forceMock = false,
  highlightedFlightId?: string
): Promise<FlightFeedResponse> {
  // If explicitly forced to mock mode
  if (forceMock) {
    const rawFeed = getSimulatedMockFeed()
    const flights = Object.entries(rawFeed).map(([id, raw]) => {
      const flight = parseRawFlight(id, raw)
      flight.source = 'mock'
      return flight
    })
    const arcs = buildFlightArcs(flights, highlightedFlightId)
    return {
      flights,
      arcs,
      timestamp: Date.now(),
      isMock: true,
      source: 'mock',
    }
  }

  // 1. Try Primary: Flightradar24 Feed
  try {
    const boundsParam = region === 'north_america' ? `bounds=${FR24_NA_BOUNDS}&` : ''
    const url = `${import.meta.env.BASE_URL}api/fr24?${boundsParam}faa=1&satellite=1&mlat=1&flarm=1&adsb=1&gnd=1&air=1&vehicles=0&estimated=1&maxage=14400&gliders=0&stats=0`

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`FR24 HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    const flights: Flight[] = []

    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value) && value.length >= 14) {
        const flight = parseRawFlight(key, value as RawFr24Flight)
        flight.source = 'fr24'
        flights.push(flight)
      }
    }

    if (flights.length > 0) {
      const arcs = buildFlightArcs(flights, highlightedFlightId)
      return {
        flights,
        arcs,
        timestamp: Date.now(),
        isMock: false,
        source: 'fr24',
      }
    }
  } catch (fr24Err) {
    console.warn('[FlightFeed] Primary FR24 feed unavailable, trying OpenSky Network...', fr24Err)
  }

  // 2. Try Secondary: OpenSky Network
  try {
    const openSkyFlights = await fetchOpenSkyFeed(region)
    if (openSkyFlights.length > 0) {
      const arcs = buildFlightArcs(openSkyFlights, highlightedFlightId)
      return {
        flights: openSkyFlights,
        arcs,
        timestamp: Date.now(),
        isMock: false,
        source: 'opensky',
      }
    }
  } catch (openSkyErr) {
    console.warn('[FlightFeed] Secondary OpenSky feed unavailable, activating simulated feed...', openSkyErr)
  }

  // 3. Fallback: Simulated Mock Feed
  const rawFeed = getSimulatedMockFeed()
  const flights = Object.entries(rawFeed).map(([id, raw]) => {
    const flight = parseRawFlight(id, raw)
    flight.source = 'mock'
    return flight
  })
  const arcs = buildFlightArcs(flights, highlightedFlightId)

  return {
    flights,
    arcs,
    timestamp: Date.now(),
    isMock: true,
    source: 'mock',
    error: 'Live feeds unreachable, displaying simulated radar feed',
  }
}
