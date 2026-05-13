import React from 'react'

export default function Dashboard() {
  return (
    <div className="dashboard-page">
      <div className="container">
        <h1>Panell de Control</h1>
        <p>Benvingut al Visualitzador de Dades d'Aigua de Catalunya.</p>
        
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h2>📊 Dades en Temps Real</h2>
            <p>Consulta l'evolució dels nivells dels embassaments i les precipitacions.</p>
          </div>
          
          <div className="dashboard-card">
            <h2>📈 Històric de Dades</h2>
            <p>Analitza les tendències històriques dels recursos hídrics.</p>
          </div>
          
          <div className="dashboard-card">
            <h2>🗺️ Mapa Interactiu</h2>
            <p>Visualitza les ubicacions dels embassaments i estacions meteorològiques.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
