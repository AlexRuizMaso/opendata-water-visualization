import { describe, it, expect, vi, beforeEach } from 'vitest';
import ETLPipeline from '../pipeline.js';

vi.mock('../extractors/embassaments.js', () => ({
  default: vi.fn().mockImplementation(() => ({
    extract: vi.fn().mockResolvedValue([{ dia: '2026-07-10', estaci: 'Sau', volum: 80 }]),
    extractAll: vi.fn().mockResolvedValue([{ dia: '2026-07-10', estaci: 'Sau', volum: 80 }]),
  })),
}));

vi.mock('../extractors/precipitation.js', () => ({
  default: vi.fn().mockImplementation(() => ({
    extractPrecipitationOnly: vi.fn().mockResolvedValue([{ nom_estacio: 'Sau', codi_variable: '1300', data_lectura: '2026-07-10', valor: 5 }]),
    extractAllPrecipitationOnly: vi.fn().mockResolvedValue([{ nom_estacio: 'Sau', codi_variable: '1300', data_lectura: '2026-07-10', valor: 5 }]),
  })),
}));

vi.mock('../transformers/embassaments.js', () => ({
  default: vi.fn().mockImplementation(() => ({
    transform: vi.fn().mockReturnValue({
      records: [{ id: 'Sau-2026-07-10', name: 'Sau', date: '2026-07-10', status: 'normal' }],
      statistics: { totalRecords: 1, criticalDams: 0, averageVolumePercentage: 80 },
      metadata: { lastUpdated: '' },
    }),
    calculateStatistics: vi.fn().mockReturnValue({ totalRecords: 1, criticalDams: 0, averageVolumePercentage: 80, warningDams: 0, uniqueEmbassaments: 1 }),
  })),
}));

vi.mock('../transformers/precipitation.js', () => ({
  default: vi.fn().mockImplementation(() => ({
    transform: vi.fn().mockReturnValue({
      records: [{ id: 'Sau-1300-2026-07-10', date: '2026-07-10', variableCode: '1300' }],
      statistics: { totalRecords: 1, totalStations: 1 },
      metadata: { lastUpdated: '' },
    }),
    calculateStatistics: vi.fn().mockReturnValue({ totalRecords: 1, totalStations: 1, totalDays: 1 }),
  })),
}));

vi.mock('../loaders/fileLoader.js', () => ({
  default: vi.fn().mockImplementation(() => ({
    loadEmbassaments: vi.fn().mockReturnValue(null),
    loadPrecipitation: vi.fn().mockReturnValue(null),
    saveEmbassaments: vi.fn(),
    savePrecipitation: vi.fn(),
    savePrecipitationSplitByYear: vi.fn(),
    saveMetadata: vi.fn(),
    cleanOldBackups: vi.fn(),
    getStatistics: vi.fn().mockReturnValue({ mainFiles: 3, backupFiles: 0, totalSizeMB: '1.50' }),
  })),
}));

vi.mock('../utils/healthCheck.js', () => ({
  default: vi.fn().mockImplementation(() => ({
    runFullHealthCheck: vi.fn().mockResolvedValue({ allApisHealthy: true }),
  })),
}));

