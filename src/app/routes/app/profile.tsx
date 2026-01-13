import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useProfile } from '@/features/profile/api/use-profile.ts';
import { useStats } from '@/features/profile/api/use-stats.ts';
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
import { Info } from 'lucide-react';
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

type InfoHelpProps = {
  label: string;
  description: string;
};

const InfoHelp = ({ label, description }: InfoHelpProps) => {
  const isCoarsePointer = useCoarsePointer();

  const trigger = (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <span className="underline decoration-dotted">{label}</span>
      <span
        className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-muted"
        aria-label={`About ${label}`}
      >
        <Info className="h-4 w-4" aria-hidden="true" />
      </span>
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
import { useDeleteAccount } from '@/features/profile/api/use-delete-account.ts';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { useUpdateProfile } from '@/features/profile/api/use-update-profile';
import { clearAuthToken } from '@/lib/auth';
import { toast } from 'sonner';

const ProfileScene = () => {
  const { data: user } = useProfile();
  const { data: stats } = useStats();
  const {
    mutateAsync: deleteAccount,
    isPending: isDeleting,
    isError: isDeleteError,
    error: deleteError,
    reset: resetDelete,
  } = useDeleteAccount();

  const {
    mutateAsync: updateProfile,
    isPending: isUpdating,
    isError: isUpdateError,
    error: updateError,
    reset: resetUpdate,
  } = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState('');

  useEffect(() => {
    if (!user) return;
    setNameDraft(user.name ?? '');
  }, [user]);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const initials =
    (user?.name || user?.email || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || 'U';

  const onDeleteAccount = async () => {
    // clear any previous mutation error
    resetDelete();

    try {
      await deleteAccount();

      // Clear cached authenticated data so the UI doesn't show stale user state
      queryClient.clear();

      // Redirect out of the authenticated app shell
      navigate('/', { replace: true });
    } catch {
      // mutation error is handled by `useDeleteAccount` state
    }
  };

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
      toast.error('Missing information', {
        description: 'Name is required.',
      });
      return;
    }

    try {
      await updateProfile({ name });
      toast('Profile updated');
      // Refresh profile data
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsEditing(false);
    } catch {
      // error handled by mutation state
    }
  };

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-3xl py-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading profile…</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Please wait.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 py-4 sm:py-6 text-left">
      <header>
        <h1 className="text-2xl font-bold sm:text-3xl">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Account and app information
        </p>
      </header>

      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-base font-semibold"
                aria-label="Profile avatar"
              >
                {initials}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">
                    {user.name || '—'}
                  </CardTitle>
                  <Badge variant="secondary" className="capitalize">
                    {user.role}
                  </Badge>
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    Sign out
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Sign out</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to sign out?
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

              {!isEditing ? (
                <Button
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={onSaveProfile}
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Saving…' : 'Save'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={onCancelEdit}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-muted-foreground">Name</span>
            {isEditing ? (
              <Input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                className="h-9 max-w-[240px]"
              />
            ) : (
              <span className="font-medium sm:text-right">{user.name}</span>
            )}
          </div>
          <Separator />
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-muted-foreground">Member since</span>
            <span className="font-medium sm:text-right">
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-muted-foreground">Last login</span>
            <span className="font-medium sm:text-right">
              {user.lastLoginAt
                ? new Date(user.lastLoginAt).toLocaleDateString()
                : '—'}
            </span>
          </div>
          {isEditing && isUpdateError ? (
            <p className="pt-2 text-xs text-destructive">
              {updateError instanceof Error
                ? updateError.message
                : 'Could not update profile.'}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-muted-foreground">Total attempts</span>
            <span className="font-medium sm:text-right">
              {stats ? stats.totalAttempts : '—'}
            </span>
          </div>

          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-muted-foreground">
              Unique cases attempted
            </span>
            <span className="font-medium sm:text-right">
              {stats ? stats.uniqueCasesAttempted : '—'}
            </span>
          </div>

          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <InfoHelp
              label="Accuracy"
              description="Accuracy is the overall proportion of correct answers. It does not distinguish between missed melanomas and false alarms and should not be interpreted in isolation."
            />
            <span className="font-medium sm:text-right">
              {stats && stats.accuracy !== null
                ? `${Math.round(stats.accuracy * 100)}%`
                : '—'}
            </span>
          </div>

          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <InfoHelp
              label="Sensitivity"
              description="Sensitivity measures how often malignant cases are correctly identified. High sensitivity reduces missed melanomas."
            />
            <span className="font-medium sm:text-right">
              {stats && stats.sensitivity !== null
                ? `${Math.round(stats.sensitivity * 100)}%`
                : '—'}
            </span>
          </div>

          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <InfoHelp
              label="Specificity"
              description="Specificity measures how often benign cases are correctly identified. High specificity reduces unnecessary concern or biopsies."
            />
            <span className="font-medium sm:text-right">
              {stats && stats.specificity !== null
                ? `${Math.round(stats.specificity * 100)}%`
                : '—'}
            </span>
          </div>

          <Separator />

          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-muted-foreground">First attempt</span>
            <span className="font-medium sm:text-right">
              {stats?.firstAttemptAt
                ? new Date(stats.firstAttemptAt).toLocaleDateString()
                : '—'}
            </span>
          </div>

          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-muted-foreground">Last attempt</span>
            <span className="font-medium sm:text-right">
              {stats?.lastAttemptAt
                ? new Date(stats.lastAttemptAt).toLocaleDateString()
                : '—'}
            </span>
          </div>

          <p className="pt-2 text-xs text-muted-foreground">
            Metrics are provided for educational feedback only and must not be
            used for clinical decision-making.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About Pigmemento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            Pigmemento helps clinicians train visual recognition of melanoma
            using real cases, guided tips, and model-based attention maps.
          </p>
          <p className="text-xs text-muted-foreground">
            Educational use only — not for diagnosis or clinical
            decision-making.
          </p>

          <Separator />

          <div className="flex flex-col gap-2">
            {/*<Button asChild variant="link" className="justify-start px-0">
              <Link to={paths.app.sources.getHref()}>Sources & References</Link>
            </Button>
            <Button asChild variant="link" className="justify-start px-0">
              <Link to={paths.app.privacy.getHref()}>Privacy policy</Link>
            </Button>*/}
            <Button asChild variant="link" className="justify-start px-0">
              <a href="mailto:contact@pigmemento.app?subject=Pigmemento%20Support">
                Contact support
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            Deleting your account is permanent. Your profile and training
            history will be removed.
          </p>

          {isDeleteError ? (
            <p className="text-xs text-destructive">
              {deleteError instanceof Error
                ? deleteError.message
                : 'Could not delete account.'}
            </p>
          ) : null}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                disabled={isDeleting}
                className="w-full sm:w-auto"
              >
                Delete account
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete account</AlertDialogTitle>
                <AlertDialogDescription>
                  This action is permanent. Your account and all training
                  history will be permanently removed.
                </AlertDialogDescription>
              </AlertDialogHeader>

              {isDeleteError ? (
                <p className="text-xs text-destructive">
                  {deleteError instanceof Error
                    ? deleteError.message
                    : 'Could not delete account.'}
                </p>
              ) : null}

              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDeleteAccount}
                  disabled={isDeleting}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  {isDeleting ? 'Deleting…' : 'Yes, delete account'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileScene;
