import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import About from '../About';

describe('About page', () => {
  it('renders the main heading', () => {
    render(<About />);
    expect(screen.getByText('Qui Som?')).toBeDefined();
  });

  it('renders project presentation section', () => {
    render(<About />);
    expect(screen.getByText('Presentació del Projecte')).toBeDefined();
    expect(screen.getByText(/Treball de Fi de Grau/)).toBeDefined();
  });

  it('renders objective section', () => {
    render(<About />);
    expect(screen.getByText('Objectiu del Projecte')).toBeDefined();
    expect(screen.getAllByText(/recursos hídrics de Catalunya/).length).toBeGreaterThan(0);
  });

  it('renders technologies section', () => {
    render(<About />);
    expect(screen.getByText('Tecnologies Utilitzades')).toBeDefined();
    expect(screen.getByText('Frontend: React + Vite')).toBeDefined();
    expect(screen.getByText('ETL: Node.js')).toBeDefined();
    expect(screen.getByText('Visualització: Recharts i Leaflet')).toBeDefined();
    expect(screen.getByText('Automatització: GitHub Actions')).toBeDefined();
  });

  it('renders data sources section', () => {
    render(<About />);
    expect(screen.getByText('Fonts de Dades')).toBeDefined();
    expect(screen.getByText(/Portal de Dades Obertes/)).toBeDefined();
    expect(screen.getByText(/XEMA/)).toBeDefined();
  });
});
