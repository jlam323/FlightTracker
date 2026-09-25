import { Airport } from '../types/flight'

/**
 * Curated IANA timezone mapping for major North American and global commercial airports
 */
export const AIRPORT_TIMEZONES: Record<string, string> = {
  // US Eastern
  JFK: 'America/New_York',
  LGA: 'America/New_York',
  EWR: 'America/New_York',
  BOS: 'America/New_York',
  PHL: 'America/New_York',
  BWI: 'America/New_York',
  DCA: 'America/New_York',
  IAD: 'America/New_York',
  CLT: 'America/New_York',
  ATL: 'America/New_York',
  MIA: 'America/New_York',
  MCO: 'America/New_York',
  FLL: 'America/New_York',
  TPA: 'America/New_York',
  JAX: 'America/New_York',
  RSW: 'America/New_York',
  PBI: 'America/New_York',
  BDL: 'America/New_York',
  BUF: 'America/New_York',
  PIT: 'America/New_York',
  CLE: 'America/New_York',
  CMH: 'America/New_York',
  DTW: 'America/New_York',
  IND: 'America/New_York',
  RDU: 'America/New_York',
  CHS: 'America/New_York',
  SAV: 'America/New_York',
  RIC: 'America/New_York',
  ORF: 'America/New_York',
  ROC: 'America/New_York',
  SYR: 'America/New_York',
  ALB: 'America/New_York',
  PWM: 'America/New_York',
  BTV: 'America/New_York',
  MHT: 'America/New_York',
  PVD: 'America/New_York',
  GSO: 'America/New_York',
  GSP: 'America/New_York',
  CAE: 'America/New_York',
  MYR: 'America/New_York',
  DAY: 'America/New_York',
  CVG: 'America/New_York',
  SDF: 'America/New_York',
  LEX: 'America/New_York',
  CRW: 'America/New_York',
  ROA: 'America/New_York',
  CHO: 'America/New_York',
  SRQ: 'America/New_York',
  TLH: 'America/New_York',
  DAB: 'America/New_York',
  MLB: 'America/New_York',
  EYW: 'America/New_York',

  // US Central
  ORD: 'America/Chicago',
  MDW: 'America/Chicago',
  MSP: 'America/Chicago',
  DFW: 'America/Chicago',
  IAH: 'America/Chicago',
  HOU: 'America/Chicago',
  AUS: 'America/Chicago',
  SAT: 'America/Chicago',
  DAL: 'America/Chicago',
  STL: 'America/Chicago',
  BNA: 'America/Chicago',
  MEM: 'America/Chicago',
  MSY: 'America/Chicago',
  OMA: 'America/Chicago',
  OKC: 'America/Chicago',
  TUL: 'America/Chicago',
  MCI: 'America/Chicago',
  MKE: 'America/Chicago',
  DSM: 'America/Chicago',
  LIT: 'America/Chicago',
  BHM: 'America/Chicago',
  HSV: 'America/Chicago',
  MOB: 'America/Chicago',
  JAN: 'America/Chicago',
  GPT: 'America/Chicago',
  SHV: 'America/Chicago',
  LFT: 'America/Chicago',
  BTR: 'America/Chicago',
  XNA: 'America/Chicago',
  FSM: 'America/Chicago',
  SGF: 'America/Chicago',
  CID: 'America/Chicago',
  MLI: 'America/Chicago',
  MSN: 'America/Chicago',
  GRB: 'America/Chicago',
  FAR: 'America/Chicago',
  BIS: 'America/Chicago',
  GFK: 'America/Chicago',
  MOT: 'America/Chicago',
  FSD: 'America/Chicago',
  RAP: 'America/Denver',
  LNK: 'America/Chicago',
  ICT: 'America/Chicago',
  AMA: 'America/Chicago',
  LBB: 'America/Chicago',
  MAF: 'America/Chicago',
  CRP: 'America/Chicago',
  HRL: 'America/Chicago',
  MFE: 'America/Chicago',
  BRO: 'America/Chicago',
  ELP: 'America/Denver',

  // US Mountain
  DEN: 'America/Denver',
  SLC: 'America/Denver',
  ABQ: 'America/Denver',
  BOI: 'America/Boise',
  BZN: 'America/Denver',
  BIL: 'America/Denver',
  JAC: 'America/Denver',
  COS: 'America/Denver',
  GJT: 'America/Denver',
  DRO: 'America/Denver',
  SUN: 'America/Boise',
  IDA: 'America/Boise',
  MSO: 'America/Denver',
  FCA: 'America/Denver',
  HLN: 'America/Denver',
  BTM: 'America/Denver',
  GTF: 'America/Denver',
  CPR: 'America/Denver',

  // Arizona (Mountain Standard Time, No Daylight Saving)
  PHX: 'America/Phoenix',
  TUS: 'America/Phoenix',
  FLG: 'America/Phoenix',
  YUM: 'America/Phoenix',

  // US Pacific
  LAX: 'America/Los_Angeles',
  SFO: 'America/Los_Angeles',
  SAN: 'America/Los_Angeles',
  SEA: 'America/Los_Angeles',
  PDX: 'America/Los_Angeles',
  LAS: 'America/Los_Angeles',
  SJC: 'America/Los_Angeles',
  OAK: 'America/Los_Angeles',
  SMF: 'America/Los_Angeles',
  SNA: 'America/Los_Angeles',
  BUR: 'America/Los_Angeles',
  ONT: 'America/Los_Angeles',
  LGB: 'America/Los_Angeles',
  PSP: 'America/Los_Angeles',
  FAT: 'America/Los_Angeles',
  SBA: 'America/Los_Angeles',
  MRY: 'America/Los_Angeles',
  STS: 'America/Los_Angeles',
  BLI: 'America/Los_Angeles',
  GEG: 'America/Los_Angeles',
  PSC: 'America/Los_Angeles',
  YKM: 'America/Los_Angeles',
  EUG: 'America/Los_Angeles',
  RDM: 'America/Los_Angeles',
  MFR: 'America/Los_Angeles',
  RNO: 'America/Los_Angeles',

  // Alaska
  ANC: 'America/Anchorage',
  FAI: 'America/Anchorage',
  JNU: 'America/Anchorage',
  KTN: 'America/Anchorage',
  SIT: 'America/Anchorage',
  BRW: 'America/Anchorage',
  OME: 'America/Anchorage',
  BET: 'America/Anchorage',
  CDV: 'America/Anchorage',
  YAK: 'America/Anchorage',

  // Hawaii
  HNL: 'Pacific/Honolulu',
  OGG: 'Pacific/Honolulu',
  KOA: 'Pacific/Honolulu',
  ITO: 'Pacific/Honolulu',
  LIH: 'Pacific/Honolulu',

  // Canada
  YYZ: 'America/Toronto',
  YUL: 'America/Toronto',
  YOW: 'America/Toronto',
  YQB: 'America/Toronto',
  YVR: 'America/Vancouver',
  YYJ: 'America/Vancouver',
  YLW: 'America/Vancouver',
  YYC: 'America/Edmonton',
  YEG: 'America/Edmonton',
  YMM: 'America/Edmonton',
  YWG: 'America/Winnipeg',
  YQR: 'America/Regina',
  YXE: 'America/Regina',
  YHZ: 'America/Halifax',
  YQM: 'America/Moncton',
  YYT: 'America/St_Johns',

  // Europe
  LHR: 'Europe/London',
  LGW: 'Europe/London',
  STN: 'Europe/London',
  LTN: 'Europe/London',
  MAN: 'Europe/London',
  EDI: 'Europe/London',
  DUB: 'Europe/Dublin',
  SNN: 'Europe/Dublin',
  CDG: 'Europe/Paris',
  ORY: 'Europe/Paris',
  AMS: 'Europe/Amsterdam',
  FRA: 'Europe/Berlin',
  MUC: 'Europe/Berlin',
  BER: 'Europe/Berlin',
  MAD: 'Europe/Madrid',
  BCN: 'Europe/Madrid',
  FCO: 'Europe/Rome',
  MXP: 'Europe/Rome',
  ZRH: 'Europe/Zurich',
  GVA: 'Europe/Zurich',
  VIE: 'Europe/Vienna',
  BRU: 'Europe/Brussels',
  CPH: 'Europe/Copenhagen',
  ARN: 'Europe/Stockholm',
  OSL: 'Europe/Oslo',
  HEL: 'Europe/Helsinki',
  LIS: 'Europe/Lisbon',
  ATH: 'Europe/Athens',
  IST: 'Europe/Istanbul',
  SAW: 'Europe/Istanbul',

  // Asia / Middle East
  DXB: 'Asia/Dubai',
  DWC: 'Asia/Dubai',
  AUH: 'Asia/Dubai',
  DOH: 'Asia/Qatar',
  HND: 'Asia/Tokyo',
  NRT: 'Asia/Tokyo',
  KIX: 'Asia/Tokyo',
  ICN: 'Asia/Seoul',
  HKG: 'Asia/Hong_Kong',
  TPE: 'Asia/Taipei',
  BKK: 'Asia/Bangkok',
  SIN: 'Asia/Singapore',
  KUL: 'Asia/Kuala_Lumpur',
  CGK: 'Asia/Jakarta',
  DPS: 'Asia/Makassar',
  MNL: 'Asia/Manila',
  SGN: 'Asia/Ho_Chi_Minh',
  PEK: 'Asia/Shanghai',
  PKX: 'Asia/Shanghai',
  PVG: 'Asia/Shanghai',
  CAN: 'Asia/Shanghai',
  SZX: 'Asia/Shanghai',
  DEL: 'Asia/Kolkata',
  BOM: 'Asia/Kolkata',
  BLR: 'Asia/Kolkata',

  // Oceania
  SYD: 'Australia/Sydney',
  MEL: 'Australia/Melbourne',
  BNE: 'Australia/Brisbane',
  PER: 'Australia/Perth',
  AKL: 'Pacific/Auckland',

  // Latin America & Caribbean
  GRU: 'America/Sao_Paulo',
  GIG: 'America/Sao_Paulo',
  EZE: 'America/Argentina/Buenos_Aires',
  SCL: 'America/Santiago',
  BOG: 'America/Bogota',
  LIM: 'America/Lima',
  PTY: 'America/Panama',
  SJO: 'America/Costa_Rica',
  NAS: 'America/Nassau',
  MBJ: 'America/Jamaica',
  PUJ: 'America/Santo_Domingo',
  SDQ: 'America/Santo_Domingo',
  MEX: 'America/Mexico_City',
  CUN: 'America/Cancun',
  GDL: 'America/Mexico_City',
  MTY: 'America/Monterrey',
  TIJ: 'America/Tijuana',
  PVR: 'America/Bahia_Banderas',
  SJD: 'America/Mazatlan',
}