describe('ETLPipeline', () => {
  let pipeline;

  beforeEach(() => {
    vi.clearAllMocks();
    pipeline = new ETLPipeline();
  });

  describe('constructor', () => {
    it('initializes all components', () => {
      expect(pipeline.healthCheck).toBeDefined();
      expect(pipeline.embassamentExtractor).toBeDefined();
      expect(pipeline.precipitationExtractor).toBeDefined();
      expect(pipeline.embassamentTransformer).toBeDefined();
      expect(pipeline.precipitationTransformer).toBeDefined();
      expect(pipeline.loader).toBeDefined();
    });
  });

  describe('run - daily mode', () => {
    it('completes full pipeline successfully', async () => {
      const result = await pipeline.run(true, false);
      expect(result.success).toBe(true);
      expect(result.duration).toBeDefined();
      expect(result.results.embassamentsExtracted).toBe(1);
      expect(result.results.precipitationExtracted).toBe(1);
    });

    it('saves all data files', async () => {
      await pipeline.run(true, false);
      expect(pipeline.loader.saveEmbassaments).toHaveBeenCalled();
      expect(pipeline.loader.savePrecipitation).toHaveBeenCalled();
      expect(pipeline.loader.saveMetadata).toHaveBeenCalled();
    });

    it('cleans old backups', async () => {
      await pipeline.run(true, false);
      expect(pipeline.loader.cleanOldBackups).toHaveBeenCalledWith(30);
    });
  });

  describe('run - with health check', () => {
    it('runs health check when not skipped', async () => {
      await pipeline.run(false, false);
      expect(pipeline.healthCheck.runFullHealthCheck).toHaveBeenCalled();
    });

    it('skips health check when skipHealthCheck is true', async () => {
      await pipeline.run(true, false);
      expect(pipeline.healthCheck.runFullHealthCheck).not.toHaveBeenCalled();
    });

    it('aborts when APIs are unhealthy', async () => {
      pipeline.healthCheck.runFullHealthCheck.mockResolvedValue({ allApisHealthy: false });
      const result = await pipeline.run(false, false);
      expect(result.success).toBe(false);
      expect(result.error).toContain('unhealthy');
    });
  });

  describe('run - full sync mode', () => {
    it('uses extractAll when fullSync is true', async () => {
      const result = await pipeline.run(true, true);
      expect(result.success).toBe(true);
    });
  });

  describe('run - with existing data', () => {
    it('merges with existing embassaments data', async () => {
      pipeline.loader.loadEmbassaments.mockReturnValue({
        records: [{ id: 'old-record', date: '2025-01-01' }],
      });
      const result = await pipeline.run(true, false);
      expect(result.success).toBe(true);
      expect(pipeline.loader.saveEmbassaments).toHaveBeenCalled();
    });

    it('merges with existing precipitation data', async () => {
      pipeline.loader.loadPrecipitation.mockReturnValue({
        records: [{ id: 'old-precip', date: '2025-01-01' }],
      });
      const result = await pipeline.run(true, false);
      expect(result.success).toBe(true);
      expect(pipeline.loader.savePrecipitation).toHaveBeenCalled();
    });
  });

  describe('runEmbassaments', () => {
    it('runs embassaments-only pipeline', async () => {
      const result = await pipeline.runEmbassaments();
      expect(result.records).toBeDefined();
      expect(pipeline.loader.saveEmbassaments).toHaveBeenCalled();
    });
  });

  describe('runPrecipitation', () => {
    it('runs precipitation-only pipeline', async () => {
      const result = await pipeline.runPrecipitation();
      expect(result.records).toBeDefined();
      expect(pipeline.loader.savePrecipitation).toHaveBeenCalled();
    });
  });

  describe('generateMetadata', () => {
    it('generates metadata with required fields', () => {
      pipeline.startTime = Date.now() - 5000;
      pipeline.endTime = Date.now();
      const metadata = pipeline.generateMetadata(
        { statistics: { totalRecords: 10 } },
        { statistics: { totalRecords: 20 } }
      );
      expect(metadata.timestamp).toBeDefined();
      expect(metadata.pipelineVersion).toBe('1.0');
      expect(metadata.duration).toBeDefined();
      expect(metadata.statistics.embassaments.totalRecords).toBe(10);
      expect(metadata.statistics.precipitation.totalRecords).toBe(20);
    });
  });

  describe('run - error handling', () => {
    it('returns failure result on extraction error', async () => {
      pipeline.embassamentExtractor.extract.mockRejectedValue(new Error('API down'));
      const result = await pipeline.run(true, false);
      expect(result.success).toBe(false);
      expect(result.error).toContain('API down');
    });
  });

  describe('printSummary', () => {
    it('does not throw', () => {
      pipeline.startTime = Date.now() - 1000;
      pipeline.endTime = Date.now();
      pipeline.results = { embassamentsExtracted: 10, precipitationExtracted: 20, embassamentsSavedTotal: 10, precipitationSavedTotal: 20, precipitationArchivedTotal: 20 };
      expect(() => pipeline.printSummary()).not.toThrow();
    });
  });
});
