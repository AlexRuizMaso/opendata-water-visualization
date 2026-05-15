import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useWaterData from '../../hooks/useWaterData';
import waterDataService from '../../services/waterDataService';
import styles from './Dashboard1.module.scss';

/**
 * Dashboard 1: Map + KPIs
 * Shows embassaments on interactive map with real-time status
 */
const Dashboard1 = () => {
  const { embassaments, loading, error } = useWaterData();
  const [selectedEmbassament, setSelectedEmbassament] = useState(null);

  if (loading) return <div className={styles.loading}>Carregant dades...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!embassaments?.records) return <div className={styles.error}>No data available</div>;

  // Get latest data for each embassament
  const latestData = waterDataService.getLatestEmbassaments(embassaments.records);
  const centerCoords = [41.8, 2.0]; // Center of Catalonia

  return (
    <div className={styles.dashboard}>
      <h1>🗺️ Estat dels Embassaments - Mapa Interactiu</h1>

      <div className={styles.container}>
        {/* Map Section */}
        <div className={styles.mapSection}>
          <MapContainer center={centerCoords} zoom={7} style={{ height: '600px' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            {latestData.map(record => (
              <CircleMarker
                key={record.id}
                center={[record.location.lat, record.location.lng]}
                radius={Math.max(5, record.volumePercentage / 10)}
                fillColor={waterDataService.getStatusColor(record.volumePercentage)}
                fillOpacity={0.7}
                weight={2}
                color="white"
                onClick={() => setSelectedEmbassament(record)}
              >
                <Popup>
                  <div className={styles.popup}>
                    <h3>{record.name}</h3>
                    <p>
                      <strong>Ocupació:</strong> {record.volumePercentage.toFixed(1)}%
                    </p>
                    <p>
                      <strong>Volum:</strong> {record.volumeHm3.toFixed(2)} hm³
                    </p>
                    <p>
                      <strong>Nivell:</strong> {record.absoluteLevel.toFixed(2)} m
                    </p>
                    <p>
                      <small>Actualitzat: {new Date(record.date).toLocaleDateString('ca-ES')}</small>
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        {/* KPIs Section */}
        <div className={styles.kpisSection}>
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Embassaments Monitoritzats</div>
              <div className={styles.statValue}>{latestData.length}</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statLabel}>Ocupació Mitjana</div>
              <div className={styles.statValue}>
                {(latestData.reduce((sum, r) => sum + r.volumePercentage, 0) / latestData.length).toFixed(1)}%
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statLabel}>Volum Total</div>
              <div className={styles.statValue}>
                {latestData.reduce((sum, r) => sum + r.volumeHm3, 0).toFixed(1)} hm³
              </div>
            </div>
          </div>

          {/* Individual Embassaments */}
          <div className={styles.embassamentsList}>
            <h2>Embassaments</h2>
            {latestData.map(record => (
              <div
                key={record.id}
                className={`${styles.embassamentCard} ${styles[record.status]}`}
                onClick={() => setSelectedEmbassament(record)}
              >
                <div className={styles.embassamentHeader}>
                  <h3>{record.name}</h3>
                  <span className={styles.percentage}>{record.volumePercentage.toFixed(1)}%</span>
                </div>

                {/* Progress Bar */}
                <div className={styles.progressBar}>
                  <div
                    className={styles.progress}
                    style={{
                      width: `${Math.min(100, record.volumePercentage)}%`,
                      backgroundColor: waterDataService.getStatusColor(record.volumePercentage),
                    }}
                  />
                </div>

                <div className={styles.embassamentDetails}>
                  <span>Volum: {record.volumeHm3.toFixed(2)} hm³</span>
                  <span>Nivell: {record.absoluteLevel.toFixed(2)} m</span>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Embassament Details */}
          {selectedEmbassament && (
            <div className={styles.detailsPanel}>
              <h2>{selectedEmbassament.name}</h2>
              <div className={styles.details}>
                <p>
                  <strong>Ocupació:</strong> {selectedEmbassament.volumePercentage.toFixed(2)}%
                </p>
                <p>
                  <strong>Volum:</strong> {selectedEmbassament.volumeHm3.toFixed(2)} hm³
                </p>
                <p>
                  <strong>Nivell Absolut:</strong> {selectedEmbassament.absoluteLevel.toFixed(2)} m
                </p>
                <p>
                  <strong>Ubicació:</strong> {selectedEmbassament.location.lat.toFixed(4)}°N,{' '}
                  {selectedEmbassament.location.lng.toFixed(4)}°E
                </p>
                <p>
                  <strong>Estat:</strong>{' '}
                  <span className={styles[selectedEmbassament.status]}>
                    {selectedEmbassament.status.toUpperCase()}
                  </span>
                </p>
                <p>
                  <small>
                    Actualitzat: {new Date(selectedEmbassament.date).toLocaleString('ca-ES')}
                  </small>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard1;
