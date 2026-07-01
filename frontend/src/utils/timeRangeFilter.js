/**
 * Time Range Filtering Utilities
 *
 * Centralized date range calculation for all dashboards.
 * Supports dataset-aware 24h range via latestRecordDate option.
 */

/**
 * Calculate date range for a given time range string.
 * @param {string} timeRange - '24hours' | '30days' | '1year' | '2years' | '5years' | '10years' | 'all'
 * @param {Object} options - { latestRecordDate?: Date } for dataset-aware 24h range
 * @returns {{ startDate: Date, endDate: Date }}
 */
export const calculateDateRange = (timeRange, options = {}) => {
  const endDate = new Date();
  let startDate = new Date();

  switch (timeRange) {
    case '24hours': {
      const latestDate = options.latestRecordDate || endDate;
      startDate = new Date(latestDate);
      startDate.setDate(startDate.getDate() - 1);
      endDate.setTime(new Date(latestDate).getTime());
      endDate.setDate(endDate.getDate() + 1);
      break;
    }
    case '30days':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '1year':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    case '2years':
      startDate.setFullYear(endDate.getFullYear() - 2);
      break;
    case '5years':
      startDate.setFullYear(endDate.getFullYear() - 5);
      break;
    case '10years':
      startDate.setFullYear(endDate.getFullYear() - 10);
      break;
    case 'all':
      startDate = new Date('1988-01-01');
      break;
    default:
      startDate.setDate(endDate.getDate() - 30);
  }

  return { startDate, endDate };
};

/**
 * Find the latest record date across one or more record arrays.
 * @param  {...Array} recordArrays - Arrays of records with .date field
 * @returns {Date|null}
 */
export const findLatestRecordDate = (...recordArrays) => {
  let latest = null;
  for (const records of recordArrays) {
    if (!records || records.length === 0) continue;
    for (const r of records) {
      const t = new Date(r.date).getTime();
      if (!latest || t > latest) latest = t;
    }
  }
  return latest ? new Date(latest) : null;
};

export const TIME_RANGE_OPTIONS = [
  { value: '24hours', label: 'Últim dia disponible' },
  { value: '30days', label: 'Últims 30 dies' },
  { value: '1year', label: 'Últim any' },
  { value: '2years', label: 'Últims 2 anys' },
  { value: '5years', label: 'Últims 5 anys' },
  { value: '10years', label: 'Últims 10 anys' },
  { value: 'all', label: 'Històric complet' },
];

export const BASIC_TIME_RANGE_OPTIONS = [
  { value: '24hours', label: 'Últim dia disponible' },
  { value: '30days', label: 'Últims 30 dies' },
  { value: '1year', label: 'Últim any' },
  { value: '2years', label: 'Últims 2 anys' },
  { value: '5years', label: 'Últims 5 anys' },
];
