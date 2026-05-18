import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import Dashboard from './pages/Dashboard'
const Dashboard1 = React.lazy(() => import('./components/dashboards/Dashboard1'));
const Dashboard2 = React.lazy(() => import('./components/dashboards/Dashboard2'));
const Dashboard3 = React.lazy(() => import('./components/dashboards/Dashboard3'));
const Dashboard4 = React.lazy(() => import('./components/dashboards/Dashboard4'));
const Reservoirs = React.lazy(() => import('./pages/Reservoirs'));
const Weather = React.lazy(() => import('./pages/Weather'));
const About = React.lazy(() => import('./pages/About'));

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
           <React.Suspense fallback={<div>Loading...</div>}>
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
           </React.Suspense>
        </main>
      </div>
    </Router>
  )
}

export default App
