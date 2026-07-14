import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import EmbassamentExtractor from '../embassaments.js';

vi.mock('axios');

describe('EmbassamentExtractor', () => {
  let extractor;

  beforeEach(() => {
    vi.clearAllMocks();
    extractor = new EmbassamentExtractor();
  });

  describe('buildQuery', () => {
    it('returns default query with limit 1000', () => {
      const q = extractor.buildQuery();
      expect(q).toContain('$order=dia DESC');
      expect(q).toContain('$limit=1000');
      expect(q).toContain('$offset=0');
    });

    it('accepts custom limit and offset', () => {
      const q = extractor.buildQuery(500, 100);
      expect(q).toContain('$limit=500');
      expect(q).toContain('$offset=100');
    });
  });

  describe('extract', () => {
    it('fetches embassaments data successfully', async () => {
      const mockData = [
        { dia: '2026-07-10', estaci: 'Pantà de Sau' },
        { dia: '2026-07-09', estaci: 'Pantà de Sau' },
      ];
      axios.get.mockResolvedValue({ data: mockData });

      const result = await extractor.extract();
      expect(result).toEqual(mockData);
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('throws on network error', async () => {
      axios.get.mockRejectedValue(new Error('Network Error'));
      await expect(extractor.extract()).rejects.toThrow('Network Error');
    });

    it('logs 404 specific message', async () => {
      const error = { response: { status: 404 }, message: 'Not Found' };
      axios.get.mockRejectedValue(error);
      await expect(extractor.extract()).rejects.toThrow();
    });

    it('logs timeout specific message', async () => {
      const error = { code: 'ECONNABORTED', message: 'timeout' };
      axios.get.mockRejectedValue(error);
      await expect(extractor.extract()).rejects.toThrow();
    });
  });

  describe('extractAll', () => {
    it('paginates through all records', async () => {
      const page1 = Array.from({ length: 50000 }, (_, i) => ({ dia: `2026-01-${String(i % 28 + 1).padStart(2, '0')}`, estaci: 'A' }));
      const page2 = [{ dia: '2025-12-01', estaci: 'B' }];

      axios.get
        .mockResolvedValueOnce({ data: page1 })
        .mockResolvedValueOnce({ data: page2 });

      const result = await extractor.extractAll(1000);
      expect(result.length).toBe(50001);
      expect(axios.get).toHaveBeenCalledTimes(2);
    });

    it('stops when empty array returned', async () => {
      axios.get.mockResolvedValue({ data: [] });
      const result = await extractor.extractAll(1000);
      expect(result).toEqual([]);
    });

    it('stops when non-array returned', async () => {
      axios.get.mockResolvedValue({ data: null });
      const result = await extractor.extractAll(1000);
      expect(result).toEqual([]);
    });
  });

  describe('extractLatest', () => {
    it('returns only latest record per embassament', async () => {
      const mockData = [
        { estaci: 'Sau', dia: '2026-07-10', level: 90 },
        { estaci: 'Sau', dia: '2026-07-09', level: 88 },
        { estaci: 'Panta', dia: '2026-07-10', level: 75 },
      ];
      axios.get.mockResolvedValue({ data: mockData });

      const result = await extractor.extractLatest();
      expect(result.length).toBe(2);
      expect(result.find(r => r.estaci === 'Sau').dia).toBe('2026-07-10');
    });
  });

  describe('extractDateRange', () => {
    it('fetches records within date range', async () => {
      const mockData = [{ dia: '2026-07-01', estaci: 'Sau' }];
      axios.get.mockResolvedValue({ data: mockData });

      const start = new Date('2026-07-01');
      const end = new Date('2026-07-10');
      const result = await extractor.extractDateRange(start, end);
      expect(result).toEqual(mockData);
      expect(axios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            $where: expect.stringContaining('dia >='),
          }),
        })
      );
    });
  });

  describe('getEmbassamentsList', () => {
    it('returns sorted unique embassament names', async () => {
      // API uses DISTINCT server-side, so mock returns already-distinct results
      axios.get.mockResolvedValue({
        data: [{ estaci: 'Sau' }, { estaci: 'Panta' }, { estaci: null }],
      });

      const result = await extractor.getEmbassamentsList();
      expect(result.length).toBe(2);
      expect(result).toContain('Panta');
      expect(result).toContain('Sau');
      expect(result).toEqual(['Panta', 'Sau']);
    });
  });
});
