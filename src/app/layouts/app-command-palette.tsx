import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import {
  ArrowRight,
  GraduationCap,
  LayoutDashboard,
  Library,
  LogOut,
  MoonStar,
  Sparkles,
  Sun,
  User2,
} from 'lucide-react';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command.tsx';
import { paths } from '@/config/paths.ts';
import { useInAppNavigate } from '@/components/layouts/use-in-app-navigate.ts';
import { useLogoutTransition } from '@/features/auth/hooks/use-logout-transition.ts';
import { prefetchLandingRoute } from '@/app/prefetch-routes.ts';
import { commitOrigin } from '@/lib/commit-origin.ts';

type AppCommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Opens the Start-a-case picker — passed in so the palette doesn't manage
   *  picker state directly. */
  onStartACase: () => void;
};

/**
 * The ⌘K command palette — the keyboard accelerator for every primary action.
 *
 * - Start a case  (delegates to the picker sheet)
 * - Jump to Practice / Library / Progress / Profile
 * - Toggle theme  (system → light → dark cycle)
 * - Sign out      (conductor exit-app bloom back to the landing)
 *
 * Mounted globally inside AppShell. The ⌘K (⌃K on non-mac) keydown listener
 * lives here so we keep the open-state logic colocated.
 */
export const AppCommandPalette = ({
  open,
  onOpenChange,
  onStartACase,
}: AppCommandPaletteProps) => {
  const inAppNavigate = useInAppNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const logoutWithBloom = useLogoutTransition();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  // Sign out lives here too — warm the landing chunk while the palette is up.
  useEffect(() => {
    if (open) void prefetchLandingRoute();
  }, [open]);

  const run = (fn: () => void) => () => {
    onOpenChange(false);
    fn();
  };

  const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command palette"
      description="Jump to a surface or run an action"
    >
      <CommandInput placeholder="Type a command or jump to a surface…" />
      <CommandList>
        <CommandEmpty>Nothing matches.</CommandEmpty>

        <CommandGroup heading="Actions">
          <CommandItem onSelect={run(onStartACase)}>
            <Sparkles />
            Start a case
            <CommandShortcut>S</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Jump to">
          <CommandItem
            onSelect={run(() =>
              inAppNavigate(paths.app['case-random'].getHref()),
            )}
          >
            <GraduationCap />
            Practice — random case
            <CommandShortcut>P</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={run(() => inAppNavigate(paths.app.cases.getHref()))}
          >
            <Library />
            Library — browse all cases
            <CommandShortcut>L</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={run(() => inAppNavigate(paths.app.dashboard.getHref()))}
          >
            <LayoutDashboard />
            Progress — study journal
            <CommandShortcut>G</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={run(() => inAppNavigate(paths.app.profile.getHref()))}
          >
            <User2 />
            Profile — settings
            <CommandShortcut>,</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Preferences">
          <CommandItem onSelect={run(() => setTheme(nextTheme))}>
            {resolvedTheme === 'dark' ? <Sun /> : <MoonStar />}
            Switch to {nextTheme} theme
          </CommandItem>
          <CommandItem onSelect={run(() => setTheme('system'))}>
            <ArrowRight />
            Follow system theme
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Account">
          {/* cmdk's onSelect passes no event — the centered dialog makes
              the viewport-center fallback the honest origin. */}
          <CommandItem
            onSelect={run(() => logoutWithBloom(commitOrigin(null)))}
          >
            <LogOut />
            Sign out
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
