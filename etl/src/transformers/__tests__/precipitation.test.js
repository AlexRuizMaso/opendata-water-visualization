import { describe, it, expect } from 'vitest';
import PrecipitationTransformer from '../precipitation.js';

describe('PrecipitationTransformer', () => {
  const transformer = new PrecipitationTransformer();

  const makeRawRecord = (overrides = {}) => ({
    id: 'Z71300072611',
    codi_estacio: 'Z7',
    nom_estacio: 'Alcarrs',
    data_lectura: '2026-07-11T00:00:00.000Z',
    codi_variable: '1300',
    nom_variable: 'Precipitació acumulada diària',
    valor: '5',
    unitat: 'mm',
    estat: 'Representatiu',
    ...overrides,
  });

  describe('normalizeRecord', () => {
    it('normalizes raw XEMA record', () => {
      const result = transformer.normalizeRecord(makeRawRecord({ data_lectura: '2026-07-11T00:00:00.000Z' }));
      expect(result.id).toBe('Z71300072611');
      expect(result.stationCode).toBe('Z7');
      expect(result.stationName).toBe('Alcarràs');
      expect(result.date).toBe('2026-07-11T00:00:00.000Z');
      expect(result.variableCode).toBe('1300');
      expect(result.variableName).toBe('precipitation_daily');
      expect(result.variableLabel).toBe('Precipitació acumulada diària');
      expect(result.value).toBe(5);
      expect(result.unit).toBe('mm');
      expect(result.status).toBe('Representatiu');
    });

    it('applies station name normalization', () => {
      const result = transformer.normalizeRecord(makeRawRecord({ nom_estacio: 'Trrega' }));
      expect(result.stationName).toBe('Tàrrega');
    });

    it('handles NaN values', () => {
      const result = transformer.normalizeRecord(makeRawRecord({ valor: 'abc' }));
      expect(result.value).toBeNull();
    });

    it('uses variableNames map for known codes', () => {
      const result = transformer.normalizeRecord(makeRawRecord({
        codi_variable: '1000',
        nom_variable: 'Temperatura mitjana',
        unitat: '°C',
      }));
      expect(result.variableName).toBe('temp_avg');
      expect(result.unit).toBe('°C');
    });

    it('falls back to raw nom_variable for unknown codes', () => {
      const result = transformer.normalizeRecord(makeRawRecord({
        codi_variable: '9999',
        nom_variable: 'Unknown Variable',
      }));
      expect(result.variableName).toBe('Unknown Variable');
    });
  });

  describe('validateRecord', () => {
    it('returns true for valid record', () => {
      const record = transformer.normalizeRecord(makeRawRecord());
      expect(transformer.validateRecord(record)).toBe(true);
    });

    it('returns false when stationName is null', () => {
      const record = transformer.normalizeRecord(makeRawRecord());
      record.stationName = null;
      expect(transformer.validateRecord(record)).toBe(false);
    });

    it('returns false when value is null', () => {
      const record = transformer.normalizeRecord(makeRawRecord({ valor: 'abc' }));
      expect(transformer.validateRecord(record)).toBe(false);
    });
  });

  describe('transform', () => {
    it('throws on non-array input', () => {
      expect(() => transformer.transform(null)).toThrow('Expected array');
    });

    it('filters out invalid records', () => {
      const records = [
        makeRawRecord(),
        makeRawRecord({ nom_estacio: null, valor: 'abc', codi_variable: null }),
      ];
      const result = transformer.transform(records);
      expect(result.records.length).toBeGreaterThanOrEqual(1);
    });

    it('separates precipitation-only records', () => {
      const records = [
        makeRawRecord({ codi_variable: '1300' }),
        makeRawRecord({ id: '2', codi_variable: '1000', valor: '25' }),
        makeRawRecord({ id: '3', codi_variable: '1300', valor: '0' }),
      ];
      const result = transformer.transform(records);
      expect(result.precipitationRecords).toBe(2);
    });

    it('returns envelope with correct metadata', () => {
      const result = transformer.transform([makeRawRecord()]);
      expect(result.metadata.dataType).toBe('precipitation');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('statistics');
    });
  });

  describe('calculateStatistics', () => {
    it('returns zeroed stats for empty array', () => {
      const stats = transformer.calculateStatistics([]);
      expect(stats.totalStations).toBe(0);
      expect(stats.averagePrecipitation).toBe(0);
      expect(stats.totalDaysCovered).toBe(0);
    });

    it('computes correct statistics', () => {
      const records = [
        { stationName: 'Sau', date: '2026-07-11', value: 5 },
        { stationName: 'Sau', date: '2026-07-12', value: 0 },
        { stationName: 'Baells', date: '2026-07-11', value: 10 },
      ];
      const stats = transformer.calculateStatistics(records);
      expect(stats.totalStations).toBe(2);
      expect(parseFloat(stats.averagePrecipitation)).toBeCloseTo(5, 1);
      expect(stats.maxPrecipitation).toBe('10.00');
      expect(stats.minPrecipitation).toBe('0.00');
      expect(stats.daysWithPrecipitation).toBe(2);
    });
  });

  describe('filterPrecipitationOnly', () => {
    it('filters only variable code 1300', () => {
      const records = [
        { variableCode: '1300', value: 5 },
        { variableCode: '1000', value: 25 },
        { variableCode: '1300', value: 0 },
      ];
      expect(transformer.filterPrecipitationOnly(records)).toHaveLength(2);
    });
  });

  describe('getLatestByStation', () => {
    it('returns latest precipitation per station', () => {
      const records = [
        { variableCode: '1300', stationName: 'Sau', date: '2026-07-10', value: 5 },
        { variableCode: '1300', stationName: 'Sau', date: '2026-07-12', value: 8 },
        { variableCode: '1300', stationName: 'Baells', date: '2026-07-11', value: 3 },
      ];
      const result = transformer.getLatestByStation(records);
      expect(result['Sau'].date).toBe('2026-07-12');
      expect(result['Baells'].date).toBe('2026-07-11');
    });
  });

  describe('getAvailableStations', () => {
    it('returns sorted unique station names (precipitation only)', () => {
      const records = [
        { variableCode: '1300', stationName: 'Zebra' },
        { variableCode: '1300', stationName: 'Alpha' },
        { variableCode: '1000', stationName: 'Ignored' },
        { variableCode: '1300', stationName: 'Alpha' },
      ];
      expect(transformer.getAvailableStations(records)).toEqual(['Alpha', 'Zebra']);
    });
  });

  describe('filterByDateRange', () => {
    it('filters records within date range', () => {
      const records = [
        { variableCode: '1300', date: '2026-07-01', value: 5 },
        { variableCode: '1300', date: '2026-07-10', value: 8 },
        { variableCode: '1300', date: '2026-07-15', value: 3 },
      ];
      const result = transformer.filterByDateRange(records, '2026-07-05', '2026-07-12');
      expect(result).toHaveLength(1);
    });
  });
});
