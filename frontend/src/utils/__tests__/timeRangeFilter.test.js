import { describe, it, expect, vi, afterEach } from 'vitest';
import { calculateDateRange, findLatestRecordDate, TIME_RANGE_OPTIONS, BASIC_TIME_RANGE_OPTIONS } from '../timeRangeFilter';

describe('calculateDateRange', () => {
  afterEach(() => { vi.useRealTimers(); });

  it('calculates 30days range from now', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-14T12:00:00Z'));

    const { startDate, endDate } = calculateDateRange('30days');
    expect(endDate.toISOString().split('T')[0]).toBe('2026-07-14');
    expect(startDate.toISOString().split('T')[0]).toBe('2026-06-14');
  });

  it('calculates 1year range', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-14T12:00:00Z'));

    const { startDate } = calculateDateRange('1year');
    expect(startDate.getFullYear()).toBe(2025);
  });

  it('calculates 2years range', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-14T12:00:00Z'));

    const { startDate } = calculateDateRange('2years');
    expect(startDate.getFullYear()).toBe(2024);
  });

  it('calculates 5years range', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-14T12:00:00Z'));

    const { startDate } = calculateDateRange('5years');
    expect(startDate.getFullYear()).toBe(2021);
  });

  it('calculates 10years range', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-14T12:00:00Z'));

    const { startDate } = calculateDateRange('10years');
    expect(startDate.getFullYear()).toBe(2016);
  });

  it('calculates all range from 1988', () => {
    const { startDate } = calculateDateRange('all');
    expect(startDate.toISOString().split('T')[0]).toBe('1988-01-01');
  });

  it('uses latestRecordDate for 24hours range', () => {
    const latestDate = new Date('2026-07-10T00:00:00Z');
    const { startDate, endDate } = calculateDateRange('24hours', { latestRecordDate: latestDate });
    expect(startDate.toISOString().split('T')[0]).toBe('2026-07-09');
    expect(endDate.toISOString().split('T')[0]).toBe('2026-07-11');
  });

  it('defaults to 30days for unknown range', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-14T12:00:00Z'));

    const { startDate, endDate } = calculateDateRange('unknown');
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeCloseTo(30, 0);
  });

  it('24hours uses current date when no latestRecordDate', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-14T12:00:00Z'));

    const { startDate, endDate } = calculateDateRange('24hours');
    expect(startDate.toISOString().split('T')[0]).toBe('2026-07-13');
    expect(endDate.toISOString().split('T')[0]).toBe('2026-07-15');
  });
});

describe('findLatestRecordDate', () => {
  it('returns the most recent date across multiple arrays', () => {
    const arr1 = [{ date: '2026-07-10' }, { date: '2026-07-08' }];
    const arr2 = [{ date: '2026-07-12' }];
    const result = findLatestRecordDate(arr1, arr2);
    expect(result.toISOString().split('T')[0]).toBe('2026-07-12');
  });

  it('returns null for empty arrays', () => {
    expect(findLatestRecordDate([], [])).toBeNull();
  });

  it('handles null arrays gracefully', () => {
    const arr = [{ date: '2026-07-10' }];
    const result = findLatestRecordDate(null, arr, undefined);
    expect(result).toBeTruthy();
    expect(result.toISOString().split('T')[0]).toBe('2026-07-10');
  });

  it('returns null for single empty array', () => {
    expect(findLatestRecordDate([])).toBeNull();
  });

  it('handles single record', () => {
    const result = findLatestRecordDate([{ date: '2026-01-01' }]);
    expect(result.toISOString().split('T')[0]).toBe('2026-01-01');
  });
});

describe('TIME_RANGE_OPTIONS', () => {
  it('has 7 options', () => {
    expect(TIME_RANGE_OPTIONS).toHaveLength(7);
  });

  it('each option has value and label', () => {
    TIME_RANGE_OPTIONS.forEach(opt => {
      expect(opt).toHaveProperty('value');
      expect(opt).toHaveProperty('label');
    });
  });
});

describe('BASIC_TIME_RANGE_OPTIONS', () => {
  it('has 5 options', () => {
    expect(BASIC_TIME_RANGE_OPTIONS).toHaveLength(5);
  });
});
