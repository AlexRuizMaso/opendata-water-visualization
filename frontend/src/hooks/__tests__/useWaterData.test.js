import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useWaterData } from '../useWaterData';
import waterDataService from '../../services/waterDataService';

vi.mock('../../services/waterDataService');

describe('useWaterData', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('loads embassaments on mount', async () => {
    const mockEmbassaments = { records: [{ name: 'Sau' }] };
    waterDataService.getEmbassaments.mockResolvedValue(mockEmbassaments);

    const { result } = renderHook(() => useWaterData());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.embassaments).toEqual(mockEmbassaments);
    expect(result.current.error).toBeNull();
  });

  it('loads precipitation when requirePrecipitation=true', async () => {
    waterDataService.getEmbassaments.mockResolvedValue({ records: [] });
    waterDataService.getPrecipitationByRange.mockResolvedValue({ records: [] });

    const { result } = renderHook(() => useWaterData(true, '1year'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(waterDataService.getPrecipitationByRange).toHaveBeenCalled();
    expect(result.current.precipitation).toEqual({ records: [] });
  });

  it('does not load precipitation by default', async () => {
    waterDataService.getEmbassaments.mockResolvedValue({ records: [] });

    const { result } = renderHook(() => useWaterData());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(waterDataService.getPrecipitationByRange).not.toHaveBeenCalled();
  });

  it('sets error state on failure', async () => {
    waterDataService.getEmbassaments.mockRejectedValue(new Error('Fetch failed'));

    const { result } = renderHook(() => useWaterData());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Fetch failed');
  });

  it('precipitation error is non-critical (does not set error state)', async () => {
    waterDataService.getEmbassaments.mockResolvedValue({ records: [] });
    waterDataService.getPrecipitationByRange.mockRejectedValue(new Error('Precipitation failed'));

    const { result } = renderHook(() => useWaterData(true, '1year'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.precipitation).toBeNull();
  });

  it('maps timeRange to correct year range', async () => {
    waterDataService.getEmbassaments.mockResolvedValue({ records: [] });
    waterDataService.getPrecipitationByRange.mockResolvedValue({ records: [] });

    const currentYear = new Date().getFullYear();
    renderHook(() => useWaterData(true, '2years'));

    await waitFor(() => expect(waterDataService.getPrecipitationByRange).toHaveBeenCalled());
    expect(waterDataService.getPrecipitationByRange).toHaveBeenCalledWith(currentYear - 2, currentYear);
  });
});
