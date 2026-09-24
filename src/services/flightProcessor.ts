import { Flight, FlightArc } from '../types/flight'
import { getAirport } from '../data/airports'
import { getAirline, detectAirlineFromCallsign } from '../data/airlines'
import {
  calculateDistanceNm,
  calculateTimeRemainingMinutes,
  calculateEta,
  calculateProgressPercent,
} from '../utils/geo'

/**
 * Raw flight array tuple from Flightradar24 zone feed
 */
export type RawFr24Flight = [
  string,          // 0: icao24
  number,          // 1: lat
  number,          // 2: lon
  number,          // 3: track (heading)
  number,          // 4: altitude
  number,          // 5: speed
  string,          // 6: squawk
  string,          // 7: radar
  string,          // 8: model
  string,          // 9: registration
  number,          // 10: timestamp
  string,          // 11: origin IATA
  string,          // 12: dest IATA
  string,          // 13: flight number
  number,          // 14: onGround (0 or 1)
  number,          // 15: verticalSpeed
  string,          // 16: callsign
  unknown,         // 17: reserved
  string?          // 18: airline ICAO
]

/**
 * Parses raw FR24 feed record into a rich domain Flight object
 */
export function parseRawFlight(id: string, raw: RawFr24Flight): Flight {
  const [
    icao24,
    lat,
    lon,
    heading,
    altitude,
    speed,
    squawk,
    ,
    model,
    registration,
    timestamp,
    originIata,
    destIata,
    flightNumber,
    onGround,
    verticalSpeed,
    callsign,
    ,
    airlineIcao,
  ] = raw

  const cleanCallsign = (callsign || flightNumber || icao24 || '').trim().toUpperCase()
  const cleanFlightNum = (flightNumber || cleanCallsign || id).trim().toUpperCase()

  // Resolve airline
  const airline = airlineIcao
    ? getAirline(airlineIcao)
    : detectAirlineFromCallsign(cleanCallsign)

  // Resolve airports
  const originAirport = getAirport(originIata)
  const destAirport = getAirport(destIata)

  // Calculate ETA, remaining distance, progress
  let distanceTotalNm: number | undefined
  let distanceRemainingNm: number | undefined
  let progressPercent: number | undefined
  let timeRemainingMinutes: number | undefined
  let estimatedArrivalTime: Date | undefined

  if (destAirport) {
    distanceRemainingNm = Math.round(
      calculateDistanceNm(lat, lon, destAirport.latitude, destAirport.longitude)
    )

    if (originAirport) {
      distanceTotalNm = Math.round(
        calculateDistanceNm(
          originAirport.latitude,
          originAirport.longitude,
          destAirport.latitude,
          destAirport.longitude
        )
      )
      progressPercent = calculateProgressPercent(distanceTotalNm, distanceRemainingNm)
    }

    if (speed > 50) {
      timeRemainingMinutes = calculateTimeRemainingMinutes(distanceRemainingNm, speed)
      estimatedArrivalTime = calculateEta(timeRemainingMinutes)
    }
  }

  return {
    id: id || icao24,
    flightNumber: cleanFlightNum,
    callsign: cleanCallsign,
    airlineIcao: airline?.icao || airlineIcao,
    airlineName: airline?.name,
    aircraftModel: model || undefined,
    registration: registration || undefined,
    latitude: lat,
    longitude: lon,
    altitude: altitude || 0,
    heading: heading || 0,
    speed: speed || 0,
    verticalSpeed: verticalSpeed || 0,
    squawk: squawk || undefined,
    onGround: onGround === 1,
    lastContact: timestamp || Math.floor(Date.now() / 1000),
    originIata: originIata || undefined,
    originAirport,
    destIata: destIata || undefined,
    destAirport,
    distanceTotalNm,
    distanceRemainingNm,
    progressPercent,
    timeRemainingMinutes,
    estimatedArrivalTime,
  }
}

/**
 * Builds 3D Great-Circle Flight Arcs for all active flights that have origin/destination
 */
export function buildFlightArcs(flights: Flight[], highlightedFlightId?: string): FlightArc[] {
  const arcs: FlightArc[] = []

  for (const flight of flights) {
    if (flight.onGround) continue

    const origin = flight.originAirport
    const dest = flight.destAirport

    // If both origin and destination airports are known, generate complete route arc
    if (origin && dest) {
      arcs.push({
        id: `arc-${flight.id}`,
        flightId: flight.id,
        flightNumber: flight.flightNumber,
        flownSource: [origin.longitude, origin.latitude],
        flownTarget: [flight.longitude, flight.latitude],
        remSource: [flight.longitude, flight.latitude],
        remTarget: [dest.longitude, dest.latitude],
        isHighlighted: flight.id === highlightedFlightId,
      })
    } else if (dest) {
      // If only destination is known, draw current -> destination
      arcs.push({
        id: `arc-${flight.id}`,
        flightId: flight.id,
        flightNumber: flight.flightNumber,
        flownSource: [flight.longitude, flight.latitude],
        flownTarget: [flight.longitude, flight.latitude],
        remSource: [flight.longitude, flight.latitude],
        remTarget: [dest.longitude, dest.latitude],
        isHighlighted: flight.id === highlightedFlightId,
      })
    }
  }

  return arcs
}
