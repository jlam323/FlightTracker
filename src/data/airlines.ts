export interface Airline {
  icao: string
  iata: string
  name: string
  callsign: string
  country: string
  category: 'north_america' | 'global'
}

export const AIRLINES: Record<string, Airline> = {
  // North America
  DAL: { icao: 'DAL', iata: 'DL', name: 'Delta Air Lines', callsign: 'DELTA', country: 'United States', category: 'north_america' },
  UAL: { icao: 'UAL', iata: 'UA', name: 'United Airlines', callsign: 'UNITED', country: 'United States', category: 'north_america' },
  AAL: { icao: 'AAL', iata: 'AA', name: 'American Airlines', callsign: 'AMERICAN', country: 'United States', category: 'north_america' },
  SWA: { icao: 'SWA', iata: 'WN', name: 'Southwest Airlines', callsign: 'SOUTHWEST', country: 'United States', category: 'north_america' },
  ASA: { icao: 'ASA', iata: 'AS', name: 'Alaska Airlines', callsign: 'ALASKA', country: 'United States', category: 'north_america' },
  JBU: { icao: 'JBU', iata: 'B6', name: 'JetBlue Airways', callsign: 'JETBLUE', country: 'United States', category: 'north_america' },
  SKW: { icao: 'SKW', iata: 'OO', name: 'SkyWest Airlines', callsign: 'SKYWEST', country: 'United States', category: 'north_america' },
  ENY: { icao: 'ENY', iata: 'MQ', name: 'Envoy Air', callsign: 'ENVOY', country: 'United States', category: 'north_america' },
  RPA: { icao: 'RPA', iata: 'YX', name: 'Republic Airways', callsign: 'BRICKYARD', country: 'United States', category: 'north_america' },
  EDV: { icao: 'EDV', iata: '9E', name: 'Endeavor Air', callsign: 'ENDEAVOR', country: 'United States', category: 'north_america' },
  FFT: { icao: 'FFT', iata: 'F9', name: 'Frontier Airlines', callsign: 'FRONTIER FLIGHT', country: 'United States', category: 'north_america' },
  NKS: { icao: 'NKS', iata: 'NK', name: 'Spirit Airlines', callsign: 'SPIRIT WINGS', country: 'United States', category: 'north_america' },
  AAY: { icao: 'AAY', iata: 'G4', name: 'Allegiant Air', callsign: 'ALLEGIANT', country: 'United States', category: 'north_america' },
  HAL: { icao: 'HAL', iata: 'HA', name: 'Hawaiian Airlines', callsign: 'HAWAIIAN', country: 'United States', category: 'north_america' },
  SCX: { icao: 'SCX', iata: 'SY', name: 'Sun Country Airlines', callsign: 'SUN COUNTRY', country: 'United States', category: 'north_america' },
  UPS: { icao: 'UPS', iata: '5X', name: 'UPS Airlines', callsign: 'UPS', country: 'United States', category: 'north_america' },
  FDX: { icao: 'FDX', iata: 'FX', name: 'FedEx Express', callsign: 'FEDEX', country: 'United States', category: 'north_america' },
  ACA: { icao: 'ACA', iata: 'AC', name: 'Air Canada', callsign: 'AIR CANADA', country: 'Canada', category: 'north_america' },
  WJA: { icao: 'WJA', iata: 'WS', name: 'WestJet', callsign: 'WESTJET', country: 'Canada', category: 'north_america' },
  TSC: { icao: 'TSC', iata: 'TS', name: 'Air Transat', callsign: 'TRANSAT', country: 'Canada', category: 'north_america' },
  ROU: { icao: 'ROU', iata: 'RV', name: 'Air Canada Rouge', callsign: 'ROUGE', country: 'Canada', category: 'north_america' },
  POE: { icao: 'POE', iata: 'PD', name: 'Porter Airlines', callsign: 'PORTER AIR', country: 'Canada', category: 'north_america' },
  AMX: { icao: 'AMX', iata: 'AM', name: 'Aeromexico', callsign: 'AEROMEXICO', country: 'Mexico', category: 'north_america' },
  VOI: { icao: 'VOI', iata: 'Y4', name: 'Volaris', callsign: 'VOLARIS', country: 'Mexico', category: 'north_america' },
  VIV: { icao: 'VIV', iata: 'VB', name: 'VivaAerobus', callsign: 'AEROENLACES', country: 'Mexico', category: 'north_america' },
  CMP: { icao: 'CMP', iata: 'CM', name: 'Copa Airlines', callsign: 'COPA', country: 'Panama', category: 'north_america' },

  // Global
  BAW: { icao: 'BAW', iata: 'BA', name: 'British Airways', callsign: 'SPEEDBIRD', country: 'United Kingdom', category: 'global' },
  AFR: { icao: 'AFR', iata: 'AF', name: 'Air France', callsign: 'AIRFRANS', country: 'France', category: 'global' },
  DLH: { icao: 'DLH', iata: 'LH', name: 'Lufthansa', callsign: 'LUFTHANSA', country: 'Germany', category: 'global' },
  KLM: { icao: 'KLM', iata: 'KL', name: 'KLM Royal Dutch Airlines', callsign: 'KLM', country: 'Netherlands', category: 'global' },
  VIR: { icao: 'VIR', iata: 'VS', name: 'Virgin Atlantic', callsign: 'VIRGIN', country: 'United Kingdom', category: 'global' },
  SWR: { icao: 'SWR', iata: 'LX', name: 'Swiss International Air Lines', callsign: 'SWISS', country: 'Switzerland', category: 'global' },
  IBE: { icao: 'IBE', iata: 'IB', name: 'Iberia', callsign: 'IBERIA', country: 'Spain', category: 'global' },
  SAS: { icao: 'SAS', iata: 'SK', name: 'Scandinavian Airlines', callsign: 'SCANDINAVIAN', country: 'Sweden', category: 'global' },
  RYR: { icao: 'RYR', iata: 'FR', name: 'Ryanair', callsign: 'RYANAIR', country: 'Ireland', category: 'global' },
  EZY: { icao: 'EZY', iata: 'U2', name: 'easyJet', callsign: 'EASY', country: 'United Kingdom', category: 'global' },
  THY: { icao: 'THY', iata: 'TK', name: 'Turkish Airlines', callsign: 'TURKISH', country: 'Turkey', category: 'global' },
  UAE: { icao: 'UAE', iata: 'EK', name: 'Emirates', callsign: 'EMIRATES', country: 'United Arab Emirates', category: 'global' },
  QTR: { icao: 'QTR', iata: 'QR', name: 'Qatar Airways', callsign: 'QATARI', country: 'Qatar', category: 'global' },
  ETD: { icao: 'ETD', iata: 'EY', name: 'Etihad Airways', callsign: 'ETIHAD', country: 'United Arab Emirates', category: 'global' },
  ANA: { icao: 'ANA', iata: 'NH', name: 'All Nippon Airways', callsign: 'ALL NIPPON', country: 'Japan', category: 'global' },
  JAL: { icao: 'JAL', iata: 'JL', name: 'Japan Airlines', callsign: 'JAPANAIR', country: 'Japan', category: 'global' },
  SIA: { icao: 'SIA', iata: 'SQ', name: 'Singapore Airlines', callsign: 'SINGAPORE', country: 'Singapore', category: 'global' },
  CPA: { icao: 'CPA', iata: 'CX', name: 'Cathay Pacific', callsign: 'CATHAY', country: 'Hong Kong', category: 'global' },
  KAL: { icao: 'KAL', iata: 'KE', name: 'Korean Air', callsign: 'KOREAN AIR', country: 'South Korea', category: 'global' },
  CCA: { icao: 'CCA', iata: 'CA', name: 'Air China', callsign: 'AIR CHINA', country: 'China', category: 'global' },
  CSN: { icao: 'CSN', iata: 'CZ', name: 'China Southern Airlines', callsign: 'CHINA SOUTHERN', country: 'China', category: 'global' },
  CES: { icao: 'CES', iata: 'MU', name: 'China Eastern Airlines', callsign: 'CHINA EASTERN', country: 'China', category: 'global' },
  IGO: { icao: 'IGO', iata: '6E', name: 'IndiGo', callsign: 'IFLY', country: 'India', category: 'global' },
  QFA: { icao: 'QFA', iata: 'QF', name: 'Qantas', callsign: 'QANTAS', country: 'Australia', category: 'global' },
  ANZ: { icao: 'ANZ', iata: 'NZ', name: 'Air New Zealand', callsign: 'NEW ZEALAND', country: 'New Zealand', category: 'global' },
  LAN: { icao: 'LAN', iata: 'LA', name: 'LATAM Airlines', callsign: 'LAN CHILE', country: 'Chile', category: 'global' },
  AVA: { icao: 'AVA', iata: 'AV', name: 'Avianca', callsign: 'AVIANCA', country: 'Colombia', category: 'global' },
}

export const SORTED_AIRLINES: Airline[] = Object.values(AIRLINES).sort((a, b) =>
  a.name.localeCompare(b.name)
)

export const NORTH_AMERICA_AIRLINES: Airline[] = SORTED_AIRLINES.filter(
  a => a.category === 'north_america'
)

export const GLOBAL_AIRLINES: Airline[] = SORTED_AIRLINES.filter(
  a => a.category === 'global'
)

export function getAirline(icaoOrCode?: string): Airline | undefined {
  if (!icaoOrCode) return undefined
  const upper = icaoOrCode.trim().toUpperCase()
  if (AIRLINES[upper]) return AIRLINES[upper]
  // Try IATA
  return Object.values(AIRLINES).find(a => a.iata === upper)
}

export function detectAirlineFromCallsign(callsign: string): Airline | undefined {
  if (!callsign) return undefined
  const prefix = callsign.slice(0, 3).toUpperCase()
  return AIRLINES[prefix]
}
