import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import PrecipitationExtractor from '../precipitation.js';

vi.mock('axios');

describe('PrecipitationExtractor', () => {
  let extractor;

  beforeEach(() => {
    vi.clearAllMocks();
    extractor = new PrecipitationExtractor();
  });

  describe('extract', () => {
    it('fetches all precipitation data successfully', async () => {
      const mockData = [
        { nom_estacio: 'Sau', nom_variable: 'Precipitació', data_lectura: '2026-07-10' },
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

  describe('extractPrecipitationOnly', () => {
    it('fetches only variable 1300 records', async () => {
      const mockData = [{ nom_estacio: 'Sau', codi_variable: '1300' }];
      axios.get.mockResolvedValue({ data: mockData });

      const result = await extractor.extractPrecipitationOnly();
      expect(result).toEqual(mockData);
      expect(axios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            $where: expect.stringContaining('1300'),
          }),
        })
      );
    });
  });

  describe('extractAllPrecipitationOnly', () => {
    it('paginates through all records', async () => {
      const page1 = Array.from({ length: 50000 }, (_, i) => ({ codi_variable: '1300', nom_estacio: 'A' }));
      const page2 = [{ codi_variable: '1300', nom_estacio: 'B' }];

      axios.get
        .mockResolvedValueOnce({ data: page1 })
        .mockResolvedValueOnce({ data: page2 });

      const result = await extractor.extractAllPrecipitationOnly(1000);
      expect(result.length).toBe(50001);
      expect(axios.get).toHaveBeenCalledTimes(2);
    });

    it('stops when empty array returned', async () => {
      axios.get.mockResolvedValue({ data: [] });
      const result = await extractor.extractAllPrecipitationOnly(1000);
      expect(result).toEqual([]);
    });

    it('stops when non-array returned', async () => {
      axios.get.mockResolvedValue({ data: null });
      const result = await extractor.extractAllPrecipitationOnly(1000);
      expect(result).toEqual([]);
    });
  });

  describe('extractDateRange', () => {
    it('fetches records within date range', async () => {
      const mockData = [{ data_lectura: '2026-07-01', codi_variable: '1300' }];
      axios.get.mockResolvedValue({ data: mockData });

      const start = new Date('2026-07-01');
      const end = new Date('2026-07-10');
      const result = await extractor.extractDateRange(start, end);
      expect(result).toEqual(mockData);
    });
  });

  describe('getStationsList', () => {
    it('returns sorted station list', async () => {
      axios.get.mockResolvedValue({
        data: [
          { nom_estacio: 'Sau', codi_estacio: 'S01' },
          { nom_estacio: 'Panta', codi_estacio: 'P01' },
          { nom_estacio: null, codi_estacio: null },
        ],
      });

      const result = await extractor.getStationsList();
      expect(result.length).toBe(2);
      expect(result[0].name).toBe('Panta');
      expect(result[1].name).toBe('Sau');
    });
  });

  describe('getVariablesList', () => {
    it('returns sorted variable list', async () => {
      axios.get.mockResolvedValue({
        data: [
          { codi_variable: '1300', nom_variable: 'Precipitació', unitat: 'mm' },
          { codi_variable: '1400', nom_variable: 'Temperatura', unitat: '°C' },
        ],
      });

      const result = await extractor.getVariablesList();
      expect(result.length).toBe(2);
      expect(result[0].codi_variable).toBe('1300');
    });
  });

  describe('extractByStation', () => {
    it('fetches records for specific station and date range', async () => {
      const mockData = [{ nom_estacio: 'Sau', codi_variable: '1300' }];
      axios.get.mockResolvedValue({ data: mockData });

      const start = new Date('2026-07-01');
      const end = new Date('2026-07-10');
      const result = await extractor.extractByStation('Sau', start, end);
      expect(result).toEqual(mockData);
      expect(axios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            $where: expect.stringContaining("nom_estacio = 'Sau'"),
          }),
        })
      );
    });
  });
});
