import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import useWaterData from '../../hooks/useWaterData';
import waterDataService from '../../services/waterDataService';
import styles from './Dashboard2.module.scss';

/**
 * Dashboard 2: Temporal Evolution
 * Shows historical trends for embassaments with date range filtering
 */
const Dashboard2 = () => {
  const { embassaments, loading, error } = useWaterData();
  const [selectedEmbassaments, setSelectedEmbassaments] = useState(['Sau', 'Susqueda']);
  const [timeRange, setTimeRange] = useState('30days');
  const [chartData, setChartData] = useState([]);

  // Handle time range changes
  React.useEffect(() => {
    if (!embassaments?.records) return;

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
      case '2years':
        startDate.setFullYear(endDate.getFullYear() - 2);
        break;
      case '5years':
        startDate.setFullYear(endDate.getFullYear() - 5);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Filter and prepare data
    let filtered = waterDataService.filterEmbassamentsByDateRange(
      embassaments.records,
      startDate,
      endDate
    );

    // Group by date
    const groupedByDate = {};
    filtered.forEach(record => {
      const dateKey = new Date(record.date).toISOString().split('T')[0];
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = {};
      }
      groupedByDate[dateKey][record.name] = record.volumePercentage;
    });

    // Convert to array and sort by date
    const data = Object.entries(groupedByDate)
      .map(([rawDate, values]) => ({ rawDate, ...values }))
      .sort((a, b) => a.rawDate.localeCompare(b.rawDate))
      .map(item => ({
        ...item,
        date: new Date(item.rawDate).toLocaleDateString('ca-ES')
      }));

    setChartData(data);
  }, [embassaments, timeRange, selectedEmbassaments]);

  if (loading) return <div className={styles.loading}>Carregant dades...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!embassaments?.records) return <div className={styles.error}>No data available</div>;

  // Get unique embassaments
  const allEmbassaments = [...new Set(embassaments.records.map(r => r.name))].sort();

  const colors = ['#1E7E1E', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];

  return (
    <div className={styles.dashboard}>
      <h1>📈 Evolució dels Nivells d'Embassaments</h1>

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
           <button
             className={timeRange === '2years' ? styles.active : ''}
             onClick={() => setTimeRange('2years')}
           >
             Últims 2 anys
           </button>
           <button
             className={timeRange === '5years' ? styles.active : ''}
             onClick={() => setTimeRange('5years')}
           >
             Últims 5 anys
           </button>
         </div>

        {/* Embassament Selector */}
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
                      setSelectedEmbassaments(selectedEmbassaments.filter(e => e !== embassament));
                    }
                  }}
                />
                <span>{embassament}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
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
                label={{ value: 'Ocupació (%)', angle: -90, position: 'insideLeft' }}
                domain={[0, 110]}
              />
              <Tooltip
                formatter={(value) => `${value.toFixed(1)}%`}
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
          <div className={styles.noData}>No hi ha dades per al període seleccionat</div>
        )}
      </div>

      {/* Statistics */}
      <div className={styles.statistics}>
        <h2>Estadístiques</h2>
        {selectedEmbassaments.map(embassament => {
          const data = chartData
            .map(d => d[embassament])
            .filter(v => v !== undefined);

          if (data.length === 0) return null;

          const avg = data.reduce((a, b) => a + b, 0) / data.length;
          const min = Math.min(...data);
          const max = Math.max(...data);

          return (
            <div key={embassament} className={styles.statCard}>
              <h3>{embassament}</h3>
              <div className={styles.statRow}>
                <span>Ocupació mitjana:</span>
                <strong>{avg.toFixed(1)}%</strong>
              </div>
              <div className={styles.statRow}>
                <span>Mínim:</span>
                <strong>{min.toFixed(1)}%</strong>
              </div>
              <div className={styles.statRow}>
                <span>Màxim:</span>
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
