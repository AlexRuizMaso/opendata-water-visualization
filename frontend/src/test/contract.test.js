import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const projectRoot = join(import.meta.dirname, '..', '..', '..');

function loadJSON(relativePath) {
  const fullPath = join(projectRoot, relativePath);
  return JSON.parse(readFileSync(fullPath, 'utf8'));
}

describe('ETL → Frontend Contract Validation', () => {
  describe('embassaments.json contract', () => {
    let data;
    try {
      data = loadJSON('etl/data/embassaments.json');
    } catch {
      it.skip('embassaments.json not found (run ETL first)', () => {});
      return;
    }

    it('has required top-level fields', () => {
      expect(data).toHaveProperty('records');
      expect(data).toHaveProperty('statistics');
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('metadata');
    });

    it('each record has required fields for frontend consumption', () => {
      const requiredFields = ['id', 'name', 'date', 'absoluteLevel', 'volumePercentage', 'volumeHm3', 'location', 'status'];
      data.records.slice(0, 10).forEach(record => {
        requiredFields.forEach(field => {
          expect(record).toHaveProperty(field);
        });
      });
    });

    it('location has lat/lng', () => {
      data.records.slice(0, 10).forEach(record => {
        expect(record.location).toHaveProperty('lat');
        expect(record.location).toHaveProperty('lng');
      });
    });

    it('status is one of the expected values', () => {
      const validStatuses = ['critical', 'warning', 'normal', 'optimal'];
      data.records.slice(0, 100).forEach(record => {
        expect(validStatuses).toContain(record.status);
      });
    });

    it('statistics has fields used by dashboards', () => {
      expect(data.statistics).toHaveProperty('averageVolumePercentage');
      expect(data.statistics).toHaveProperty('uniqueEmbassaments');
      expect(data.statistics).toHaveProperty('criticalDams');
    });
  });

  describe('precipitation.json contract', () => {
    let data;
    try {
      data = loadJSON('etl/data/precipitation.json');
    } catch {
      it.skip('precipitation.json not found (run ETL first)', () => {});
      return;
    }

    it('has required top-level fields', () => {
      expect(data).toHaveProperty('records');
      expect(data).toHaveProperty('statistics');
      expect(data).toHaveProperty('timestamp');
    });

    it('each record has fields used by frontend', () => {
      const requiredFields = ['id', 'stationName', 'date', 'variableCode', 'value', 'unit'];
      data.records.slice(0, 10).forEach(record => {
        requiredFields.forEach(field => {
          expect(record).toHaveProperty(field);
        });
      });
    });

    it('stationName is normalized (no truncated accents)', () => {
      const knownTruncated = ['Alcarrs', 'Trrega', 'Puigcerd'];
      data.records.slice(0, 100).forEach(record => {
        expect(knownTruncated).not.toContain(record.stationName);
      });
    });
  });

  describe('stationNameMap sync contract', () => {
    it('frontend and ETL stationNameMap exports match', () => {
      const frontendSrc = readFileSync(join(projectRoot, 'frontend/src/utils/stationNameMap.js'), 'utf8');
      const etlSrc = readFileSync(join(projectRoot, 'etl/src/utils/stationNameMap.js'), 'utf8');

      const extractEntries = (src) => {
        const matches = src.match(/'([^']+)':\s*'([^']+)'/g) || [];
        return matches.map(m => {
          const [, key, val] = m.match(/'([^']+)':\s*'([^']+)'/);
          return `${key}→${val}`;
        }).sort();
      };

      const frontendEntries = extractEntries(frontendSrc);
      const etlEntries = extractEntries(etlSrc);

      expect(frontendEntries).toEqual(etlEntries);
      expect(frontendEntries.length).toBeGreaterThan(0);
    });
  });
});
