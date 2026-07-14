import { describe, it, expect } from 'vitest';
import { config } from '../config.js';

describe('config', () => {
  it('has default Socrata base URL', () => {
    expect(config.socrata.baseUrl).toContain('analisi.transparenciacatalunya.cat');
  });

  it('has valid embassaments API config', () => {
    expect(config.socrata.embassaments.datasetId).toBe('gn9e-3qhr');
    expect(config.socrata.embassaments.apiUrl).toContain('gn9e-3qhr');
  });

  it('has valid precipitation API config', () => {
    expect(config.socrata.precipitation.datasetId).toBe('7bvh-jvq2');
    expect(config.socrata.precipitation.apiUrl).toContain('7bvh-jvq2');
  });

  it('has valid output filenames', () => {
    expect(config.output.embassaments).toBe('embassaments.json');
    expect(config.output.precipitation).toBe('precipitation.json');
    expect(config.output.metadata).toBe('metadata.json');
  });

  it('has valid path definitions', () => {
    expect(config.paths.data).toContain('data');
    expect(config.paths.logs).toContain('logs');
    expect(config.paths.extractors).toContain('extractors');
    expect(config.paths.transformers).toContain('transformers');
    expect(config.paths.loaders).toContain('loaders');
  });

  it('has numeric maxRecords', () => {
    expect(typeof config.socrata.maxRecords).toBe('number');
    expect(config.socrata.maxRecords).toBeGreaterThan(0);
  });

  it('has numeric timeout', () => {
    expect(typeof config.socrata.timeout).toBe('number');
    expect(config.socrata.timeout).toBeGreaterThan(0);
  });
});
