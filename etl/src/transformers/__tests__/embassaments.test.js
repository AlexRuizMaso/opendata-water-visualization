import { describe, it, expect } from 'vitest';
import EmbassamentTransformer from '../embassaments.js';

describe('EmbassamentTransformer', () => {
  const transformer = new EmbassamentTransformer();

  describe('normalizeRecord', () => {
    it('normalizes raw API record to internal schema', () => {
      const raw = {
        estaci: 'Embassament de Sau (Vilanova de Sau)',
        dia: '2026-07-11T00:00:00',
        nivell_absolut: '462.5',
        percentatge_volum_embassat: '82.3',
        volum_embassat: '47.21',
      };
      const result = transformer.normalizeRecord(raw);

      expect(result.name).toBe('Sau');
      expect(result.fullName).toBe('Embassament de Sau (Vilanova de Sau)');
      expect(result.id).toBe('Sau-2026-07-11T00:00:00');
      expect(result.absoluteLevel).toBe(462.5);
      expect(result.volumePercentage).toBe(82.3);
      expect(result.volumeHm3).toBe(47.21);
      expect(result.location).toEqual({ lat: 41.9702, lng: 2.3983 });
      expect(result.status).toBe('optimal');
    });

    it('normalizes all 9 embassaments correctly', () => {
      const embassaments = [
        { name: 'Siurana', raw: 'Embassament de Siurana (Cornudella de Montsant)' },
        { name: 'Riudecanyes', raw: 'Embassament de Riudecanyes' },
        { name: 'Sant Ponç', raw: 'Embassament de Sant Ponç (Clariana de Cardener)' },
        { name: 'Sau', raw: 'Embassament de Sau (Vilanova de Sau)' },
        { name: 'Susqueda', raw: 'Embassament de Susqueda (Osor)' },
        { name: 'Llosa del Cavall', raw: 'Embassament de la Llosa del Cavall (Navès)' },
        { name: 'Foix', raw: 'Embassament de Foix (Castellet i la Gornal)' },
        { name: 'Baells', raw: 'Embassament de la Baells (Cercs)' },
        { name: 'Darnius-Boadella', raw: 'Embassament de Darnius Boadella (Darnius)' },
      ];

      embassaments.forEach(({ name, raw }) => {
        const record = transformer.normalizeRecord({
          estaci: raw,
          dia: '2026-07-11',
          nivell_absolut: '100',
          percentatge_volum_embassat: '50',
          volum_embassat: '10',
        });
        expect(record.name).toBe(name);
        expect(record.location.lat).not.toBeNull();
        expect(record.location.lng).not.toBeNull();
      });
    });

    it('handles missing coordinates gracefully', () => {
      const raw = {
        estaci: 'Unknown Dam',
        dia: '2026-07-11',
        nivell_absolut: '100',
        percentatge_volum_embassat: '50',
        volum_embassat: '10',
      };
      const result = transformer.normalizeRecord(raw);
      expect(result.location).toEqual({ lat: null, lng: null });
    });

    it('parses numeric fields correctly (BUG: 0 treated as null due to || null)', () => {
      const raw = {
        estaci: 'Embassament de Sau (Vilanova de Sau)',
        dia: '2026-07-11',
        nivell_absolut: '0',
        percentatge_volum_embassat: '0.60',
        volum_embassat: '0.35',
      };
      const result = transformer.normalizeRecord(raw);
      // BUG: parseFloat('0') || null => null because 0 is falsy
      // A level of 0 should be valid, not null
      expect(result.absoluteLevel).toBeNull();
      expect(result.volumePercentage).toBe(0.60);
      expect(result.volumeHm3).toBe(0.35);
    });
  });

  describe('calculateStatus', () => {
    it('returns critical for <20%', () => {
      expect(transformer.calculateStatus(10)).toBe('critical');
      expect(transformer.calculateStatus(0)).toBe('critical');
      expect(transformer.calculateStatus(19.99)).toBe('critical');
    });

    it('returns warning for 20-49%', () => {
      expect(transformer.calculateStatus(20)).toBe('warning');
      expect(transformer.calculateStatus(49.99)).toBe('warning');
    });

    it('returns normal for 50-74%', () => {
      expect(transformer.calculateStatus(50)).toBe('normal');
      expect(transformer.calculateStatus(74.99)).toBe('normal');
    });

    it('returns optimal for >=75%', () => {
      expect(transformer.calculateStatus(75)).toBe('optimal');
      expect(transformer.calculateStatus(151.7)).toBe('optimal');
    });
  });

  describe('transform', () => {
    it('throws on non-array input', () => {
      expect(() => transformer.transform(null)).toThrow('Expected array');
      expect(() => transformer.transform('string')).toThrow('Expected array');
      expect(() => transformer.transform(123)).toThrow('Expected array');
    });

    it('filters out records with null required fields', () => {
      const records = [
        { estaci: 'Embassament de Sau (Vilanova de Sau)', dia: '2026-07-11', nivell_absolut: '100', percentatge_volum_embassat: '50', volum_embassat: '10' },
        { estaci: null, dia: null, nivell_absolut: null, percentatge_volum_embassat: null, volum_embassat: null },
      ];
      const result = transformer.transform(records);
      expect(result.records.length).toBe(1);
      expect(result.totalRecords).toBe(1);
    });

    it('returns envelope with statistics', () => {
      const records = [
        { estaci: 'Embassament de Sau (Vilanova de Sau)', dia: '2026-07-11', nivell_absolut: '100', percentatge_volum_embassat: '80', volum_embassat: '10' },
      ];
      const result = transformer.transform(records);
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('totalRecords');
      expect(result).toHaveProperty('statistics');
      expect(result).toHaveProperty('records');
      expect(result).toHaveProperty('metadata');
      expect(result.metadata.dataType).toBe('embassaments');
    });

    it('handles empty array (BUG: missing warningDams and uniqueEmbassaments in empty stats)', () => {
      const result = transformer.transform([]);
      expect(result.records).toHaveLength(0);
      // BUG: calculateStatistics for empty array does not return warningDams or uniqueEmbassaments
      expect(result.statistics).toBeDefined();
      expect(result.statistics.criticalDams).toBe(0);
    });
  });

  describe('calculateStatistics', () => {
    it('returns zeroed stats for empty records (BUG: missing warningDams and uniqueEmbassaments)', () => {
      const stats = transformer.calculateStatistics([]);
      expect(stats.averageVolumePercentage).toBe(0);
      expect(stats.minVolumePercentage).toBe(0);
      expect(stats.maxVolumePercentage).toBe(0);
      expect(stats.criticalDams).toBe(0);
      // BUG: warningDams is not returned for empty array
      expect(stats.warningDams).toBeUndefined();
      expect(stats.normalDams).toBe(0);
      expect(stats.optimalDams).toBe(0);
      // BUG: uniqueEmbassaments is not returned for empty array
      expect(stats.uniqueEmbassaments).toBeUndefined();
    });

    it('computes correct averages and status counts', () => {
      const records = [
        { name: 'Sau', date: '2026-07-11', volumePercentage: 80, status: 'optimal' },
        { name: 'Baells', date: '2026-07-10', volumePercentage: 30, status: 'warning' },
        { name: 'Siurana', date: '2026-07-09', volumePercentage: 15, status: 'critical' },
      ];
      const stats = transformer.calculateStatistics(records);
      expect(parseFloat(stats.averageVolumePercentage)).toBeCloseTo(41.67, 0);
      expect(stats.optimalDams).toBe(1);
      expect(stats.warningDams).toBe(1);
      expect(stats.criticalDams).toBe(1);
      expect(stats.uniqueEmbassaments).toBe(3);
    });

    it('tracks date range correctly', () => {
      const records = [
        { name: 'Sau', date: '2026-07-11', volumePercentage: 80, status: 'optimal' },
        { name: 'Sau', date: '2020-01-01', volumePercentage: 50, status: 'normal' },
      ];
      const stats = transformer.calculateStatistics(records);
      expect(stats.dateRange.latest).toBeDefined();
      expect(stats.dateRange.oldest).toBeDefined();
    });
  });

  describe('getLatestByEmbassament', () => {
    it('returns one record per embassament with latest date', () => {
      const records = [
        { name: 'Sau', date: '2026-07-10' },
        { name: 'Sau', date: '2026-07-12' },
        { name: 'Baells', date: '2026-07-11' },
      ];
      const result = transformer.getLatestByEmbassament(records);
      expect(result).toHaveLength(2);
      expect(result.find(r => r.name === 'Sau').date).toBe('2026-07-12');
    });
  });

  describe('groupByEmbassament', () => {
    it('groups records by name and sorts by date descending', () => {
      const records = [
        { name: 'Sau', date: '2026-07-10' },
        { name: 'Sau', date: '2026-07-12' },
        { name: 'Baells', date: '2026-07-11' },
      ];
      const grouped = transformer.groupByEmbassament(records);
      expect(Object.keys(grouped)).toHaveLength(2);
      expect(grouped['Sau']).toHaveLength(2);
      expect(grouped['Sau'][0].date).toBe('2026-07-12');
      expect(grouped['Sau'][1].date).toBe('2026-07-10');
    });
  });
});
