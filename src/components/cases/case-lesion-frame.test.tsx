import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { CaseLesionFrame } from './case-lesion-frame';

describe('CaseLesionFrame', () => {
  it('renders the lesion image with the alt text and src', () => {
    render(
      <CaseLesionFrame imageSrc="/lesion-42.png" imageAlt="Case 42 lesion" />,
    );

    const image = screen.getByRole('img', { name: 'Case 42 lesion' });
    expect(image).toHaveAttribute('src', '/lesion-42.png');
  });

  it('renders an overlay node when provided', () => {
    render(
      <CaseLesionFrame
        imageSrc="/lesion-42.png"
        imageAlt="Case 42 lesion"
        overlay={<div data-testid="my-overlay">overlay-content</div>}
      />,
    );

    expect(screen.getByTestId('my-overlay')).toBeInTheDocument();
  });
});
