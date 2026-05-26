import React from 'react'

export default function About() {
  return (
    <div className="about-page">
      <div className="container">
        <h1>Qui Som?</h1>
        
        <section className="about-section">
          <h2>Presentació del Projecte</h2>
          <p>
            Aquest projecte és el Treball de Fi de Grau d'Enginyeria Informàtica realitzat per Àlex Ruiz Masó, estudiant del Grau d'Enginyeria Informàtica a l'Escola Politècnica de la Universitat de Girona.
          </p>
          <p>
            L'aplicació web forma part del TFG i pretén facilitar l'accés i la comprensió de les dades obertes sobre recursos hídrics de Catalunya, transformant les dades brutes en visualitzacions comprensibles i útils per a l'anàlisi i la presa de decisions.
          </p>
        </section>
        
        <section className="about-section">
          <h2>Objectiu del Projecte</h2>
          <p>
            Facilitar l'accés a les dades obertes sobre recursos hídrics de Catalunya, publicades per la Generalitat, a través d'interactives visualitzacions que permetin analitzar l'estat dels embassaments i les condicions meteorològiques.
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
