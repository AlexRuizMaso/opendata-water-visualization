import React from 'react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  return (
    <div className="dashboard-page">
      <div className="container">
        <h1>Panell de Control</h1>
        <p>Benvingut al Visualitzador de Dades d'Aigua de Catalunya.</p>
        
        <div className="dashboard-links">
          <div className="dashboard-card">
            <Link to="/dashboard/map" className="dashboard-link">
              <h2>🗺️ Mapa Interactiu</h2>
            </Link>
            <p>Visualitza les ubicacions dels embassaments i estacions meteorològiques.</p>
          </div>
          
          <div className="dashboard-card">
            <Link to="/dashboard/temporal" className="dashboard-link">
              <h2>📈 Evolució Temporal</h2>
            </Link>
            <p>Analitza l'evolució temporal dels nivells d'aigua i precipitacions.</p>
          </div>
          
          <div className="dashboard-card">
            <Link to="/dashboard/correlation" className="dashboard-link">
              <h2>🔗 Correlació Dades</h2>
            </Link>
            <p>Explora les relacions entre nivells d'embassaments i precipitacions.</p>
          </div>
          
          <div className="dashboard-card">
            <Link to="/dashboard/alerts" className="dashboard-link">
              <h2>⚠️ Alertes i Estats</h2>
            </Link>
            <p>Consulta alertes i estats actuals dels embassaments.</p>
          </div>
          
          <div className="dashboard-card">
            <Link to="/embassaments" className="dashboard-link">
              <h2>💧 Embassaments</h2>
            </Link>
            <p>Detall de la informació dels embassaments de Catalunya.</p>
          </div>
          
          <div className="dashboard-card">
            <Link to="/meteorologia" className="dashboard-link">
              <h2>🌤️ Meteorologia</h2>
            </Link>
            <p>Dades meteorològiques de la Xarxa d'Estacions Meteorològiques Automàtiques.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
