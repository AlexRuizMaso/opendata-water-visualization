/**
 * Chart Value Formatting Utilities
 *
 * Centralized formatting for chart values, tooltips, and statistics.
 * Uses a data-driven approach: each metric type has a configuration
 * object that defines decimals and unit.
 */

const VALUE_FORMATS = {
  occupancy: { decimals: 1, unit: '%' },
  precipitation: { decimals: 1, unit: 'mm' },
  level: { decimals: 2, unit: 'm' },
  volume: { decimals: 2, unit: 'hm\u00B3' },
};

/**
 * Format a numeric value with its corresponding unit.
 * @param {number|null|undefined} value - The numeric value to format.
 * @param {string} type - Key into VALUE_FORMATS (e.g. 'precipitation').
 * @returns {string} Formatted string, or 'N/A' if value is missing.
 */
export const formatValue = (value, type) => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  const fmt = VALUE_FORMATS[type];
  if (!fmt) return `${value}`;
  return `${value.toFixed(fmt.decimals)} ${fmt.unit}`;
};

/**
 * Recharts Tooltip formatter.
 * Distinguishes series by the `name` parameter that Recharts passes
 * from each <Line> / <Bar> `name` prop.
 * @param {number} value - The data point value.
 * @param {string} name  - The series name (from the `name` prop).
 * @returns {string} Formatted value with unit.
 */
export const tooltipFormatter = (value, name) => {
  if (value === undefined || value === null) return 'N/A';

  if (name.includes('Precipitaci')) return formatValue(value, 'precipitation');
  if (name.includes('Ocupaci'))   return formatValue(value, 'occupancy');
  if (name.includes('Nivell'))    return formatValue(value, 'level');
  if (name.includes('Volum'))     return formatValue(value, 'volume');

  return `${value}`;
};

/**
 * Calculate the average of a metric across an array of records.
 * Filters out undefined/null values before averaging.
 * @param {Array} records - Array of data objects.
 * @param {Function} getValue - Accessor: (record) => number|undefined.
 * @returns {number|null} Average, or null if no valid values.
 */
export const calcAverage = (records, getValue) => {
  const valid = records.filter(d => getValue(d) !== undefined && getValue(d) !== null);
  if (valid.length === 0) return null;
  return valid.reduce((sum, d) => sum + (getValue(d) || 0), 0) / valid.length;
};

/**
 * Calculate the total (sum) of a metric across an array of records.
 * @param {Array} records - Array of data objects.
 * @param {Function} getValue - Accessor: (record) => number|undefined.
 * @returns {number} Sum of all values (missing values treated as 0).
 */
export const calcTotal = (records, getValue) => {
  return records
    .filter(d => getValue(d) !== undefined && getValue(d) !== null)
    .reduce((sum, d) => sum + (getValue(d) || 0), 0);
};
