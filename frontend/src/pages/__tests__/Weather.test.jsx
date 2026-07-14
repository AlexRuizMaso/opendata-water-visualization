import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Weather from '../Weather';

describe('Weather page', () => {
  it('renders the main heading', () => {
    render(<Weather />);
    expect(screen.getByText('Meteorologia')).toBeDefined();
  });

  it('renders methodology section', () => {
    render(<Weather />);
    expect(screen.getByText('Metodologia de Treball amb les Dades')).toBeDefined();
  });

  it('renders data source section', () => {
    render(<Weather />);
    expect(screen.getByText('Font de les Dades')).toBeDefined();
    expect(screen.getAllByText(/XEMA/).length).toBeGreaterThan(0);
  });

  it('renders ETL process section', () => {
    render(<Weather />);
    expect(screen.getByText('Procés ETL')).toBeDefined();
  });

  it('renders visualization objectives', () => {
    render(<Weather />);
    expect(screen.getByText('Objectiu de les Visualitzacions')).toBeDefined();
    expect(screen.getByText(/Analitzar patrons de precipitació/)).toBeDefined();
  });
});
