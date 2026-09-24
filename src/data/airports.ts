import { Airport } from '../types/flight'

export const AIRPORTS: Record<string, Airport> = {
  // Major US & Canadian Hubs
  ATL: { iata: 'ATL', icao: 'KATL', name: 'Hartsfield-Jackson Atlanta Intl', city: 'Atlanta', country: 'US', latitude: 33.6407, longitude: -84.4277 },
  LAX: { iata: 'LAX', icao: 'KLAX', name: 'Los Angeles Intl', city: 'Los Angeles', country: 'US', latitude: 33.9416, longitude: -118.4085 },
  ORD: { iata: 'ORD', icao: 'KORD', name: "O'Hare Intl", city: 'Chicago', country: 'US', latitude: 41.9742, longitude: -87.9073 },
  DFW: { iata: 'DFW', icao: 'KDFW', name: 'Dallas/Fort Worth Intl', city: 'Dallas', country: 'US', latitude: 32.8998, longitude: -97.0403 },
  DEN: { iata: 'DEN', icao: 'KDEN', name: 'Denver Intl', city: 'Denver', country: 'US', latitude: 39.8561, longitude: -104.6737 },
  JFK: { iata: 'JFK', icao: 'KJFK', name: 'John F. Kennedy Intl', city: 'New York', country: 'US', latitude: 40.6413, longitude: -73.7781 },
  SFO: { iata: 'SFO', icao: 'KSFO', name: 'San Francisco Intl', city: 'San Francisco', country: 'US', latitude: 37.6213, longitude: -122.3790 },
  SEA: { iata: 'SEA', icao: 'KSEA', name: 'Seattle-Tacoma Intl', city: 'Seattle', country: 'US', latitude: 47.4502, longitude: -122.3088 },
  LAS: { iata: 'LAS', icao: 'KLAS', name: 'Harry Reid Intl', city: 'Las Vegas', country: 'US', latitude: 36.0840, longitude: -115.1537 },
  MCO: { iata: 'MCO', icao: 'KMCO', name: 'Orlando Intl', city: 'Orlando', country: 'US', latitude: 28.4312, longitude: -81.3081 },
  EWR: { iata: 'EWR', icao: 'KEWR', name: 'Newark Liberty Intl', city: 'Newark', country: 'US', latitude: 40.6895, longitude: -74.1745 },
  CLT: { iata: 'CLT', icao: 'KCLT', name: 'Charlotte Douglas Intl', city: 'Charlotte', country: 'US', latitude: 35.2144, longitude: -80.9473 },
  PHX: { iata: 'PHX', icao: 'KPHX', name: 'Phoenix Sky Harbor Intl', city: 'Phoenix', country: 'US', latitude: 33.4373, longitude: -112.0078 },
  IAH: { iata: 'IAH', icao: 'KIAH', name: 'George Bush Intercontinental', city: 'Houston', country: 'US', latitude: 29.9902, longitude: -95.3368 },
  MIA: { iata: 'MIA', icao: 'KMIA', name: 'Miami Intl', city: 'Miami', country: 'US', latitude: 25.7959, longitude: -80.2870 },
  BOS: { iata: 'BOS', icao: 'KBOS', name: 'Logan Intl', city: 'Boston', country: 'US', latitude: 42.3656, longitude: -71.0096 },
  MSP: { iata: 'MSP', icao: 'KMSP', name: 'Minneapolis-Saint Paul Intl', city: 'Minneapolis', country: 'US', latitude: 44.8848, longitude: -93.2223 },
  DTW: { iata: 'DTW', icao: 'KDTW', name: 'Detroit Metro Wayne County', city: 'Detroit', country: 'US', latitude: 42.2162, longitude: -83.3554 },
  FLL: { iata: 'FLL', icao: 'KFLL', name: 'Fort Lauderdale-Hollywood Intl', city: 'Fort Lauderdale', country: 'US', latitude: 26.0742, longitude: -80.1506 },
  PHL: { iata: 'PHL', icao: 'KPHL', name: 'Philadelphia Intl', city: 'Philadelphia', country: 'US', latitude: 39.8729, longitude: -75.2437 },
  LGA: { iata: 'LGA', icao: 'KLGA', name: 'LaGuardia', city: 'New York', country: 'US', latitude: 40.7769, longitude: -73.8740 },
  BWI: { iata: 'BWI', icao: 'KBWI', name: 'Baltimore/Washington Intl', city: 'Baltimore', country: 'US', latitude: 39.1774, longitude: -76.6684 },
  SLC: { iata: 'SLC', icao: 'KSLC', name: 'Salt Lake City Intl', city: 'Salt Lake City', country: 'US', latitude: 40.7899, longitude: -111.9791 },
  SAN: { iata: 'SAN', icao: 'KSAN', name: 'San Diego Intl', city: 'San Diego', country: 'US', latitude: 32.7338, longitude: -117.1933 },
  IAD: { iata: 'IAD', icao: 'KIAD', name: 'Washington Dulles Intl', city: 'Washington', country: 'US', latitude: 38.9531, longitude: -77.4565 },
  DCA: { iata: 'DCA', icao: 'KDCA', name: 'Ronald Reagan Washington National', city: 'Washington', country: 'US', latitude: 38.8512, longitude: -77.0402 },
  MDW: { iata: 'MDW', icao: 'KMDW', name: 'Chicago Midway Intl', city: 'Chicago', country: 'US', latitude: 41.7868, longitude: -87.7522 },
  TPA: { iata: 'TPA', icao: 'KTPA', name: 'Tampa Intl', city: 'Tampa', country: 'US', latitude: 27.9755, longitude: -82.5332 },
  PDX: { iata: 'PDX', icao: 'KPDX', name: 'Portland Intl', city: 'Portland', country: 'US', latitude: 45.5898, longitude: -122.5951 },
  HNL: { iata: 'HNL', icao: 'PHNL', name: 'Daniel K. Inouye Intl', city: 'Honolulu', country: 'US', latitude: 21.3187, longitude: -157.9225 },
  ANC: { iata: 'ANC', icao: 'PANC', name: 'Ted Stevens Anchorage Intl', city: 'Anchorage', country: 'US', latitude: 61.1744, longitude: -149.9964 },
  AUS: { iata: 'AUS', icao: 'KAUS', name: 'Austin-Bergstrom Intl', city: 'Austin', country: 'US', latitude: 30.1975, longitude: -97.6664 },
  BNA: { iata: 'BNA', icao: 'KBNA', name: 'Nashville Intl', city: 'Nashville', country: 'US', latitude: 36.1263, longitude: -86.6774 },
  STL: { iata: 'STL', icao: 'KSTL', name: 'St. Louis Lambert Intl', city: 'St. Louis', country: 'US', latitude: 38.7487, longitude: -90.3700 },
  SJC: { iata: 'SJC', icao: 'KSJC', name: 'Norman Y. Mineta San Jose Intl', city: 'San Jose', country: 'US', latitude: 37.3639, longitude: -121.9289 },
  OAK: { iata: 'OAK', icao: 'KOAK', name: 'Oakland Intl', city: 'Oakland', country: 'US', latitude: 37.7213, longitude: -122.2207 },
  SMF: { iata: 'SMF', icao: 'KSMF', name: 'Sacramento Intl', city: 'Sacramento', country: 'US', latitude: 38.6954, longitude: -121.5908 },
  RDU: { iata: 'RDU', icao: 'KRDU', name: 'Raleigh-Durham Intl', city: 'Raleigh', country: 'US', latitude: 35.8801, longitude: -78.7880 },
  MSY: { iata: 'MSY', icao: 'KMSY', name: 'Louis Armstrong New Orleans Intl', city: 'New Orleans', country: 'US', latitude: 29.9934, longitude: -90.2580 },
  YYZ: { iata: 'YYZ', icao: 'CYYZ', name: 'Toronto Pearson Intl', city: 'Toronto', country: 'CA', latitude: 43.6777, longitude: -79.6248 },
  YVR: { iata: 'YVR', icao: 'CYVR', name: 'Vancouver Intl', city: 'Vancouver', country: 'CA', latitude: 49.1967, longitude: -123.1815 },
  YUL: { iata: 'YUL', icao: 'CYUL', name: 'Montréal-Trudeau Intl', city: 'Montreal', country: 'CA', latitude: 45.4706, longitude: -73.7408 },
  YYC: { iata: 'YYC', icao: 'CYYC', name: 'Calgary Intl', city: 'Calgary', country: 'CA', latitude: 51.1215, longitude: -114.0076 },
  YEG: { iata: 'YEG', icao: 'CYEG', name: 'Edmonton Intl', city: 'Edmonton', country: 'CA', latitude: 53.3097, longitude: -113.5798 },
  YOW: { iata: 'YOW', icao: 'CYOW', name: 'Ottawa Macdonald-Cartier Intl', city: 'Ottawa', country: 'CA', latitude: 45.3225, longitude: -75.6692 },

  // Key International Hubs for Transoceanic / Global Flights
  LHR: { iata: 'LHR', icao: 'EGLL', name: 'London Heathrow', city: 'London', country: 'GB', latitude: 51.4700, longitude: -0.4543 },
  CDG: { iata: 'CDG', icao: 'LFPG', name: 'Charles de Gaulle', city: 'Paris', country: 'FR', latitude: 49.0097, longitude: 2.5479 },
  AMS: { iata: 'AMS', icao: 'EHAM', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'NL', latitude: 52.3105, longitude: 4.7683 },
  FRA: { iata: 'FRA', icao: 'EDDF', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'DE', latitude: 50.0379, longitude: 8.5622 },
  HND: { iata: 'HND', icao: 'RJTT', name: 'Tokyo Haneda', city: 'Tokyo', country: 'JP', latitude: 35.5494, longitude: 139.7798 },
  NRT: { iata: 'NRT', icao: 'RJAA', name: 'Tokyo Narita', city: 'Tokyo', country: 'JP', latitude: 35.7720, longitude: 140.3929 },
  ICN: { iata: 'ICN', icao: 'RKSI', name: 'Incheon Intl', city: 'Seoul', country: 'KR', latitude: 37.4602, longitude: 126.4407 },
  SIN: { iata: 'SIN', icao: 'WSSS', name: 'Singapore Changi', city: 'Singapore', country: 'SG', latitude: 1.3644, longitude: 103.9915 },
  HKG: { iata: 'HKG', icao: 'VHHH', name: 'Hong Kong Intl', city: 'Hong Kong', country: 'HK', latitude: 22.3080, longitude: 113.9185 },
  DXB: { iata: 'DXB', icao: 'OMDB', name: 'Dubai Intl', city: 'Dubai', country: 'AE', latitude: 25.2532, longitude: 55.3657 },
  SYD: { iata: 'SYD', icao: 'YSSY', name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'AU', latitude: -33.9399, longitude: 151.1753 },
  MEX: { iata: 'MEX', icao: 'MMMX', name: 'Mexico City Intl', city: 'Mexico City', country: 'MX', latitude: 19.4361, longitude: -99.0719 },
  CUN: { iata: 'CUN', icao: 'MMUN', name: 'Cancún Intl', city: 'Cancún', country: 'MX', latitude: 21.0365, longitude: -86.8771 },
}

export function getAirport(code?: string): Airport | undefined {
  if (!code) return undefined
  const upper = code.trim().toUpperCase()
  // Try direct IATA lookup
  if (AIRPORTS[upper]) return AIRPORTS[upper]
  // Try ICAO match
  return Object.values(AIRPORTS).find(a => a.icao === upper)
}
