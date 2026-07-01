import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import useWaterData from '../../hooks/useWaterData';
import waterDataService from '../../services/waterDataService';
import { tooltipFormatter, calcAverage } from '../../utils/chartFormatters';
import { calculateDateRange, findLatestRecordDate } from '../../utils/timeRangeFilter';
import styles from './Dashboard2.module.scss';

/**
 * Dashboard 2: Temporal Evolution
 * Shows historical trends for embassaments with date range filtering
 */
const Dashboard2 = () => {
  const { embassaments, loading, error } = useWaterData();
  const [selectedEmbassaments, setSelectedEmbassaments] = useState(['Sau', 'Susqueda']);
  const [timeRange, setTimeRange] = useState('30days');

  const chartData = useMemo(() => {
    if (!embassaments?.records) return [];

    const latestDate = findLatestRecordDate(embassaments.records);
    const { startDate, endDate } = calculateDateRange(timeRange, {
      latestRecordDate: latestDate,
    });

    const filtered = waterDataService.filterEmbassamentsByDateRange(
      embassaments.records,
      startDate,
      endDate
    );

    const groupedByDate = {};
    filtered.forEach(record => {
      const dateKey = new Date(record.date).toISOString().split('T')[0];
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = {};
      }
      groupedByDate[dateKey][record.name] = record.volumePercentage;
    });

    return Object.entries(groupedByDate)
      .map(([rawDate, values]) => ({ rawDate, ...values }))
      .sort((a, b) => a.rawDate.localeCompare(b.rawDate))
      .map(item => ({
        ...item,
        date: new Date(item.rawDate).toLocaleDateString('ca-ES'),
      }));
  }, [embassaments, timeRange, selectedEmbassaments]);

  if (loading) return <div className={styles.loading}>Carregant dades...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!embassaments?.records) return <div className={styles.error}>No data available</div>;

  const allEmbassaments = [...new Set(embassaments.records.map(r => r.name))].sort();

  const colors = ['#1E7E1E', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];

  return (
    <div className={styles.dashboard}>
      <h1>Evolucio dels Nivells d'Embassaments</h1>

      <div className={styles.controls}>
        <div className={styles.timeRange}>
          <label>Periodo:</label>
          <button
            className={timeRange === '24hours' ? styles.active : ''}
            onClick={() => setTimeRange('24hours')}
          >
            Ultim dia disponible
          </button>
          <button
            className={timeRange === '30days' ? styles.active : ''}
            onClick={() => setTimeRange('30days')}
          >
            Ultims 30 dies
          </button>
          <button
            className={timeRange === '1year' ? styles.active : ''}
            onClick={() => setTimeRange('1year')}
          >
            Ultim any
          </button>
          <button
            className={timeRange === '2years' ? styles.active : ''}
            onClick={() => setTimeRange('2years')}
          >
            Ultims 2 anys
          </button>
          <button
            className={timeRange === '5years' ? styles.active : ''}
            onClick={() => setTimeRange('5years')}
          >
            Ultims 5 anys
          </button>
        </div>

        <div className={styles.embassamentSelector}>
          <label>Embassaments a mostrar:</label>
          <div className={styles.checkboxList}>
            {allEmbassaments.map(embassament => (
              <label key={embassament} className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={selectedEmbassaments.includes(embassament)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedEmbassaments([...selectedEmbassaments, embassament]);
                    } else {
                      setSelectedEmbassaments(selectedEmbassaments.filter(el => el !== embassament));
                    }
                  }}
                />
                <span>{embassament}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.chartContainer}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                interval={Math.floor(chartData.length / 10) || 0}
              />
              <YAxis
                label={{ value: 'Ocupacio (%)', angle: -90, position: 'insideLeft' }}
                domain={[0, 110]}
              />
              <Tooltip
                formatter={(value, name) => tooltipFormatter(value, name)}
                labelStyle={{ color: '#333' }}
              />
              <Legend />
              {selectedEmbassaments.map((embassament, index) => (
                <Line
                  key={embassament}
                  type="monotone"
                  dataKey={embassament}
                  stroke={colors[index % colors.length]}
                  dot={false}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className={styles.noData}>No hi ha dades per al periode seleccionat</div>
        )}
      </div>

      <div className={styles.statistics}>
        <h2>Estadistiques</h2>
        {selectedEmbassaments.map(embassament => {
          const data = chartData
            .map(d => d[embassament])
            .filter(v => v !== undefined);

          if (data.length === 0) return null;

          const avg = calcAverage(chartData, d => d[embassament]);
          const min = Math.min(...data);
          const max = Math.max(...data);

          return (
            <div key={embassament} className={styles.statCard}>
              <h3>{embassament}</h3>
              <div className={styles.statRow}>
                <span>Ocupacio mitjana:</span>
                <strong>{avg !== null ? `${avg.toFixed(1)}%` : 'N/A'}</strong>
              </div>
              <div className={styles.statRow}>
                <span>Minim:</span>
                <strong>{min.toFixed(1)}%</strong>
              </div>
              <div className={styles.statRow}>
                <span>Maxim:</span>
                <strong>{max.toFixed(1)}%</strong>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard2;
