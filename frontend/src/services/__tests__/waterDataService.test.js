import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { waterDataService } from '../waterDataService';

vi.mock('axios');

describe('waterDataService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('getEmbassaments', () => {
    it('fetches and returns embassaments data', async () => {
      const mockData = { records: [{ name: 'Sau' }] };
      axios.get.mockResolvedValue({ data: mockData });

      const result = await waterDataService.getEmbassaments();
      expect(result).toEqual(mockData);
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('embassaments.json'));
    });

    it('throws on API error', async () => {
      axios.get.mockRejectedValue(new Error('Network Error'));
      await expect(waterDataService.getEmbassaments()).rejects.toThrow('Network Error');
    });
  });

  describe('getPrecipitation', () => {
    it('normalizes station names in records', async () => {
      const mockData = { records: [{ stationName: 'Alcarrs' }] };
      axios.get.mockResolvedValue({ data: mockData });

      const result = await waterDataService.getPrecipitation();
      expect(result.records[0].stationName).toBe('Alcarràs');
    });

    it('handles data without records field', async () => {
      axios.get.mockResolvedValue({ data: {} });
      const result = await waterDataService.getPrecipitation();
      expect(result).toEqual({});
    });
  });

  describe('getPrecipitationByYear', () => {
    it('caches results for same year', async () => {
      const mockData = { records: [] };
      axios.get.mockResolvedValue({ data: mockData });

      await waterDataService.getPrecipitationByYear(9999);
      await waterDataService.getPrecipitationByYear(9999);
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('fetches different years separately', async () => {
      axios.get.mockResolvedValue({ data: { records: [] } });

      await waterDataService.getPrecipitationByYear(1990);
      await waterDataService.getPrecipitationByYear(1991);
      expect(axios.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('getPrecipitationByRange', () => {
    it('fetches multiple years and merges records', async () => {
      axios.get
        .mockResolvedValueOnce({ data: { records: [{ date: '1988-01-01' }] } })
        .mockResolvedValueOnce({ data: { records: [{ date: '1989-01-01' }] } });

      const result = await waterDataService.getPrecipitationByRange(1988, 1989);
      expect(result.records).toHaveLength(2);
      expect(result.statistics.totalStations).toBeDefined();
    });
  });

  describe('getAvailableYears', () => {
    it('returns years from 1988 to current year', () => {
      const years = waterDataService.getAvailableYears();
      expect(years[0]).toBe(1988);
      expect(years[years.length - 1]).toBe(new Date().getFullYear());
    });
  });

  describe('getLatestEmbassaments', () => {
    it('returns only the most recent record per embassament', () => {
      const records = [
        { name: 'Sau', date: '2026-07-10', volumePercentage: 80 },
        { name: 'Sau', date: '2026-07-12', volumePercentage: 82 },
        { name: 'Baells', date: '2026-07-11', volumePercentage: 45 },
      ];
      const result = waterDataService.getLatestEmbassaments(records);
      expect(result).toHaveLength(2);
      expect(result.find(r => r.name === 'Sau').date).toBe('2026-07-12');
    });

    it('returns empty array for empty input', () => {
      expect(waterDataService.getLatestEmbassaments([])).toEqual([]);
    });
  });

  describe('filterEmbassamentsByDateRange', () => {
    it('filters records within date range inclusive', () => {
      const records = [
        { date: '2026-07-01' },
        { date: '2026-07-10' },
        { date: '2026-07-15' },
      ];
      const result = waterDataService.filterEmbassamentsByDateRange(
        records, '2026-07-05', '2026-07-12'
      );
      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2026-07-10');
    });

    it('returns all records when range covers everything', () => {
      const records = [{ date: '2026-07-01' }, { date: '2026-07-15' }];
      const result = waterDataService.filterEmbassamentsByDateRange(
        records, '2026-01-01', '2026-12-31'
      );
      expect(result).toHaveLength(2);
    });
  });

  describe('filterPrecipitationByDateRange', () => {
    it('filters precipitation records by date', () => {
      const records = [
        { date: '2026-07-01' },
        { date: '2026-07-10' },
      ];
      const result = waterDataService.filterPrecipitationByDateRange(
        records, '2026-07-05', '2026-07-12'
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('getAvailableStations', () => {
    it('returns sorted unique station names', () => {
      const data = {
        records: [
          { stationName: 'Zebra' },
          { stationName: 'Alcarrs' },
          { stationName: 'Zebra' },
        ],
      };
      const result = waterDataService.getAvailableStations(data);
      expect(result).toEqual(['Alcarràs', 'Zebra']);
    });

    it('returns empty array for null data', () => {
      expect(waterDataService.getAvailableStations(null)).toEqual([]);
    });

    it('returns empty array for data without records', () => {
      expect(waterDataService.getAvailableStations({})).toEqual([]);
    });
  });

  describe('getStatusColor', () => {
    it('returns red for <20%', () => {
      expect(waterDataService.getStatusColor(15)).toBe('#FF4444');
    });
    it('returns orange for <50%', () => {
      expect(waterDataService.getStatusColor(35)).toBe('#FFB700');
    });
    it('returns light green for <75%', () => {
      expect(waterDataService.getStatusColor(60)).toBe('#44AA44');
    });
    it('returns dark green for >=75%', () => {
      expect(waterDataService.getStatusColor(80)).toBe('#1E7E1E');
    });
    it('returns dark green for exactly 75%', () => {
      expect(waterDataService.getStatusColor(75)).toBe('#1E7E1E');
    });
    it('returns red for exactly 0%', () => {
      expect(waterDataService.getStatusColor(0)).toBe('#FF4444');
    });
  });
});
