import { RawFr24Flight } from '../services/flightProcessor'

/**
 * Realistic snapshot of active North American and transcontinental flights
 * Tuple format matches FR24 zone feed:
 * [icao24, lat, lon, heading, alt, speed, squawk, radar, model, reg, time, origin, dest, flight, onGnd, vSpeed, callsign, _, airline]
 */
export const MOCK_FLIGHTS_FEED: Record<string, RawFr24Flight> = {
  // Transcontinental East-West Flights
  'a101': ['a101', 39.5, -98.2, 265, 36000, 485, '2401', 'F-EST', 'B739', 'N824DN', Date.now(), 'JFK', 'LAX', 'DL1234', 0, 0, 'DAL1234', null, 'DAL'],
  'a102': ['a102', 40.1, -95.4, 85, 37000, 520, '3122', 'F-EST', 'B772', 'N78003', Date.now(), 'SFO', 'EWR', 'UA240', 0, 0, 'UAL240', null, 'UAL'],
  'a103': ['a103', 35.8, -102.1, 95, 34000, 510, '1405', 'F-EST', 'A321', 'N103AA', Date.now(), 'LAX', 'MIA', 'AA100', 0, 0, 'AAL100', null, 'AAL'],
  'a104': ['a104', 38.2, -108.5, 275, 38000, 470, '4210', 'F-EST', 'B737', 'N421WN', Date.now(), 'MDW', 'DEN', 'WN421', 0, 0, 'SWA421', null, 'SWA'],
  'a105': ['a105', 45.3, -112.4, 290, 35000, 460, '5512', 'F-EST', 'B738', 'N512AS', Date.now(), 'ORD', 'SEA', 'AS350', 0, 0, 'ASA350', null, 'ASA'],

  // North-South Corridors
  'a106': ['a106', 32.1, -84.2, 15, 33000, 490, '6102', 'F-EST', 'A320', 'N610JB', Date.now(), 'FLL', 'BOS', 'B6102', 0, 0, 'JBU102', null, 'JBU'],
  'a107': ['a107', 31.5, -95.8, 355, 36000, 480, '7321', 'F-EST', 'B738', 'N732AA', Date.now(), 'IAH', 'ORD', 'AA522', 0, 0, 'AAL522', null, 'AAL'],
  'a108': ['a108', 34.6, -85.1, 180, 24000, 390, '1200', 'F-EST', 'A321', 'N921DL', Date.now(), 'DTW', 'ATL', 'DL882', 0, -1200, 'DAL882', null, 'DAL'],
  'a109': ['a109', 36.2, -119.5, 335, 31000, 440, '2234', 'F-EST', 'A320', 'N223WN', Date.now(), 'SAN', 'SFO', 'WN812', 0, 0, 'SWA812', null, 'SWA'],
  'a110': ['a110', 43.8, -121.2, 160, 37000, 475, '3341', 'F-EST', 'B739', 'N334AS', Date.now(), 'SEA', 'LAX', 'AS115', 0, 0, 'ASA115', null, 'ASA'],

  // Midwest & Texas Hubs
  'a111': ['a111', 34.8, -98.2, 175, 14000, 310, '4101', 'F-EST', 'B773', 'N773AA', Date.now(), 'DEN', 'DFW', 'AA192', 0, -1800, 'AAL192', null, 'AAL'],
  'a112': ['a112', 38.6, -89.4, 240, 32000, 465, '5120', 'F-EST', 'B738', 'N512WN', Date.now(), 'CLE', 'MCO', 'WN140', 0, 0, 'SWA140', null, 'SWA'],
  'a113': ['a113', 42.5, -78.2, 260, 34000, 450, '6211', 'F-EST', 'A320', 'N621DL', Date.now(), 'BOS', 'ORD', 'DL440', 0, 0, 'DAL440', null, 'DAL'],
  'a114': ['a114', 36.5, -82.4, 230, 28000, 420, '7100', 'F-EST', 'B737', 'N710WN', Date.now(), 'BWI', 'BNA', 'WN632', 0, 0, 'SWA632', null, 'SWA'],
  'a115': ['a115', 30.8, -97.2, 10, 18000, 340, '1540', 'F-EST', 'E175', 'N154SK', Date.now(), 'SAT', 'DFW', 'OO441', 0, 1500, 'SKW441', null, 'SKW'],

  // Canadian Corridors
  'c201': ['c201', 44.2, -76.8, 65, 33000, 495, '3105', 'F-EST', 'A333', 'C-GFAF', Date.now(), 'YYZ', 'YUL', 'AC101', 0, 0, 'ACA101', null, 'ACA'],
  'c202': ['c202', 51.4, -110.2, 265, 36000, 460, '4215', 'F-EST', 'B789', 'C-FVLQ', Date.now(), 'YYZ', 'YVR', 'AC33', 0, 0, 'ACA33', null, 'ACA'],
  'c203': ['c203', 52.8, -112.5, 180, 28000, 410, '5124', 'F-EST', 'B738', 'C-GWSJ', Date.now(), 'YEG', 'YYC', 'WS244', 0, 0, 'WJA244', null, 'WJA'],
  'c204': ['c204', 45.6, -74.1, 245, 30000, 440, '6312', 'F-EST', 'A21N', 'C-GOIK', Date.now(), 'YUL', 'YYZ', 'TS410', 0, 0, 'TSC410', null, 'TSC'],

  // International Arrivals / Departures
  'i301': ['i301', 44.5, -64.2, 245, 38000, 490, '2201', 'F-EST', 'A359', 'G-XWBA', Date.now(), 'LHR', 'JFK', 'BA117', 0, 0, 'BAW117', null, 'BAW'],
  'i302': ['i302', 46.2, -60.1, 235, 37000, 480, '3412', 'F-EST', 'B77W', 'F-GSQD', Date.now(), 'CDG', 'ATL', 'AF688', 0, 0, 'AFR688', null, 'AFR'],
  'i303': ['i303', 48.1, -125.4, 115, 39000, 520, '4102', 'F-EST', 'B789', 'JA873A', Date.now(), 'HND', 'LAX', 'NH106', 0, 0, 'ANA106', null, 'ANA'],
  'i304': ['i304', 27.5, -100.8, 15, 34000, 470, '5211', 'F-EST', 'B738', 'XA-ADV', Date.now(), 'MEX', 'ORD', 'AM686', 0, 0, 'AMX686', null, 'AMX'],
  'i305': ['i305', 43.2, -68.4, 60, 39000, 540, '6301', 'F-EST', 'A359', 'D-AIXP', Date.now(), 'BOS', 'FRA', 'LH423', 0, 0, 'DLH423', null, 'DLH'],

  // Florida / Caribbean Routes
  'f401': ['f401', 29.8, -82.4, 340, 35000, 485, '1421', 'F-EST', 'A320', 'N534NK', Date.now(), 'MCO', 'DTW', 'NK402', 0, 0, 'NKS402', null, 'NKS'],
  'f402': ['f402', 26.5, -84.8, 305, 36000, 490, '2512', 'F-EST', 'A321', 'N902FR', Date.now(), 'MIA', 'DEN', 'F91204', 0, 0, 'FFT1204', null, 'FFT'],
  'f403': ['f403', 23.4, -86.1, 15, 37000, 495, '3614', 'F-EST', 'B738', 'N814AA', Date.now(), 'CUN', 'DFW', 'AA1228', 0, 0, 'AAL1228', null, 'AAL'],

  // Cargo Flights
  'g501': ['g501', 37.1, -87.4, 210, 32000, 470, '7401', 'F-EST', 'MD11', 'N584FE', Date.now(), 'IND', 'MEM', 'FX1042', 0, 0, 'FDX1042', null, 'FDX'],
  'g502': ['g502', 38.5, -85.2, 195, 29000, 440, '7502', 'F-EST', 'B763', 'N324UP', Date.now(), 'PHL', 'SDF', '5X882', 0, 0, 'UPS882', null, 'UPS'],

  // Ground / Taxiing Flights
  'g601': ['g601', 40.641, -73.778, 130, 0, 14, '1200', 'F-EST', 'B739', 'N942DN', Date.now(), 'JFK', 'BOS', 'DL492', 1, 0, 'DAL492', null, 'DAL'],
  'g602': ['g602', 33.943, -118.408, 250, 0, 18, '1200', 'F-EST', 'A321', 'N121AA', Date.now(), 'LAX', 'SFO', 'AA811', 1, 0, 'AAL811', null, 'AAL'],
  'g603': ['g603', 41.978, -87.905, 90, 0, 12, '1200', 'F-EST', 'B772', 'N78001', Date.now(), 'ORD', 'DEN', 'UA315', 1, 0, 'UAL315', null, 'UAL'],
  'g604': ['g604', 43.678, -79.625, 230, 0, 0, '1200', 'F-EST', 'B789', 'C-FGEI', Date.now(), 'YYZ', 'LHR', 'AC856', 1, 0, 'ACA856', null, 'ACA'],
}

