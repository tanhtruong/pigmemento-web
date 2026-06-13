import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { CalendarHeatmap } from './calendar-heatmap';

describe('CalendarHeatmap', () => {
  it('renders one column per week, anchored to the end date', () => {
    render(<CalendarHeatmap data={{}} endDateIso="2026-06-13" weeks={4} />);

    expect(screen.getAllByRole('row')).toHaveLength(4);
    expect(
      screen.getByRole('grid', { name: /activity over the last 4 weeks/i }),
    ).toBeInTheDocument();
  });

  it('labels a populated day with its count', () => {
    render(
      <CalendarHeatmap
        data={{ '2026-06-10': 3 }}
        endDateIso="2026-06-13"
        weeks={4}
      />,
    );

    expect(
      screen.getByRole('gridcell', { name: /2026-06-10: 3 cases/i }),
    ).toBeInTheDocument();
  });

  it('uses the singular noun for a single case', () => {
    render(
      <CalendarHeatmap
        data={{ '2026-06-10': 1 }}
        endDateIso="2026-06-13"
        weeks={4}
      />,
    );

    expect(
      screen.getByRole('gridcell', { name: /2026-06-10: 1 case$/i }),
    ).toBeInTheDocument();
  });

  it('shows a month label for the range', () => {
    render(<CalendarHeatmap data={{}} endDateIso="2026-06-13" weeks={8} />);

    // An 8-week window ending mid-June spans May and June.
    expect(screen.getByText('Jun')).toBeInTheDocument();
  });
});
