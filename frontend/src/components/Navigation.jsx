import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/Navigation.scss'

export default function Navigation() {
  const [showDashboardMenu, setShowDashboardMenu] = useState(false)

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">💧</span>
          <span className="brand-text">Visualitzador d'Aigua</span>
        </Link>
        
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">Inici</Link>
          </li>
          <li className="nav-item dropdown">
            <button 
              className="nav-link dropdown-toggle"
              onClick={() => setShowDashboardMenu(!showDashboardMenu)}
            >
              📊 Panells
            </button>
            {showDashboardMenu && (
              <ul className="dropdown-menu">
                <li>
                  <Link to="/dashboard/map" className="dropdown-link" onClick={() => setShowDashboardMenu(false)}>
                    🗺️ Mapa + KPIs
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/temporal" className="dropdown-link" onClick={() => setShowDashboardMenu(false)}>
                    📈 Evolució Temporal
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/correlation" className="dropdown-link" onClick={() => setShowDashboardMenu(false)}>
                    🌧️ Correlació Clima-Aigua
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/alerts" className="dropdown-link" onClick={() => setShowDashboardMenu(false)}>
                    🚨 Alertes de Sequera
                  </Link>
                </li>
              </ul>
            )}
          </li>
          <li className="nav-item">
            <Link to="/embassaments" className="nav-link">Embassaments</Link>
          </li>
          <li className="nav-item">
            <Link to="/meteorologia" className="nav-link">Meteorologia</Link>
          </li>
          <li className="nav-item">
            <Link to="/about" className="nav-link">Qui som?</Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}
