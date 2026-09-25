import { Flight, FlightArc } from '../types/flight'
import { getAirport } from '../data/airports'
import { getAirline, detectAirlineFromCallsign } from '../data/airlines'
import {
  calculateDistanceNm,
  calculateTimeRemainingMinutes,
  calculateEta,
  calculateProgressPercent,
  interpolateGreatCirclePoint,
  calculateBearing,
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

  // Position airborne flights that have origin/destination along their Great-Circle Arc
  let displayLat = lat
  let displayLon = lon
  let displayHeading = heading || 0

  if (originAirport && destAirport && onGround !== 1) {
    const fraction = (progressPercent ?? 50) / 100
    const pointOnArc = interpolateGreatCirclePoint(
      originAirport.latitude,
      originAirport.longitude,
      destAirport.latitude,
      destAirport.longitude,
      fraction
    )
    displayLat = pointOnArc.latitude
    displayLon = pointOnArc.longitude
    displayHeading = calculateBearing(
      pointOnArc.latitude,
      pointOnArc.longitude,
      destAirport.latitude,
      destAirport.longitude
    )
  }

  return {
    id: id || icao24,
    flightNumber: cleanFlightNum,
    callsign: cleanCallsign,
    airlineIcao: airline?.icao || airlineIcao,
    airlineName: airline?.name,
    aircraftModel: model || undefined,
    registration: registration || undefined,
    latitude: displayLat,
    longitude: displayLon,
    altitude: altitude || 0,
    heading: displayHeading,
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
 * Builds 3D Great-Circle Flight Arcs connecting Origin Airport -> Destination Airport
 */
export function buildFlightArcs(flights: Flight[], highlightedFlightId?: string): FlightArc[] {
  const arcs: FlightArc[] = []

  for (const flight of flights) {
    if (flight.onGround) continue

    const origin = flight.originAirport
    const dest = flight.destAirport

    // Generate complete Great-Circle arc from Origin -> Destination
    if (origin && dest) {
      arcs.push({
        id: `arc-${flight.id}`,
        flightId: flight.id,
        flightNumber: flight.flightNumber,
        source: [origin.longitude, origin.latitude],
        target: [dest.longitude, dest.latitude],
        originIata: origin.iata,
        destIata: dest.iata,
        flownSource: [origin.longitude, origin.latitude],
        flownTarget: [dest.longitude, dest.latitude],
        remSource: [origin.longitude, origin.latitude],
        remTarget: [dest.longitude, dest.latitude],
        isHighlighted: flight.id === highlightedFlightId,
      })
    }
  }

  return arcs
}
