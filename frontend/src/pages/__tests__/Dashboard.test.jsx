import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';

function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );
}

describe('Dashboard page', () => {
  it('renders the main heading', () => {
    renderDashboard();
    expect(screen.getByText('Panell de Control')).toBeDefined();
  });

  it('renders the welcome text', () => {
    renderDashboard();
    expect(screen.getByText(/Benvingut al Visualitzador/)).toBeDefined();
  });

  it('renders all dashboard cards with links', () => {
    renderDashboard();
    expect(screen.getByText('🗺️ Mapa Interactiu')).toBeDefined();
    expect(screen.getByText('📈 Evolució Temporal')).toBeDefined();
    expect(screen.getByText('🔗 Correlació Dades')).toBeDefined();
    expect(screen.getByText('⚠️ Alertes i Estats')).toBeDefined();
    expect(screen.getByText('💧 Embassaments')).toBeDefined();
    expect(screen.getByText('🌤️ Meteorologia')).toBeDefined();
  });

  it('renders card descriptions', () => {
    renderDashboard();
    expect(screen.getByText(/Visualitza les ubicacions/)).toBeDefined();
    expect(screen.getByText(/Analitza l'evolució temporal/)).toBeDefined();
  });
});
