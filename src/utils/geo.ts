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
