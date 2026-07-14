import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';

vi.mock('../components/dashboards/Dashboard1', () => ({ default: () => <div>Dashboard1</div> }));
vi.mock('../components/dashboards/Dashboard2', () => ({ default: () => <div>Dashboard2</div> }));
vi.mock('../components/dashboards/Dashboard3', () => ({ default: () => <div>Dashboard3</div> }));
vi.mock('../components/dashboards/Dashboard4', () => ({ default: () => <div>Dashboard4</div> }));

describe('App', () => {
  it('renders navigation', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText("Visualitzador d'Aigua")).toBeDefined();
    });
  });

  it('renders the Dashboard on root path', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Panell de Control')).toBeDefined();
    });
  });

  it('renders Dashboard1 on /dashboard/map', async () => {
    window.location.hash = '#/dashboard/map';
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Dashboard1')).toBeDefined();
    });
  });

  it('renders Dashboard2 on /dashboard/temporal', async () => {
    window.location.hash = '#/dashboard/temporal';
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Dashboard2')).toBeDefined();
    });
  });

  it('renders Dashboard3 on /dashboard/correlation', async () => {
    window.location.hash = '#/dashboard/correlation';
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Dashboard3')).toBeDefined();
    });
  });

  it('renders Dashboard4 on /dashboard/alerts', async () => {
    window.location.hash = '#/dashboard/alerts';
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Dashboard4')).toBeDefined();
    });
  });

  it('renders Reservoirs on /embassaments', async () => {
    window.location.hash = '#/embassaments';
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Embassaments')).toBeDefined();
    });
  });

  it('renders Weather on /meteorologia', async () => {
    window.location.hash = '#/meteorologia';
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Meteorologia')).toBeDefined();
    });
  });

  it('renders About on /about', async () => {
    window.location.hash = '#/about';
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Qui Som?')).toBeDefined();
    });
  });
});
