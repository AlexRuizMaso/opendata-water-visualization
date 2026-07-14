import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import Navigation from '../Navigation';

function renderNav() {
  return render(
    <MemoryRouter>
      <Navigation />
    </MemoryRouter>
  );
}

describe('Navigation', () => {
  it('renders brand text', () => {
    renderNav();
    expect(screen.getByText("Visualitzador d'Aigua")).toBeDefined();
  });

  it('renders all nav links', () => {
    renderNav();
    expect(screen.getByText('Inici')).toBeDefined();
    expect(screen.getByText('Embassaments')).toBeDefined();
    expect(screen.getByText('Meteorologia')).toBeDefined();
    expect(screen.getByText('Qui som?')).toBeDefined();
  });

  it('renders dashboard dropdown toggle button', () => {
    renderNav();
    expect(screen.getByText('📊 Panells')).toBeDefined();
  });

  it('hides dashboard dropdown by default', () => {
    renderNav();
    expect(screen.queryByText('🗺️ Mapa + KPIs')).toBeNull();
  });

  it('shows dashboard dropdown on click', async () => {
    const user = userEvent.setup();
    renderNav();
    await user.click(screen.getByText('📊 Panells'));
    expect(screen.getByText('🗺️ Mapa + KPIs')).toBeDefined();
    expect(screen.getByText('📈 Evolució Temporal')).toBeDefined();
    expect(screen.getByText('🌧️ Correlació Clima-Aigua')).toBeDefined();
    expect(screen.getByText('🚨 Alertes de Sequera')).toBeDefined();
  });

  it('hides dropdown when clicking a link', async () => {
    const user = userEvent.setup();
    renderNav();
    await user.click(screen.getByText('📊 Panells'));
    expect(screen.getByText('🗺️ Mapa + KPIs')).toBeDefined();
    await user.click(screen.getByText('🗺️ Mapa + KPIs'));
    expect(screen.queryByText('🗺️ Mapa + KPIs')).toBeNull();
  });

  it('toggles dropdown on/off', async () => {
    const user = userEvent.setup();
    renderNav();
    await user.click(screen.getByText('📊 Panells'));
    expect(screen.getByText('🗺️ Mapa + KPIs')).toBeDefined();
    await user.click(screen.getByText('📊 Panells'));
    expect(screen.queryByText('🗺️ Mapa + KPIs')).toBeNull();
  });
});
