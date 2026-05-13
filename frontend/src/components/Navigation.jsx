import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/Navigation.scss'

export default function Navigation() {
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
