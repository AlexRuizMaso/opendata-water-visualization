import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Reservoirs from '../Reservoirs';

describe('Reservoirs page', () => {
  it('renders the main heading', () => {
    render(<Reservoirs />);
    expect(screen.getByText('Embassaments')).toBeDefined();
  });

  it('renders methodology section', () => {
    render(<Reservoirs />);
    expect(screen.getByText('Metodologia de Treball amb les Dades')).toBeDefined();
  });

  it('renders data source section', () => {
    render(<Reservoirs />);
    expect(screen.getByText('Font de les Dades')).toBeDefined();
    expect(screen.getByText(/Portal de Dades Obertes/)).toBeDefined();
  });

  it('renders ETL process section', () => {
    render(<Reservoirs />);
    expect(screen.getByText('Procés ETL')).toBeDefined();
    expect(screen.getByText(/pipeline ETL/)).toBeDefined();
  });

  it('renders visualization objectives', () => {
    render(<Reservoirs />);
    expect(screen.getByText('Objectiu de les Visualitzacions')).toBeDefined();
    expect(screen.getByText(/Monitoritzar en temps real/)).toBeDefined();
  });
});
