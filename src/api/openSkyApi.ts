import { Flight } from '../types/flight'
import { detectAirlineFromCallsign } from '../data/airlines'

/**
 * OpenSky Network State Vector tuple format:
 * 0: icao24 (string)
 * 1: callsign (string | null)
 * 2: origin_country (string)
 * 3: time_position (number | null)
 * 4: last_contact (number)
 * 5: longitude (number | null)
 * 6: latitude (number | null)
 * 7: baro_altitude (number | null, in meters)
 * 8: on_ground (boolean)
 * 9: velocity (number | null, in m/s)
 * 10: true_track (number | null, degrees clockwise from north)
 * 11: vertical_rate (number | null, in m/s)
 * 12: sensors (number[] | null)
 * 13: geo_altitude (number | null, in meters)
 * 14: squawk (string | null)
 * 15: spi (boolean)
 * 16: position_source (number)
 */
export type OpenSkyStateVector = [
  string,          // 0: icao24
  string | null,   // 1: callsign
  string,          // 2: origin_country
  number | null,   // 3: time_position
  number,          // 4: last_contact
  number | null,   // 5: longitude
  number | null,   // 6: latitude
  number | null,   // 7: baro_altitude
  boolean,         // 8: on_ground
  number | null,   // 9: velocity
  number | null,   // 10: true_track
  number | null,   // 11: vertical_rate
  number[] | null, // 12: sensors
  number | null,   // 13: geo_altitude
  string | null,   // 14: squawk
  boolean,         // 15: spi
  number           // 16: position_source
]

export interface OpenSkyResponse {
  time: number
  states: OpenSkyStateVector[] | null
}

const METERS_TO_FEET = 3.28084
const MS_TO_KNOTS = 1.94384
const MS_TO_FPM = 196.85 // meters/sec to feet/minute

/**
 * Fetches live ADS-B state vectors from OpenSky Network
 */
export async function fetchOpenSkyFeed(
  region: 'north_america' | 'global' = 'north_america'
): Promise<Flight[]> {
  let url = '/api/opensky/api/states/all'

  // Restrict to North America bounding box when in NA mode
  if (region === 'north_america') {
    url += '?lamin=15.0&lomin=-135.0&lamax=60.0&lomax=-60.0'
  }

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`OpenSky HTTP ${response.status}: ${response.statusText}`)
  }

  const data: OpenSkyResponse = await response.json()
  if (!data.states || data.states.length === 0) {
    return []
  }

  const flights: Flight[] = []

  for (const s of data.states) {
    const icao24 = s[0]
    const callsign = (s[1] || '').trim().toUpperCase()
    const lon = s[5]
    const lat = s[6]

    // Skip aircraft with missing coordinates
    if (lat === null || lon === null || isNaN(lat) || isNaN(lon)) {
      continue
    }

    const baroAltitudeMeters = s[7]
    const onGround = s[8]
    const velocityMs = s[9]
    const heading = s[10] || 0
    const verticalRateMs = s[11] || 0
    const squawk = s[14] || undefined
    const timestamp = s[4] || data.time

    const altitudeFeet = baroAltitudeMeters !== null ? Math.round(baroAltitudeMeters * METERS_TO_FEET) : 0
    const speedKnots = velocityMs !== null ? Math.round(velocityMs * MS_TO_KNOTS) : 0
    const verticalSpeedFpm = Math.round(verticalRateMs * MS_TO_FPM)

    const airline = detectAirlineFromCallsign(callsign)
    const flightNumber = callsign || icao24.toUpperCase()

    flights.push({
      id: icao24,
      flightNumber,
      callsign: callsign || icao24.toUpperCase(),
      airlineIcao: airline?.icao,
      airlineName: airline?.name,
      latitude: lat,
      longitude: lon,
      altitude: altitudeFeet,
      heading: Math.round(heading),
      speed: speedKnots,
      verticalSpeed: verticalSpeedFpm,
      squawk,
      onGround,
      lastContact: timestamp,
    })
  }

  return flights
}
