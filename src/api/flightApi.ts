import { Flight, FlightArc } from '../types/flight'
import { parseRawFlight, buildFlightArcs, RawFr24Flight } from '../services/flightProcessor'
import { MOCK_FLIGHTS_FEED } from './mockData'

// North America Bounding Box for FR24 zone feed
// Format: maxLat,minLat,minLon,maxLon
const FR24_NA_BOUNDS = '55,24,-125,-65'

export interface FlightFeedResponse {
  flights: Flight[]
  arcs: FlightArc[]
  timestamp: number
  isMock: boolean
  error?: string
}

/**
 * Simulates gentle forward movement for mock flights based on their speed & heading
 */
let mockSimulationOffset = 0

function getSimulatedMockFeed(): Record<string, RawFr24Flight> {
  mockSimulationOffset += 1
  const copy: Record<string, RawFr24Flight> = {}

  for (const [id, raw] of Object.entries(MOCK_FLIGHTS_FEED)) {
    const cloned = [...raw] as RawFr24Flight
    const heading = cloned[3]
    const speed = cloned[5]

    // Calculate delta lat/lon movement for ~30 seconds of flight
    const headingRad = (heading * Math.PI) / 180
    const distanceDegreePerStep = (speed / 3600) * (30 / 60) // degrees approx
    const deltaLat = Math.cos(headingRad) * distanceDegreePerStep * (mockSimulationOffset % 20 - 10) * 0.05
    const deltaLon = Math.sin(headingRad) * distanceDegreePerStep * (mockSimulationOffset % 20 - 10) * 0.05

    cloned[1] = Number((cloned[1] + deltaLat).toFixed(4))
    cloned[2] = Number((cloned[2] + deltaLon).toFixed(4))
    copy[id] = cloned
  }

  return copy
}

/**
 * Fetches active flight feed from live proxy or fallback mock
 */
export async function fetchFlightFeed(
  region: 'north_america' | 'global' = 'north_america',
  forceMock = false,
  highlightedFlightId?: string
): Promise<FlightFeedResponse> {
  if (forceMock) {
    const rawFeed = getSimulatedMockFeed()
    const flights = Object.entries(rawFeed).map(([id, raw]) => parseRawFlight(id, raw))
    const arcs = buildFlightArcs(flights, highlightedFlightId)
    return {
      flights,
      arcs,
      timestamp: Date.now(),
      isMock: true,
    }
  }

  try {
    const boundsParam = region === 'north_america' ? `bounds=${FR24_NA_BOUNDS}&` : ''
    const url = `/api/fr24/zones/fcgi/feed.js?${boundsParam}faa=1&satellite=1&mlat=1&flarm=1&adsb=1&gnd=0&air=1&vehicles=0&estimated=1&maxage=14400&gliders=0&stats=0`

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    const flights: Flight[] = []

    for (const [key, value] of Object.entries(data)) {
      // Ignore metadata fields like full_count, version, stats
      if (Array.isArray(value) && value.length >= 14) {
        flights.push(parseRawFlight(key, value as RawFr24Flight))
      }
    }

    if (flights.length === 0) {
      throw new Error('No aircraft returned from feed')
    }

    const arcs = buildFlightArcs(flights, highlightedFlightId)

    return {
      flights,
      arcs,
      timestamp: Date.now(),
      isMock: false,
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch live feed'
    console.warn(`[FlightFeed] Live fetch error (${errorMsg}), falling back to simulated feed.`)

    const rawFeed = getSimulatedMockFeed()
    const flights = Object.entries(rawFeed).map(([id, raw]) => parseRawFlight(id, raw))
    const arcs = buildFlightArcs(flights, highlightedFlightId)

    return {
      flights,
      arcs,
      timestamp: Date.now(),
      isMock: true,
      error: errorMsg,
    }
  }
}
