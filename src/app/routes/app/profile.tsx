import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, Info, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Hairline } from '@/components/foundation/hairline';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useProfile } from '@/features/profile/api/use-profile.ts';
import { useStats } from '@/features/profile/api/use-stats.ts';
import { useUpdateProfile } from '@/features/profile/api/use-update-profile';
import { useDeleteAccount } from '@/features/profile/api/use-delete-account.ts';
import { clearAuthToken } from '@/lib/auth';

const useCoarsePointer = () => {
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return;
    const mq = window.matchMedia('(pointer: coarse)');
    const update = () => setIsCoarsePointer(Boolean(mq.matches));
    update();
    if ('addEventListener' in mq) {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    }
  }, []);
  return isCoarsePointer;
};

const InfoHelp = ({
  label,
  description,
}: {
  label: string;
  description: string;
}) => {
  const isCoarsePointer = useCoarsePointer();
  const trigger = (
    <span className="text-muted-foreground inline-flex items-center gap-1.5">
      <span>{label}</span>
      <span aria-hidden>
        <Info className="h-3.5 w-3.5" />
      </span>
      <span className="sr-only">About {label}</span>
    </span>
  );

  if (isCoarsePointer) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <button type="button" className="text-left">
            {trigger}
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription className="text-sm">
              {description}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="text-left">
            {trigger}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs text-xs">{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const Row = ({
  label,
  value,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
}) => (
  <div className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-foreground text-right tabular-nums">{value}</span>
  </div>
);

const Pct = (n: number | null | undefined) =>
  n === null || n === undefined ? '—' : `${Math.round(n * 100)}%`;

const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString() : '—';

