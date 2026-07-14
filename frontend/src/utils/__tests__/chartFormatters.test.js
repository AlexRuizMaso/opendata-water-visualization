import { describe, it, expect } from 'vitest';
import { formatValue, tooltipFormatter, calcAverage, calcTotal } from '../chartFormatters';

describe('formatValue', () => {
  it('formats occupancy with 1 decimal and %', () => {
    expect(formatValue(75.43, 'occupancy')).toBe('75.4 %');
  });

  it('formats precipitation with 1 decimal and mm', () => {
    expect(formatValue(12.567, 'precipitation')).toBe('12.6 mm');
  });

  it('formats level with 2 decimals and m', () => {
    expect(formatValue(481.5, 'level')).toBe('481.50 m');
  });

  it('formats volume with 2 decimals and hm³', () => {
    expect(formatValue(9.1, 'volume')).toBe('9.10 hm³');
  });

  it('returns N/A for null', () => {
    expect(formatValue(null, 'occupancy')).toBe('N/A');
  });

  it('returns N/A for undefined', () => {
    expect(formatValue(undefined, 'precipitation')).toBe('N/A');
  });

  it('returns N/A for NaN', () => {
    expect(formatValue(NaN, 'level')).toBe('N/A');
  });

  it('returns raw value for unknown type', () => {
    expect(formatValue(42, 'unknown')).toBe('42');
  });

  it('handles zero value correctly', () => {
    expect(formatValue(0, 'occupancy')).toBe('0.0 %');
  });

  it('handles negative values', () => {
    expect(formatValue(-5.5, 'precipitation')).toBe('-5.5 mm');
  });
});

describe('tooltipFormatter', () => {
  it('detects precipitation from name containing "Precipitaci"', () => {
    expect(tooltipFormatter(5.2, 'Precipitació acumulada')).toBe('5.2 mm');
  });

  it('detects occupancy from name containing "Ocupaci"', () => {
    expect(tooltipFormatter(65.3, 'Ocupació (%)')).toBe('65.3 %');
  });

  it('detects level from name containing "Nivell"', () => {
    expect(tooltipFormatter(481.5, 'Nivell absolut')).toBe('481.50 m');
  });

  it('detects volume from name containing "Volum"', () => {
    expect(tooltipFormatter(9.1, 'Volum embassat')).toBe('9.10 hm³');
  });

  it('returns raw value for unrecognized name', () => {
    expect(tooltipFormatter(42, 'Unknown Series')).toBe('42');
  });

  it('returns N/A for null value', () => {
    expect(tooltipFormatter(null, 'Precipitació')).toBe('N/A');
  });

  it('returns N/A for undefined value', () => {
    expect(tooltipFormatter(undefined, 'Ocupació')).toBe('N/A');
  });
});

describe('calcAverage', () => {
  it('calculates average of valid values', () => {
    const records = [{ v: 10 }, { v: 20 }, { v: 30 }];
    expect(calcAverage(records, d => d.v)).toBe(20);
  });

  it('filters out null/undefined values', () => {
    const records = [{ v: 10 }, { v: null }, { v: 30 }];
    expect(calcAverage(records, d => d.v)).toBe(20);
  });

  it('returns null for empty array', () => {
    expect(calcAverage([], d => d.v)).toBeNull();
  });

  it('returns null when all values are null', () => {
    const records = [{ v: null }, { v: undefined }];
    expect(calcAverage(records, d => d.v)).toBeNull();
  });

  it('handles single element', () => {
    expect(calcAverage([{ v: 42 }], d => d.v)).toBe(42);
  });

  it('handles decimal values', () => {
    const records = [{ v: 1.5 }, { v: 2.5 }];
    expect(calcAverage(records, d => d.v)).toBe(2);
  });
});

describe('calcTotal', () => {
  it('sums all valid values', () => {
    const records = [{ v: 10 }, { v: 20 }, { v: 30 }];
    expect(calcTotal(records, d => d.v)).toBe(60);
  });

  it('ignores null values', () => {
    const records = [{ v: 10 }, { v: null }, { v: 30 }];
    expect(calcTotal(records, d => d.v)).toBe(40);
  });

  it('returns 0 for empty array', () => {
    expect(calcTotal([], d => d.v)).toBe(0);
  });

  it('returns 0 when all values are null', () => {
    const records = [{ v: null }, { v: undefined }];
    expect(calcTotal(records, d => d.v)).toBe(0);
  });
});
