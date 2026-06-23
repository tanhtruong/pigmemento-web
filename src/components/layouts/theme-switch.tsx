import { useTheme } from 'next-themes';
import { Monitor, MoonStar, Sun } from 'lucide-react';

import { cn } from '@/utils/cn.ts';

type ThemeKey = 'system' | 'light' | 'dark';

const OPTIONS: { key: ThemeKey; label: string; Icon: typeof Sun }[] = [
  { key: 'system', label: 'System', Icon: Monitor },
  { key: 'light', label: 'Light', Icon: Sun },
  { key: 'dark', label: 'Dark', Icon: MoonStar },
];

type ThemeSwitchProps = {
  className?: string;
};

/**
 * Segmented control — system / light / dark.
 *
 * Lives inside the AppAvatarMenu (per spec Q10d). Reads/writes next-themes'
 * `theme` (not `resolvedTheme`) so "follow system" remains a first-class
 * choice. The app is light-first via AppShell's `.light` class regardless of
 * the chosen value — but the value still propagates to the landing's public
 * area, where `dark` is pinned and `light` would be a deliberate override.
 */
export const ThemeSwitch = ({ className }: ThemeSwitchProps) => {
  const { theme, setTheme } = useTheme();
  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn(
        'inline-flex w-full items-center rounded-input border border-hairline p-0.5',
        className,
      )}
    >
      {OPTIONS.map(({ key, label, Icon }) => {
        const active = theme === key || (!theme && key === 'system');
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(key)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-[calc(var(--radius-input)-2px)] px-2.5 py-1.5',
              'text-xs font-medium transition-all ease-considered duration-150',
              active
                ? 'bg-primary text-primary-foreground shadow-warm-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
};
