import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import LandingLibraryStage from './landing-library-stage';
import { LIBRARY_BEATS } from './library-beats';

describe('LandingLibraryStage — static fallback (#164)', () => {
  it('renders the static contact-strip when WebGL2 is unavailable', () => {
    // jsdom has no WebGL2 context, so `animated` is false → the static path.
    render(<LandingLibraryStage />);

    for (const beat of LIBRARY_BEATS) {
      expect(screen.getByText(beat.title)).toBeInTheDocument();
    }
    expect(document.querySelectorAll('img[src*="/isic/"]')).toHaveLength(
      LIBRARY_BEATS.length,
    );
    // the static path never mounts a WebGL canvas
    expect(document.querySelector('canvas')).toBeNull();
  });
});
