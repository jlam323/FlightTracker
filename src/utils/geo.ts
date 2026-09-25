/**
 * Geospatial mathematics for Great-Circle distance, navigation, and time calculations
 */

const EARTH_RADIUS_NM = 3440.065 // Earth radius in nautical miles

export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

export function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI
}

/**
 * Calculates Great-Circle distance between two points in Nautical Miles (nm)
 */
export function calculateDistanceNm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_NM * c
}

/**
 * Calculates remaining flight time in minutes based on distance and ground speed
 */
export function calculateTimeRemainingMinutes(
  distanceNm: number,
  speedKnots: number
): number | undefined {
  if (speedKnots <= 50 || distanceNm <= 0) return undefined
  const hours = distanceNm / speedKnots
  return Math.round(hours * 60)
}

/**
 * Calculates estimated arrival timestamp
 */
export function calculateEta(
  timeRemainingMinutes?: number,
  fromDate: Date = new Date()
): Date | undefined {
  if (timeRemainingMinutes === undefined || isNaN(timeRemainingMinutes)) {
    return undefined
  }
  return new Date(fromDate.getTime() + timeRemainingMinutes * 60 * 1000)
}

/**
 * Calculates route progress percentage (0 - 100%)
 */
export function calculateProgressPercent(
  totalDistanceNm: number,
  remainingDistanceNm: number
): number {
  if (totalDistanceNm <= 0) return 0
  const flown = totalDistanceNm - remainingDistanceNm
  const pct = (flown / totalDistanceNm) * 100
  return Math.max(0, Math.min(100, Math.round(pct)))
}

/**
 * Formats duration in minutes into "1 hr 45 min" or "25 min"
 */
export function formatDuration(minutes?: number): string {
  if (minutes === undefined || isNaN(minutes)) return '--'
  if (minutes < 60) return `${minutes}m`
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hrs}h ${mins}m`
}

/**
 * Formats altitude with comma separators and flight level FL
 */
export function formatAltitude(altitudeFeet: number): string {
  if (altitudeFeet <= 0) return 'Ground'
  if (altitudeFeet >= 18000) {
    const fl = Math.round(altitudeFeet / 100)
    return `FL${fl} (${altitudeFeet.toLocaleString()} ft)`
  }
  return `${altitudeFeet.toLocaleString()} ft`
}

/**
 * Formats ground speed with knots and mph
 */
export function formatSpeed(speedKnots: number): string {
  const mph = Math.round(speedKnots * 1.15078)
  return `${speedKnots} kts (${mph} mph)`
}

/**
 * Converts heading degrees into 8-cardinal compass string (e.g. 045° NE)
 */
export function formatHeading(degrees: number): string {
  const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const index = Math.round(((degrees % 360) / 45)) % 8
  const cardinal = cardinals[index]
  const padded = Math.round(degrees).toString().padStart(3, '0')
  return `${padded}° ${cardinal}`
}

/**
 * Calculates intermediate coordinates along a Great-Circle path between two points
 * fraction: 0 = start point, 1 = end point
 * Spherical interpolation formula from: http://www.movable-type.co.uk/scripts/latlong.html
 */
export function interpolateGreatCirclePoint(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  fraction: number
): { latitude: number; longitude: number } {
  const f = Math.max(0, Math.min(1, fraction))
  if (f === 0) return { latitude: lat1, longitude: lon1 }
  if (f === 1) return { latitude: lat2, longitude: lon2 }

  const phi1 = toRadians(lat1)
  const lambda1 = toRadians(lon1)
  const phi2 = toRadians(lat2)
  const lambda2 = toRadians(lon2)

  const dLat = phi2 - phi1
  const dLon = lambda2 - lambda1

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const delta = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  if (delta === 0) return { latitude: lat1, longitude: lon1 }

  const A = Math.sin((1 - f) * delta) / Math.sin(delta)
  const B = Math.sin(f * delta) / Math.sin(delta)

  const x = A * Math.cos(phi1) * Math.cos(lambda1) + B * Math.cos(phi2) * Math.cos(lambda2)
  const y = A * Math.cos(phi1) * Math.sin(lambda1) + B * Math.cos(phi2) * Math.sin(lambda2)
  const z = A * Math.sin(phi1) + B * Math.sin(phi2)

  const phi3 = Math.atan2(z, Math.sqrt(x * x + y * y))
  const lambda3 = Math.atan2(y, x)

  return {
    latitude: Number(toDegrees(phi3).toFixed(4)),
    longitude: Number(toDegrees(lambda3).toFixed(4)),
  }
}

/**
 * Calculates bearing from point 1 to point 2 in degrees (0 - 359)
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const phi1 = toRadians(lat1)
  const phi2 = toRadians(lat2)
  const deltaLambda = toRadians(lon2 - lon1)

  const y = Math.sin(deltaLambda) * Math.cos(phi2)
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda)

  const theta = Math.atan2(y, x)
  return Math.round((toDegrees(theta) + 360) % 360)
}

/**
 * Generates an array of [lon, lat] coordinates along the Great Circle path between two points,
 * with continuous longitude unwrapping (so routes crossing the 180° antimeridian do not jump
 * by 360°).
 */
export function generateGreatCircleRoutePoints(
  lon1: number,
  lat1: number,
  lon2: number,
  lat2: number,
  numPoints = 25
): [number, number][] {
  const p1 = [
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lon1)),
    Math.cos(toRadians(lat1)) * Math.sin(toRadians(lon1)),
    Math.sin(toRadians(lat1)),
  ]
  const p2 = [
    Math.cos(toRadians(lat2)) * Math.cos(toRadians(lon2)),
    Math.cos(toRadians(lat2)) * Math.sin(toRadians(lon2)),
    Math.sin(toRadians(lat2)),
  ]
  const dot = Math.min(1, Math.max(-1, p1[0] * p2[0] + p1[1] * p2[1] + p1[2] * p2[2]))
  const delta = Math.acos(dot)
  const sinDelta = Math.sin(delta)

  const pts: [number, number][] = []
  let prevLon = lon1

  for (let i = 0; i <= numPoints; i++) {
    const f = i / numPoints
    let x: number, y: number, z: number
    if (sinDelta < 1e-6) {
      x = p1[0]
      y = p1[1]
      z = p1[2]
    } else {
      const A = Math.sin((1 - f) * delta) / sinDelta
      const B = Math.sin(f * delta) / sinDelta
      x = A * p1[0] + B * p2[0]
      y = A * p1[1] + B * p2[1]
      z = A * p1[2] + B * p2[2]
    }
    const lat = toDegrees(Math.atan2(z, Math.sqrt(x * x + y * y)))
    let lon = toDegrees(Math.atan2(y, x))

    // Unwrap longitude to be continuous with prevLon
    while (lon - prevLon > 180) lon -= 360
    while (lon - prevLon < -180) lon += 360
    prevLon = lon

    pts.push([Number(lon.toFixed(4)), Number(lat.toFixed(4))])
  }

  return pts
}

