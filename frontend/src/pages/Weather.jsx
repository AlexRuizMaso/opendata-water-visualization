import React from 'react'

export default function Weather() {
  return (
    <div className="weather-page">
      <div className="container">
        <h1>Meteorologia</h1>
        
        <section className="methodology">
          <h2>Metodologia de Treball amb les Dades</h2>
          
          <div className="methodology-section">
            <h3>Font de les Dades</h3>
            <p>Les dades meteorològiques s'obtenen de la Xarxa d'Estacions Meteorològiques Automàtiques (XEMA) de Catalunya, que consta d'una xarxa d'estacions distribuïdes per tot el territori que mesuren paràmetres com precipitacions, temperatura, humitat, velocitat del vent i radiació solar cada 10 minuts.</p>
          </div>
          
            <div className="methodology-section">
              <h3>Procés ETL</h3>
              <p>Les dades es processen mitjançant un pipeline ETL implementat en Node.js que:</p>
              <ul>
                <li>Extreu les dades bruts de l'API de la XEMA cada hora</li>
                <li>Agrega les mesures de 10 minuts a valors horaris i diaris</li>
                <li>Aplica el control de qualitat per detectar i corregir anomalies en els sensors</li>
                <li>Calcula indicadors meteorològics com l'índex d'ariditat o l'equilibri hídric potencial</li>
                <li>Emmagatzema les dades en una base de dades temporal per a consultes i anàlisi</li>
              </ul>
            </div>
          
          <div className="methodology-section">
            <h3>Objectiu de les Visualitzacions</h3>
            <p>Les visualitzacions permeten:</p>
            <ul>
              <li>Analitzar patrons de precipitació i la seva relació amb els nivells d'embassaments</li>
              <li>Identificacions de períodes de sequera o d'abundància precipitació</li>
              <li>Estudi de la influència de factors meteorològics en l'evaporació dels embassaments</li>
              <li>Creació de models predictius d'aportació hídrica basats en forecasts meteorològics</li>
            </ul>
          </div>
        </section>
        
        {/* Aquí s'afegirà la visualització de dades meteorològiques */}
      </div>
    </div>
  )
}
