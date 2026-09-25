export interface Airline {
  icao: string
  iata: string
  name: string
  callsign: string
  country: string
}

export const AIRLINES: Record<string, Airline> = {
  DAL: { icao: 'DAL', iata: 'DL', name: 'Delta Air Lines', callsign: 'DELTA', country: 'United States' },
  UAL: { icao: 'UAL', iata: 'UA', name: 'United Airlines', callsign: 'UNITED', country: 'United States' },
  AAL: { icao: 'AAL', iata: 'AA', name: 'American Airlines', callsign: 'AMERICAN', country: 'United States' },
  SWA: { icao: 'SWA', iata: 'WN', name: 'Southwest Airlines', callsign: 'SOUTHWEST', country: 'United States' },
  ASA: { icao: 'ASA', iata: 'AS', name: 'Alaska Airlines', callsign: 'ALASKA', country: 'United States' },
  JBU: { icao: 'JBU', iata: 'B6', name: 'JetBlue Airways', callsign: 'JETBLUE', country: 'United States' },
  SKW: { icao: 'SKW', iata: 'OO', name: 'SkyWest Airlines', callsign: 'SKYWEST', country: 'United States' },
  ENY: { icao: 'ENY', iata: 'MQ', name: 'Envoy Air', callsign: 'ENVOY', country: 'United States' },
  RPA: { icao: 'RPA', iata: 'YX', name: 'Republic Airways', callsign: 'BRICKYARD', country: 'United States' },
  EDV: { icao: 'EDV', iata: '9E', name: 'Endeavor Air', callsign: 'ENDEAVOR', country: 'United States' },
  FFT: { icao: 'FFT', iata: 'F9', name: 'Frontier Airlines', callsign: 'FRONTIER FLIGHT', country: 'United States' },
  NKS: { icao: 'NKS', iata: 'NK', name: 'Spirit Airlines', callsign: 'SPIRIT WINGS', country: 'United States' },
  AAY: { icao: 'AAY', iata: 'G4', name: 'Allegiant Air', callsign: 'ALLEGIANT', country: 'United States' },
  HAL: { icao: 'HAL', iata: 'HA', name: 'Hawaiian Airlines', callsign: 'HAWAIIAN', country: 'United States' },
  ACA: { icao: 'ACA', iata: 'AC', name: 'Air Canada', callsign: 'AIR CANADA', country: 'Canada' },
  WJA: { icao: 'WJA', iata: 'WS', name: 'WestJet', callsign: 'WESTJET', country: 'Canada' },
  TSC: { icao: 'TSC', iata: 'TS', name: 'Air Transat', callsign: 'TRANSAT', country: 'Canada' },
  ROU: { icao: 'ROU', iata: 'RV', name: 'Air Canada Rouge', callsign: 'ROUGE', country: 'Canada' },
  BAW: { icao: 'BAW', iata: 'BA', name: 'British Airways', callsign: 'SPEEDBIRD', country: 'United Kingdom' },
  AFR: { icao: 'AFR', iata: 'AF', name: 'Air France', callsign: 'AIRFRANS', country: 'France' },
  DLH: { icao: 'DLH', iata: 'LH', name: 'Lufthansa', callsign: 'LUFTHANSA', country: 'Germany' },
  KLM: { icao: 'KLM', iata: 'KL', name: 'KLM Royal Dutch Airlines', callsign: 'KLM', country: 'Netherlands' },
  ANA: { icao: 'ANA', iata: 'NH', name: 'All Nippon Airways', callsign: 'ALL NIPPON', country: 'Japan' },
  JAL: { icao: 'JAL', iata: 'JL', name: 'Japan Airlines', callsign: 'JAPANAIR', country: 'Japan' },
  QFA: { icao: 'QFA', iata: 'QF', name: 'Qantas', callsign: 'QANTAS', country: 'Australia' },
  AMX: { icao: 'AMX', iata: 'AM', name: 'Aeromexico', callsign: 'AEROMEXICO', country: 'Mexico' },
  VOI: { icao: 'VOI', iata: 'Y4', name: 'Volaris', callsign: 'VOLARIS', country: 'Mexico' },
  FDX: { icao: 'FDX', iata: 'FX', name: 'FedEx Express', callsign: 'FEDEX', country: 'United States' },
}

export const SORTED_AIRLINES: Airline[] = Object.values(AIRLINES).sort((a, b) =>
  a.name.localeCompare(b.name)
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