/**
 * Resolves the canonical IANA timezone for an airport, with geographical fallback
 */
export function getAirportTimezone(airport?: Airport | null): string {
  if (!airport) {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  }

  // 1. Explicit timezone property on Airport object
  if (airport.timezone) {
    return airport.timezone
  }

  // 2. Direct dictionary match by IATA code
  const iataUpper = (airport.iata || '').trim().toUpperCase()
  if (AIRPORT_TIMEZONES[iataUpper]) {
    return AIRPORT_TIMEZONES[iataUpper]
  }

  // 3. Fallback based on country and coordinates
  const { latitude: lat, longitude: lon, country } = airport

  if (country === 'US') {
    if (lat < 23 && lon < -150) return 'Pacific/Honolulu'
    if (lat > 52 && lon < -130) return 'America/Anchorage'
    // Arizona bounds: 31-37°N, -115 to -109°W
    if (lat >= 31 && lat <= 37 && lon >= -115 && lon <= -109) return 'America/Phoenix'
    if (lon <= -114.5) return 'America/Los_Angeles'
    if (lon <= -103.5) return 'America/Denver'
    if (lon <= -85.5) return 'America/Chicago'
    return 'America/New_York'
  }

  if (country === 'CA') {
    if (lon > -59) return 'America/St_Johns'
    if (lon > -68) return 'America/Halifax'
    if (lon > -90) return 'America/Toronto'
    if (lon > -102) return 'America/Winnipeg'
    if (lon > -115) return 'America/Edmonton'
    return 'America/Vancouver'
  }

  if (country === 'MX') {
    if (lon <= -114) return 'America/Tijuana'
    if (lon <= -105) return 'America/Mazatlan'
    if (lon > -88) return 'America/Cancun'
    return 'America/Mexico_City'
  }

  if (country === 'GB' || country === 'IE') {
    return 'Europe/London'
  }

  // Default to system timezone if unmapped
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

/**
 * Formats a Date into the destination airport's local time (e.g. "14:25 EDT")
 */
export function formatAirportLocalTime(
  date?: Date | string | number | null,
  airport?: Airport | null,
  includeTzCode = true
): string | null {
  if (!date) return null
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return null

  const timeZone = getAirportTimezone(airport)

  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone,
      timeZoneName: 'short',
    }).formatToParts(d)

    const hour = parts.find(p => p.type === 'hour')?.value || '00'
    const minute = parts.find(p => p.type === 'minute')?.value || '00'
    const tzCode = parts.find(p => p.type === 'timeZoneName')?.value || ''

    if (includeTzCode && tzCode) {
      return `${hour}:${minute} ${tzCode}`
    }
    return `${hour}:${minute}`
  } catch {
    // Graceful fallback to client local time
    const hour = d.getHours().toString().padStart(2, '0')
    const minute = d.getMinutes().toString().padStart(2, '0')
    return `${hour}:${minute}`
  }
}
