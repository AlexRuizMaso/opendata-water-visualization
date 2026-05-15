import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import Dashboard from './pages/Dashboard'
import Dashboard1 from './components/dashboards/Dashboard1'
import Dashboard2 from './components/dashboards/Dashboard2'
import Dashboard3 from './components/dashboards/Dashboard3'
import Dashboard4 from './components/dashboards/Dashboard4'
import Reservoirs from './pages/Reservoirs'
import Weather from './pages/Weather'
import About from './pages/About'

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard/map" element={<Dashboard1 />} />
            <Route path="/dashboard/temporal" element={<Dashboard2 />} />
            <Route path="/dashboard/correlation" element={<Dashboard3 />} />
            <Route path="/dashboard/alerts" element={<Dashboard4 />} />
            <Route path="/embassaments" element={<Reservoirs />} />
            <Route path="/meteorologia" element={<Weather />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
