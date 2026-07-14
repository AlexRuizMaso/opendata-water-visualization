import { describe, it, expect } from 'vitest';
import { normalizeStationName } from '../stationNameMap';
import STATION_NAME_MAP from '../stationNameMap';

describe('normalizeStationName', () => {
  it('normalizes truncated accent names', () => {
    expect(normalizeStationName('Alcarrs')).toBe('Alcarràs');
    expect(normalizeStationName('Trrega')).toBe('Tàrrega');
    expect(normalizeStationName('Puigcerd')).toBe('Puigcerdà');
  });

  it('normalizes mountain station altitude variants', () => {
    expect(normalizeStationName('Bonabé (1.691 m)')).toBe('Bonabé (1.693 m)');
    expect(normalizeStationName('Bonaigua (2.262 m)')).toBe('Bonaigua (2.266 m)');
    expect(normalizeStationName('Boí (2.537 m)')).toBe('Boí (2.535 m)');
  });

  it('normalizes Pant de to Pantà de', () => {
    expect(normalizeStationName('Pant de Sau')).toBe('Pantà de Sau');
    expect(normalizeStationName('Pant de Siurana')).toBe('Pantà de Siurana');
  });

  it('strips U+FFFD replacement characters', () => {
    expect(normalizeStationName('Alcarr\ufffds')).toBe('Alcarràs');
  });

  it('returns original name if not in map', () => {
    expect(normalizeStationName('Unknown Station')).toBe('Unknown Station');
  });

  it('returns falsy input as-is', () => {
    expect(normalizeStationName(null)).toBe(null);
    expect(normalizeStationName('')).toBe('');
  });

  it('normalizes Barcelona - Zona Universitria', () => {
    expect(normalizeStationName('Barcelona - Zona Universitria')).toBe('Barcelona - Zona Universitària');
  });

  it('normalizes Portbou alias', () => {
    expect(normalizeStationName('Portbou - coll dels Belitres')).toBe('Portbou');
  });

  it('covers all entries in the map without errors', () => {
    Object.keys(STATION_NAME_MAP).forEach(key => {
      const result = normalizeStationName(key);
      expect(result).toBe(STATION_NAME_MAP[key]);
    });
  });
});

describe('STATION_NAME_MAP', () => {
  it('is a non-empty object', () => {
    expect(typeof STATION_NAME_MAP).toBe('object');
    expect(Object.keys(STATION_NAME_MAP).length).toBeGreaterThan(0);
  });

  it('all values are strings', () => {
    Object.values(STATION_NAME_MAP).forEach(val => {
      expect(typeof val).toBe('string');
    });
  });
});
