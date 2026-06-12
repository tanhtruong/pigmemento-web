// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { TransitionConductor } from '@/components/motion/transition-conductor';

const useLoginMock = vi.fn();
vi.mock('../hooks/use-auth', async () => {
  const actual = await vi.importActual<object>('../hooks/use-auth');
  return {
    ...actual,
    useLogin: () => useLoginMock(),
  };
});

import { LoginForm } from './login-form';

afterEach(() => {
  vi.clearAllMocks();
});

// The form needs the conductor's context, exactly like production.
const renderForm = () => {
  const router = createMemoryRouter([
    {
      element: <TransitionConductor />,
      children: [{ path: '/', element: <LoginForm /> }],
    },
  ]);
  return render(<RouterProvider router={router} />);
};

describe('LoginForm wait + failure states', () => {
  it('shows the commit ring and locks the button while the sign-in is in flight', () => {
    useLoginMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
      isError: false,
    });
    renderForm();

    const button = screen.getByRole('button', { name: /signing in…/i });
    expect(button).toBeDisabled();
    // The hairline commit ring — same vocabulary as the case-choice cards.
    expect(button.querySelector('svg rect')).not.toBeNull();
  });

  it('shows no ring at rest', () => {
    useLoginMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
    });
    renderForm();

    const button = screen.getByRole('button', { name: /sign in/i });
    expect(button).toBeEnabled();
    expect(button.querySelector('svg rect')).toBeNull();
  });

  it('surfaces failure inline — and never blooms', () => {
    useLoginMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: true,
    });
    renderForm();

    expect(screen.getByRole('alert').textContent).toMatch(
      /couldn’t sign you in/i,
    );
    // The conductor overlay never mounts on the failure path.
    expect(document.body.querySelector('[class*="z-[70]"]')).toBeNull();
  });
});
