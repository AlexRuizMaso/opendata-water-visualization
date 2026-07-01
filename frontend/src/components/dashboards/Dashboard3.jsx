import React, { useState, useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import useWaterData from '../../hooks/useWaterData';
import waterDataService from '../../services/waterDataService';
import { tooltipFormatter, formatValue, calcAverage, calcTotal } from '../../utils/chartFormatters';
import { calculateDateRange, findLatestRecordDate } from '../../utils/timeRangeFilter';
import styles from './Dashboard3.module.scss';

/**
 * Dashboard 3: Climate-Water Correlation
 * Shows relationship between precipitation and embassament levels
 * Features: dual-axis chart, embassament/station selectors, date range filtering
 */
const Dashboard3 = () => {
  const { embassaments, precipitation, loading, error } = useWaterData(true);
  const [selectedEmbassament, setSelectedEmbassament] = useState('Sau');
  const [selectedStation, setSelectedStation] = useState('');
  const [timeRange, setTimeRange] = useState('30days');

  const chartData = useMemo(() => {
    if (!embassaments?.records || !precipitation?.records) return [];

    const latestDate = findLatestRecordDate(embassaments.records, precipitation.records);
    const { startDate, endDate } = calculateDateRange(timeRange, {
      latestRecordDate: latestDate,
    });

    let filteredEmbassaments = waterDataService.filterEmbassamentsByDateRange(
      embassaments.records.filter(r => r.name === selectedEmbassament),
      startDate,
      endDate
    );

    let filteredPrecipitation = waterDataService.filterPrecipitationByDateRange(
      precipitation.records,
      startDate,
      endDate
    );

    if (selectedStation) {
      filteredPrecipitation = filteredPrecipitation.filter(
        r => r.stationName === selectedStation
      );
    } else if (filteredPrecipitation.length > 0) {
      const stationsByDate = {};
      filteredPrecipitation.forEach(r => {
        if (!stationsByDate[r.date]) {
          stationsByDate[r.date] = r;
        }
      });
      filteredPrecipitation = Object.values(stationsByDate);
    }

    const groupedByDate = {};

    filteredEmbassaments.forEach(record => {
      const dateKey = new Date(record.date).toISOString().split('T')[0];
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = {};
      }
      groupedByDate[dateKey].occupancy = record.volumePercentage;
      groupedByDate[dateKey].level = record.absoluteLevel;
    });

    filteredPrecipitation.forEach(record => {
      const dateKey = new Date(record.date).toISOString().split('T')[0];
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = {};
      }
      groupedByDate[dateKey].precipitation = record.value;
      groupedByDate[dateKey].station = record.stationName;
    });

    return Object.entries(groupedByDate)
      .map(([rawDate, values]) => ({ rawDate, ...values }))
      .sort((a, b) => a.rawDate.localeCompare(b.rawDate))
      .map(item => ({
        ...item,
        date: new Date(item.rawDate).toLocaleDateString('ca-ES'),
      }));
  }, [embassaments, precipitation, timeRange, selectedEmbassament, selectedStation]);

  if (loading) return <div className={styles.loading}>Carregant dades...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!embassaments?.records || !precipitation?.records)
    return <div className={styles.error}>No data available</div>;

  const allEmbassaments = [...new Set(embassaments.records.map(r => r.name))].sort();
  const allStations = [...new Set(precipitation.records.map(r => r.stationName))].sort();

  return (
    <div className={styles.dashboard}>
      <h1>Correlacio Precipitacio - Nivell d'Embassaments</h1>

      <div className={styles.controls}>
        <div className={styles.timeRange}>
          <label>Periodo:</label>
          <button
            className={timeRange === '24hours' ? styles.active : styles.inactive}
            onClick={() => setTimeRange('24hours')}
          >
            Ultim dia disponible
          </button>
          <button
            className={timeRange === '30days' ? styles.active : styles.inactive}
            onClick={() => setTimeRange('30days')}
          >
            Ultims 30 dies
          </button>
          <button
            className={timeRange === '1year' ? styles.active : styles.inactive}
            onClick={() => setTimeRange('1year')}
          >
            Ultim any
          </button>
          <button
            className={timeRange === '2years' ? styles.active : styles.inactive}
            onClick={() => setTimeRange('2years')}
          >
            Ultims 2 anys
          </button>
          <button
            className={timeRange === '5years' ? styles.active : styles.inactive}
            onClick={() => setTimeRange('5years')}
          >
            Ultims 5 anys
          </button>
        </div>

        <div className={styles.embassamentSelector}>
          <label>Embassament:</label>
          <select
            value={selectedEmbassament}
            onChange={(e) => setSelectedEmbassament(e.target.value)}
          >
            {allEmbassaments.map(embassament => (
              <option key={embassament} value={embassament}>
                {embassament}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.stationSelector}>
          <label>Estacio (opcional):</label>
          <select
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
          >
            <option value="">Totes les estacions</option>
            {allStations.map(station => (
              <option key={station} value={station}>
                {station}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.chartContainer}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData} margin={{ top: 5, right: 80, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                interval={Math.floor(chartData.length / 10) || 0}
              />
              <YAxis
                yAxisId="left"
                label={{ value: 'Ocupacio (%)', angle: -90, position: 'insideLeft' }}
                domain={[0, 110]}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{ value: 'Precipitacio (mm)', angle: 90, position: 'insideRight' }}
              />
              <Tooltip
                formatter={(value, name) => tooltipFormatter(value, name)}
                labelStyle={{ color: '#333' }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="occupancy"
                stroke="#1E7E1E"
                dot={false}
                strokeWidth={2}
                name="Ocupacio Embassament (%)"
                isAnimationActive={false}
              />
              <Bar
                yAxisId="right"
                dataKey="precipitation"
                fill="#4ECDC4"
                name="Precipitacio (mm)"
                opacity={0.7}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className={styles.noData}>No hi ha dades per al periode seleccionat</div>
        )}
      </div>

      <div className={styles.statistics}>
        <h2>Estadistiques de Correlacio</h2>
        {chartData.length > 0 && (
          <div className={styles.statCard}>
            <h3>Embassament: {selectedEmbassament}</h3>
            {selectedStation && <p className={styles.station}>Estacio: {selectedStation}</p>}
            <div className={styles.statRow}>
              <span>Ocupacio mitjana:</span>
              <strong>
                {formatValue(calcAverage(chartData, d => d.occupancy), 'occupancy') !== 'N/A'
                  ? formatValue(calcAverage(chartData, d => d.occupancy), 'occupancy')
                  : 'Sense dades'}
              </strong>
            </div>
            <div className={styles.statRow}>
              <span>Precipitacio acumulada:</span>
              <strong>
                {formatValue(calcTotal(chartData, d => d.precipitation), 'precipitation') !== 'N/A'
                  ? formatValue(calcTotal(chartData, d => d.precipitation), 'precipitation')
                  : 'Sense dades'}
              </strong>
            </div>
            <div className={styles.statRow}>
              <span>Precipitacio mitjana:</span>
              <strong>
                {formatValue(calcAverage(chartData, d => d.precipitation), 'precipitation') !== 'N/A'
                  ? formatValue(calcAverage(chartData, d => d.precipitation), 'precipitation')
                  : 'Sense dades'}
              </strong>
            </div>
            <div className={styles.statRow}>
              <span>Registres:</span>
              <strong>{chartData.length}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard3;
