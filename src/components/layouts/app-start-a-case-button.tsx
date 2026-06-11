import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button.tsx';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover.tsx';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer.tsx';
import {
  StartACasePicker,
  type StartACaseOption,
} from '@/components/signature/start-a-case-picker.tsx';
import { paths } from '@/config/paths.ts';
import { cn } from '@/lib/utils.ts';
import { useIsMobile } from '@/hooks/use-is-mobile.ts';

type AppStartACaseButtonProps = {
  /** External open state (e.g. opened from CommandPalette). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** When set, renders the trigger; otherwise just the controlled overlay. */
  withTrigger?: boolean;
  className?: string;
};

/**
 * The amber `Start a case` CTA. Opens the StartACasePicker in:
 *  - a Popover on desktop
 *  - a vaul Drawer on mobile (platform convention)
 *
 * Picker options:
 *  - Random case
 *  - Drill: Melanoma vs Nevus (TBD wiring — routes to drill route for now)
 *  - Drill: ABCDE features (same)
 *  - Resume (placeholder until session-state lands)
 */
export const AppStartACaseButton = ({
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  withTrigger = true,
  className,
}: AppStartACaseButtonProps) => {
  const navigate = useNavigate();
  const [internalOpen, setInternalOpen] = useState(false);
  const isMobile = useIsMobile();

  const open = controlledOpen ?? internalOpen;
  const setOpen = setControlledOpen ?? setInternalOpen;

  const options: StartACaseOption[] = [
    {
      id: 'random',
      label: 'Random case',
      description: 'A case from your library at random.',
      shortcut: 'R',
      onSelect: () => {
        setOpen(false);
        navigate(paths.app['case-random'].getHref());
      },
    },
    {
      id: 'drill-mvn',
      label: 'Drill · Melanoma vs Nevus',
      description: 'Coming in PR7. Routes to the drill surface for now.',
      shortcut: '1',
      onSelect: () => {
        setOpen(false);
        navigate(paths.app['case-drill'].getHref());
      },
    },
    {
      id: 'drill-abcde',
      label: 'Drill · ABCDE features',
      description: 'Coming in PR7. Routes to the drill surface for now.',
      shortcut: '2',
      onSelect: () => {
        setOpen(false);
        navigate(paths.app['case-drill'].getHref());
      },
    },
  ];

  const trigger = withTrigger ? (
    <Button className={cn('gap-1.5', className)}>
      <Sparkles />
      Start a case
      <ArrowRight />
    </Button>
  ) : null;

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle className="font-display text-2xl">
              Start a case
            </DrawerTitle>
            <DrawerDescription>
              Pick how you want to study. You can change paths anytime.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-6">
            <StartACasePicker options={options} title="" />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {trigger && <PopoverTrigger asChild>{trigger}</PopoverTrigger>}
      <PopoverContent align="end" className="w-[22rem] p-4">
        <StartACasePicker options={options} />
      </PopoverContent>
    </Popover>
  );
};