const ProfileScene = () => {
  const { data: user } = useProfile();
  const { data: stats } = useStats();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    mutateAsync: updateProfile,
    isPending: isUpdating,
    isError: isUpdateError,
    error: updateError,
    reset: resetUpdate,
  } = useUpdateProfile();

  const {
    mutateAsync: deleteAccount,
    isPending: isDeleting,
    isError: isDeleteError,
    error: deleteError,
    reset: resetDelete,
  } = useDeleteAccount();

  const [isEditing, setIsEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState('');

  useEffect(() => {
    if (!user) return;
    setNameDraft(user.name ?? '');
  }, [user]);

  const initials =
    (user?.name || user?.email || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || 'U';

  const onSignOut = () => {
    clearAuthToken();
    queryClient.clear();
    toast('Signed out');
    navigate('/', { replace: true });
  };

  const onCancelEdit = () => {
    resetUpdate();
    setIsEditing(false);
    setNameDraft(user?.name ?? '');
  };

  const onSaveProfile = async () => {
    resetUpdate();
    const name = nameDraft.trim();
    if (!name) {
      toast.error('Name is required.');
      return;
    }
    try {
      await updateProfile({ name });
      toast('Profile updated');
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsEditing(false);
    } catch {
      // mutation state holds the error
    }
  };

  const onDeleteAccount = async () => {
    resetDelete();
    try {
      await deleteAccount();
      queryClient.clear();
      navigate('/', { replace: true });
    } catch {
      // mutation state holds the error
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-3 py-20">
        <Spinner size="lg" variant="muted" />
        <p className="text-muted-foreground font-mono text-xs tracking-wider uppercase">
          Loading profile…
        </p>
      </div>
    );
  }

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-10 py-2">
      <header className="flex flex-col gap-1.5">
        <p className="text-primary font-mono text-[0.6875rem] tracking-[0.18em] uppercase">
          Profile
        </p>
        <h1 className="font-display text-4xl leading-tight sm:text-5xl">
          Your account.
        </h1>
        <p className="text-muted-foreground text-sm">
          Settings, identity, and the long-form record of your practice.
        </p>
      </header>

      <Hairline />

      {/* Identity */}
      <section className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div
            aria-label="Profile avatar"
            className="border-hairline bg-muted/50 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border font-mono text-base"
          >
            {initials}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-baseline gap-2">
              {isEditing ? (
                <Input
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  className="h-9 max-w-[240px]"
                  autoFocus
                />
              ) : (
                <h2 className="font-display text-foreground text-2xl leading-tight">
                  {user.name || '—'}
                </h2>
              )}
              {user.role && (
                <Badge variant="outline" className="capitalize">
                  {user.role}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground truncate text-sm">
              {user.email}
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            {!isEditing ? (
              <Button size="sm" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            ) : (
              <>
                <Button size="sm" onClick={onSaveProfile} disabled={isUpdating}>
                  <Check />
                  {isUpdating ? 'Saving…' : 'Save'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onCancelEdit}
                  disabled={isUpdating}
                >
                  <X />
                </Button>
              </>
            )}
          </div>
        </div>

        {isEditing && isUpdateError && (
          <p className="text-incorrect text-xs">
            {updateError instanceof Error
              ? updateError.message
              : 'Couldn’t update your profile.'}
          </p>
        )}

        <div className="border-hairline border-t">
          <Row label="Member since" value={formatDate(user.createdAt)} />
          <Hairline />
          <Row
            label="Last login"
            value={user.lastLoginAt ? formatDate(user.lastLoginAt) : '—'}
          />
        </div>
      </section>

      <Hairline />

      {/* Long-form practice record */}
      <section className="flex flex-col gap-4">
        <p className="text-muted-foreground font-mono text-[0.6875rem] tracking-[0.18em] uppercase">
          Your practice
        </p>
        <div className="border-hairline border-t">
          <Row label="Total attempts" value={stats?.totalAttempts ?? '—'} />
          <Hairline />
          <Row
            label="Unique cases attempted"
            value={stats?.uniqueCasesAttempted ?? '—'}
          />
          <Hairline />
          <Row
            label={
              <InfoHelp
                label="Accuracy"
                description="Overall proportion of correct answers. Doesn't distinguish missed melanomas from false alarms — read alongside sensitivity and specificity."
              />
            }
            value={Pct(stats?.accuracy)}
          />
          <Hairline />
          <Row
            label={
              <InfoHelp
                label="Sensitivity"
                description="How often malignant cases are correctly identified. High sensitivity reduces missed melanomas."
              />
            }
            value={Pct(stats?.sensitivity)}
          />
          <Hairline />
          <Row
            label={
              <InfoHelp
                label="Specificity"
                description="How often benign cases are correctly identified. High specificity reduces unnecessary concern or biopsies."
              />
            }
            value={Pct(stats?.specificity)}
          />
          <Hairline />
          <Row
            label="First attempt"
            value={formatDate(stats?.firstAttemptAt)}
          />
          <Hairline />
          <Row label="Last attempt" value={formatDate(stats?.lastAttemptAt)} />
        </div>
        <p className="text-muted-foreground text-[0.6875rem]">
          Metrics are educational only. Not a calibrated diagnostic tool.
        </p>
      </section>

      <Hairline />

      {/* About */}
      <section className="flex flex-col gap-3">
        <p className="text-muted-foreground font-mono text-[0.6875rem] tracking-[0.18em] uppercase">
          About
        </p>
        <p className="text-foreground text-sm leading-relaxed">
          Pigmemento trains visual recognition of melanoma using real
          dermoscopic cases curated from the ISIC Archive, with structured
          feedback and ABCDE annotations.
        </p>
        <p className="text-muted-foreground text-[0.6875rem]">
          Educational use only — not for diagnosis or clinical decision-making.
        </p>
        <a
          href="mailto:contact@pigmemento.app?subject=Pigmemento%20Support"
          className="text-primary w-fit text-sm underline-offset-4 hover:underline"
        >
          Contact support →
        </a>
      </section>

      <Hairline />

      {/* Session + danger zone */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground font-mono text-[0.6875rem] tracking-[0.18em] uppercase">
            Session
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-fit">
                Sign out
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sign out</AlertDialogTitle>
                <AlertDialogDescription>
                  You can always sign back in.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onSignOut}>
                  Sign out
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-incorrect font-mono text-[0.6875rem] tracking-[0.18em] uppercase">
            Danger zone
          </p>
          <p className="text-muted-foreground text-sm">
            Deleting your account is permanent. Your profile and training
            history will be removed.
          </p>
          {isDeleteError && (
            <p className="text-incorrect text-xs">
              {deleteError instanceof Error
                ? deleteError.message
                : 'Couldn’t delete your account.'}
            </p>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-fit"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting…' : 'Delete account'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete account</AlertDialogTitle>
                <AlertDialogDescription>
                  This is permanent. Your account and all training history will
                  be removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDeleteAccount}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:brightness-105"
                >
                  {isDeleting ? 'Deleting…' : 'Yes, delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>
    </article>
  );
};

export default ProfileScene;
