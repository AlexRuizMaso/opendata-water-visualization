import React from 'react'

export default function Reservoirs() {
  return (
    <div className="reservoirs-page">
      <div className="container">
        <h1>Embassaments</h1>
        
        <section className="methodology">
          <h2>Metodologia de Treball amb les Dades</h2>
          
          <div className="methodology-section">
            <h3>Font de les Dades</h3>
            <p>Les dades dels embassaments s'obtenen del Portal de Dades Obertes de la Generalitat de Catalunya, específicament del conjunt de dades que conté informació horària dels nivells i percentatges d'ocupació dels principals embassaments de les conques internes de Catalunya.</p>
          </div>
          
          <div className="methodology-section">
            <h3>Procés ETL</h3>
            <p>Les dades es processen mitjançant un pipeline ETL (Extract, Transform, Load) implementat en Node.js que:</p>
            <ul>
              <li>Extreu les dades bruts de l'API obert cada hora</li>
              <li>Neteja i valida les dades per eliminar inconsistències</li>
              <li>Calcula indicadors derivats com la variació horària i diària</li>
              <li>Emmagatzema les dades processades en una base de dades per a consultes eficients</li>
            </ul>
          </div>
          
            <div className="methodology-section">
              <h3>Objectiu de les Visualitzacions</h3>
              <p>Les visualitzacions permeten:</p>
              <ul>
                <li>Monitoritzar en temps real l'estat dels embassaments critiques</li>
                <li>Identificar tendències estacionals i anuals en la disponibilitat d'aigua</li>
                <li>Detectar antecedents de situacions de sequera o d'abundància hídrica</li>
                <li>Facilitar la presa de decisions informades per a la gestió de recursos hídrics</li>
              </ul>
            </div>
        </section>
        
        {/* Aquí s'afegirà la visualització de dades dels embassaments */}
      </div>
    </div>
  )
}
