/**
 * Station Name Normalization Map
 *
 * The Catalan government API (analisi.transparenciacatalunya.cat) returns
 * inconsistent station names: the same station appears with proper Catalan
 * accents AND in a truncated form where accented characters are dropped entirely
 * (e.g., "Alcarràs" → "Alcarrs", losing the "à").
 *
 * This map covers ALL known duplicates. When the API is updated or new
 * inconsistencies appear, add entries here.
 *
 * NOTE: This file is duplicated in etl/src/utils/stationNameMap.js.
 * Both copies must stay in sync.
 *
 * Usage:
 *   import { normalizeStationName } from '../utils/stationNameMap.js';
 *   const name = normalizeStationName(rawName);
 */

const STATION_NAME_MAP = {
  // Truncated → correct (accented) form
  'Alcarrs': 'Alcarràs',
  'Alfarrs': 'Alfarràs',
  'Aliny': 'Alinyà',
  'Angls': 'Anglès',
  'Arts': 'Artés',
  'Asc': 'Ascó',
  'Barcelona - Zona Universitria': 'Barcelona - Zona Universitària',
  'Bonab (1.693 m)': 'Bonabé (1.693 m)',
  'Cad Nord (2.143 m) - Prat d\'Aguil': 'Cadí Nord (2.143 m) - Prat d\'Aguiló',
  'Cantonigrs': 'Cantonigròs',
  'Cass de la Selva': 'Cassà de la Selva',
  'Constant': 'Constantí',
  'Das - Aerdrom': 'Das - Aeròdrom',
  'el Cans': 'el Canós',
  'el Perell': 'el Perelló',
  'els Alams': 'els Alamús',
  'Font-rub': 'Font-rubí',
  'Golms': 'Golmés',
  'Guardiola de Bergued': 'Guardiola de Berguedà',
  'l\'Espluga de Francol': 'l\'Espluga de Francolí',
  'la Bisbal d\'Empord': 'la Bisbal d\'Empordà',
  'la Bisbal del Peneds': 'la Bisbal del Penedès',
  'la Roca del Valls - ETAP Cardedeu': 'la Roca del Vallès - ETAP Cardedeu',
  'la Tallada d\'Empord': 'la Tallada d\'Empordà',
  'Moll - Fabert': 'Molló - Fabert',
  'Navs': 'Navès',
  'Nria (1.971 m)': 'Núria (1.971 m)',
  'Organy': 'Organyà',
  'Parets del Valls': 'Parets del Vallès',
  'Pins': 'Pinós',
  'Puigcerd': 'Puigcerdà',
  'Salria (2.451 m)': 'Salòria (2.451 m)',
  'Sant Cugat del Valls - CAR': 'Sant Cugat del Vallès - CAR',
  'Sant Lloren Savall': 'Sant Llorenç Savall',
  'Sant Mart Sarroca': 'Sant Martí Sarroca',
  'Sant Mart de Riucorb': 'Sant Martí de Riucorb',
  'Sant Pau de Segries': 'Sant Pau de Segúries',
  'Sant Rom d\'Abella': 'Sant Romà d\'Abella',
  'Sant Sadurn d\'Anoia': 'Sant Sadurní d\'Anoia',
  'Sers': 'Seròs',
  'Torroella de Fluvi': 'Torroella de Fluvià',
  'Torroella de Montgr': 'Torroella de Montgrí',
  'Trrega': 'Tàrrega',
  'Trvia': 'Tírvia',
  'Vielha - Eliprt': 'Vielha - Elipòrt',
  'Vilafranca del Peneds - la Granada': 'Vilafranca del Penedès - la Granada',
  'Vilanova de Mei': 'Vilanova de Meià',
  'Vilanova de Segri': 'Vilanova de Segrià',
  'Vilanova i la Geltr': 'Vilanova i la Geltrú',
  'Bo (2.535 m)': 'Boí (2.535 m)',
  'Castell d\'Empries': 'Castelló d\'Empúries',
  'dena': 'Òdena',
  'Ors': 'Orís',
  'Pant de Darnius - Boadella': 'Pantà de Darnius - Boadella',
  'Pant de Riba-roja': 'Pantà de Riba-roja',
  'Pant de Sau': 'Pantà de Sau',
  'Pant de Siurana': 'Pantà de Siurana',
  // Mountain stations: merge altitude variants (same code, 1-4m difference)
  'Bonabé (1.691 m)': 'Bonabé (1.693 m)',
  'Bonaigua (2.262 m)': 'Bonaigua (2.266 m)',
  'Boí (2.537 m)': 'Boí (2.535 m)',
  'Certascan (2.398 m)': 'Certascan (2.400 m)',
  'el Port del Comte (2.288 m)': 'el Port del Comte (2.290 m)',
  'Lac Redon (2.245 m)': 'Lac Redon (2.247 m)',
  'Malniu (2.229 m)': 'Malniu (2.230 m)',
  'Montsec d\'Ares (1.571 m)': 'Montsec d\'Ares (1.572 m)',
  'Puig Sesolles (1.666 m)': 'Puig Sesolles (1.668 m)',
  'Sasseuva (2.226 m)': 'Sasseuva (2.228 m)',
  'Cadí Nord (2.145 m) - Prat d\'Aguiló': 'Cadí Nord (2.143 m) - Prat d\'Aguiló',
  'Portbou - coll dels Belitres': 'Portbou',
};

/**
 * Normalize a station name to its correct accented form.
 * Strips U+FFFD replacement characters and applies the normalization map.
 * @param {string} name - Raw station name from the API
 * @returns {string} Normalized station name
 */
export function normalizeStationName(name) {
  if (!name) return name;
  name = name.replace(/\uFFFD/g, '');
  return STATION_NAME_MAP[name] || name;
}

export default STATION_NAME_MAP;
