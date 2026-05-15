import React, { useState } from 'react';
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
import styles from './Dashboard3.module.scss';

/**
 * Dashboard 3: Climate-Water Correlation
 * Shows relationship between precipitation and embassament levels
 * Features: dual-axis chart, embassament/station selectors, date range filtering
 */
const Dashboard3 = () => {
  const { embassaments, precipitation, loading, error } = useWaterData();
  const [selectedEmbassament, setSelectedEmbassament] = useState('Sau');
  const [selectedStation, setSelectedStation] = useState('');
  const [timeRange, setTimeRange] = useState('30days');
  const [chartData, setChartData] = useState([]);

  // Handle data correlation
  React.useEffect(() => {
    if (!embassaments?.records || !precipitation?.records) return;

    const endDate = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case '24hours':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '30days':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '1year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Filter embassament data
    let filteredEmbassaments = waterDataService.filterEmbassamentsByDateRange(
      embassaments.records.filter(r => r.name === selectedEmbassament),
      startDate,
      endDate
    );

    // Filter precipitation data
    let filteredPrecipitation = waterDataService.filterPrecipitationByDateRange(
      precipitation.records,
      startDate,
      endDate
    );

    // If a station is selected, filter precipitation
    if (selectedStation) {
      filteredPrecipitation = filteredPrecipitation.filter(
        r => r.stationName === selectedStation
      );
    } else if (filteredPrecipitation.length > 0) {
      // Group by date and get first station if none selected
      const stationsByDate = {};
      filteredPrecipitation.forEach(r => {
        if (!stationsByDate[r.date]) {
          stationsByDate[r.date] = r;
        }
      });
      filteredPrecipitation = Object.values(stationsByDate);
    }

    // Group by date
    const groupedByDate = {};

    filteredEmbassaments.forEach(record => {
      const dateKey = new Date(record.date).toLocaleDateString('ca-ES');
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = {};
      }
      groupedByDate[dateKey].occupancy = record.volumePercentage;
      groupedByDate[dateKey].level = record.absoluteLevel;
    });

    filteredPrecipitation.forEach(record => {
      const dateKey = new Date(record.date).toLocaleDateString('ca-ES');
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = {};
      }
      groupedByDate[dateKey].precipitation = record.value;
      groupedByDate[dateKey].station = record.stationName;
    });

    // Convert to array and sort by date
    const data = Object.entries(groupedByDate)
      .map(([date, values]) => ({ date, ...values }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    setChartData(data);
  }, [embassaments, precipitation, timeRange, selectedEmbassament, selectedStation]);

  if (loading) return <div className={styles.loading}>Carregant dades...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!embassaments?.records || !precipitation?.records)
    return <div className={styles.error}>No data available</div>;

  // Get unique embassaments and stations
  const allEmbassaments = [...new Set(embassaments.records.map(r => r.name))].sort();
  const allStations = [...new Set(precipitation.records.map(r => r.stationName))].sort();

  return (
    <div className={styles.dashboard}>
      <h1>🌧️ Correlació Precipitació - Nivell d'Embassaments</h1>

      <div className={styles.controls}>
        {/* Time Range Selector */}
        <div className={styles.timeRange}>
          <label>Període:</label>
          <button
            className={timeRange === '24hours' ? styles.active : ''}
            onClick={() => setTimeRange('24hours')}
          >
            Últimes 24h
          </button>
          <button
            className={timeRange === '30days' ? styles.active : ''}
            onClick={() => setTimeRange('30days')}
          >
            Últims 30 dies
          </button>
          <button
            className={timeRange === '1year' ? styles.active : ''}
            onClick={() => setTimeRange('1year')}
          >
            Últim any
          </button>
        </div>

        {/* Embassament Selector */}
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

        {/* Station Selector */}
        <div className={styles.stationSelector}>
          <label>Estació (opcional):</label>
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

      {/* Dual-Axis Chart */}
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
                label={{ value: 'Ocupació (%)', angle: -90, position: 'insideLeft' }}
                domain={[0, 110]}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{ value: 'Precipitació (mm)', angle: 90, position: 'insideRight' }}
              />
              <Tooltip
                formatter={(value) => {
                  if (value === undefined) return 'N/A';
                  // Check if it's likely precipitation or occupancy based on value range
                  return value > 110 ? `${value.toFixed(1)} mm` : `${value.toFixed(1)}%`;
                }}
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
                name="Ocupació Embassament (%)"
                isAnimationActive={false}
              />
              <Bar
                yAxisId="right"
                dataKey="precipitation"
                fill="#4ECDC4"
                name="Precipitació (mm)"
                opacity={0.7}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className={styles.noData}>No hi ha dades per al període seleccionat</div>
        )}
      </div>

      {/* Statistics */}
      <div className={styles.statistics}>
        <h2>Estadístiques de Correlació</h2>
        {chartData.length > 0 && (
          <>
            <div className={styles.statCard}>
              <h3>Embassament: {selectedEmbassament}</h3>
              {selectedStation && <p className={styles.station}>Estació: {selectedStation}</p>}
              <div className={styles.statRow}>
                <span>Ocupació mitjana:</span>
                <strong>
                  {(
                    chartData
                      .filter(d => d.occupancy !== undefined)
                      .reduce((a, b) => a + (b.occupancy || 0), 0) /
                    chartData.filter(d => d.occupancy !== undefined).length
                  ).toFixed(1)}
                  %
                </strong>
              </div>
              <div className={styles.statRow}>
                <span>Precipitació acumulada:</span>
                <strong>
                  {chartData
                    .filter(d => d.precipitation !== undefined)
                    .reduce((a, b) => a + (b.precipitation || 0), 0)
                    .toFixed(1)}
                  mm
                </strong>
              </div>
              <div className={styles.statRow}>
                <span>Precipitació mitjana:</span>
                <strong>
                  {(
                    chartData
                      .filter(d => d.precipitation !== undefined)
                      .reduce((a, b) => a + (b.precipitation || 0), 0) /
                    chartData.filter(d => d.precipitation !== undefined).length
                  ).toFixed(2)}
                  mm
                </strong>
              </div>
              <div className={styles.statRow}>
                <span>Registres:</span>
                <strong>{chartData.length}</strong>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard3;
