import React, { useState } from 'react';
import useWaterData from '../../hooks/useWaterData';
import waterDataService from '../../services/waterDataService';
import styles from './Dashboard4.module.scss';

/**
 * Dashboard 4: Drought Alert Status Matrix
 * Shows current status of all embassaments with color-coded semaphore indicators
 * Features: status grid, alert levels, trend indicators, historical comparison
 */
const Dashboard4 = () => {
  const { embassaments, loading, error } = useWaterData();
  const [sortBy, setSortBy] = useState('status'); // 'status', 'name', 'occupancy'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'critical', 'warning', 'normal', 'optimal'

  if (loading) return <div className={styles.loading}>Carregant dades...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!embassaments?.records) return <div className={styles.error}>No data available</div>;

  // Get latest record for each embassament
  const latest = waterDataService.getLatestEmbassaments(embassaments.records);

  // Calculate trends: compare with 7 days ago
  const getStatusWithTrend = (record) => {
    const recordDate = new Date(record.date).getTime();
    const sevenDaysAgo = recordDate - 7 * 24 * 60 * 60 * 1000;

    const oldRecord = embassaments.records.find(
      r =>
        r.name === record.name &&
        new Date(r.date).getTime() >= sevenDaysAgo &&
        new Date(r.date).getTime() < recordDate - 24 * 60 * 60 * 1000
    );

    let trend = '→'; // stable
    if (oldRecord) {
      const diff = record.volumePercentage - oldRecord.volumePercentage;
      if (diff > 5) trend = '↑'; // increasing
      if (diff < -5) trend = '↓'; // decreasing
    }

    return {
      status:
        record.volumePercentage < 20
          ? 'critical'
          : record.volumePercentage < 50
          ? 'warning'
          : record.volumePercentage < 75
          ? 'normal'
          : 'optimal',
      trend,
    };
  };

  // Enrich data with status and trend
  const enrichedData = latest.map(record => ({
    ...record,
    ...getStatusWithTrend(record),
  }));

  // Filter and sort
  let filtered = enrichedData;
  if (filterStatus !== 'all') {
    filtered = filtered.filter(r => r.status === filterStatus);
  }

  filtered.sort((a, b) => {
    if (sortBy === 'status') {
      const statusOrder = { critical: 0, warning: 1, normal: 2, optimal: 3 };
      return statusOrder[a.status] - statusOrder[b.status];
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'occupancy') {
      return a.volumePercentage - b.volumePercentage;
    }
    return 0;
  });

  // Count by status
  const counts = {
    critical: enrichedData.filter(r => r.status === 'critical').length,
    warning: enrichedData.filter(r => r.status === 'warning').length,
    normal: enrichedData.filter(r => r.status === 'normal').length,
    optimal: enrichedData.filter(r => r.status === 'optimal').length,
  };

  const getStatusLabel = (status) => {
    const labels = {
      critical: 'Crític',
      warning: 'Avís',
      normal: 'Normal',
      optimal: 'Òptim',
    };
    return labels[status];
  };

  return (
    <div className={styles.dashboard}>
      <h1>🚨 Alertes de Sequera - Matriu d'Estatus</h1>

      {/* Alert Summary */}
      <div className={styles.alertSummary}>
        <div className={`${styles.alertCard} ${styles.critical}`}>
          <span className={styles.count}>{counts.critical}</span>
          <span className={styles.label}>Crítics</span>
        </div>
        <div className={`${styles.alertCard} ${styles.warning}`}>
          <span className={styles.count}>{counts.warning}</span>
          <span className={styles.label}>Avís</span>
        </div>
        <div className={`${styles.alertCard} ${styles.normal}`}>
          <span className={styles.count}>{counts.normal}</span>
          <span className={styles.label}>Normals</span>
        </div>
        <div className={`${styles.alertCard} ${styles.optimal}`}>
          <span className={styles.count}>{counts.optimal}</span>
          <span className={styles.label}>Òptims</span>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.filter}>
          <label>Filtrar per estatus:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Tots ({enrichedData.length})</option>
            <option value="critical">Crítics ({counts.critical})</option>
            <option value="warning">Avís ({counts.warning})</option>
            <option value="normal">Normals ({counts.normal})</option>
            <option value="optimal">Òptims ({counts.optimal})</option>
          </select>
        </div>

        <div className={styles.sort}>
          <label>Ordenar per:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="status">Estatus (crític primer)</option>
            <option value="name">Nom (A-Z)</option>
            <option value="occupancy">Ocupació (menor primer)</option>
          </select>
        </div>
      </div>

      {/* Status Grid */}
      <div className={styles.gridContainer}>
        <div className={styles.grid}>
          {filtered.length > 0 ? (
            filtered.map(record => (
              <div
                key={record.name}
                className={`${styles.card} ${styles[record.status]}`}
              >
                {/* Semaphore indicator */}
                <div className={styles.semaphore}>
                  <div className={`${styles.light} ${styles.red}`} />
                  <div className={`${styles.light} ${styles.yellow}`} />
                  <div className={`${styles.light} ${styles.green}`} />
                </div>

                {/* Status bubble */}
                <div className={styles.statusBubble} title={getStatusLabel(record.status)}>
                  {record.status === 'critical' && '🔴'}
                  {record.status === 'warning' && '🟠'}
                  {record.status === 'normal' && '🟢'}
                  {record.status === 'optimal' && '✅'}
                </div>

                {/* Card content */}
                <div className={styles.content}>
                  <h3>{record.name}</h3>

                  {/* Occupancy Bar */}
                  <div className={styles.occupancyBar}>
                    <div
                      className={styles.fill}
                      style={{
                        width: `${Math.min(record.volumePercentage, 100)}%`,
                        backgroundColor: waterDataService.getStatusColor(
                          record.volumePercentage
                        ),
                      }}
                    />
                  </div>

                   {/* Stats */}
                   <div className={styles.stats}>
                     <div className={styles.stat}>
                       <span className={styles.label}>Ocupació:</span>
                       <span className={styles.value}>{record.volumePercentage.toFixed(1)}%</span>
                     </div>
                     <div className={styles.stat}>
                       <span className={styles.label}>Nivell:</span>
                       <span className={styles.value}>{record.absoluteLevel.toFixed(1)}m</span>
                     </div>
                     <div className={styles.stat}>
                       <span className={styles.label}>Volum:</span>
                       <span className={styles.value}>{record.volumeHm3.toFixed(2)}hm³</span>
                     </div>
                   </div>

                  {/* Trend */}
                  <div className={styles.trend}>{record.trend}</div>

                  {/* Date */}
                  <div className={styles.date}>
                    {new Date(record.date).toLocaleDateString('ca-ES', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noData}>No hi ha dades disponibles</div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <h3>Legenda d'Estatus</h3>
        <div className={styles.legendItems}>
          <div className={styles.legendItem}>
            <div className={`${styles.indicator} ${styles.critical}`} />
            <span>
              <strong>Crític:</strong> &lt;20% ocupació
            </span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.indicator} ${styles.warning}`} />
            <span>
              <strong>Avís:</strong> 20-50% ocupació
            </span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.indicator} ${styles.normal}`} />
            <span>
              <strong>Normal:</strong> 50-75% ocupació
            </span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.indicator} ${styles.optimal}`} />
            <span>
              <strong>Òptim:</strong> &gt;75% ocupació
            </span>
          </div>
        </div>
        <div className={styles.trendLegend}>
          <span>Tendència en 7 dies: ↑ (augmenting) → (estable) ↓ (disminuint)</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard4;
