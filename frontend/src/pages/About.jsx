import React from 'react'

export default function About() {
  return (
    <div className="about-page">
      <div className="container">
        <h1>Sobre aquest Projecte</h1>
        
        <section className="about-section">
          <h2>Objectiu del Projecte</h2>
          <p>
            Aquest projecte és el Treball de Fi de Grau que pretén facilitar l'accés 
            a les dades obertes sobre recursos hídrics de Catalunya, publicades per la Generalitat.
          </p>
        </section>
        
        <section className="about-section">
          <h2>Tecnologies Utilitzades</h2>
          <ul>
            <li>Frontend: React + Vite</li>
            <li>ETL: Node.js</li>
            <li>Visualització: Recharts i Leaflet</li>
            <li>Automatització: GitHub Actions</li>
          </ul>
        </section>
        
        <section className="about-section">
          <h2>Fonts de Dades</h2>
          <ul>
            <li>Portal de Dades Obertes de la Generalitat de Catalunya</li>
            <li>Xarxa d'Estacions Meteorològiques Automàtiques (XEMA)</li>
            <li>Dades d'embassaments de les conques internes</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
