import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PropsWithChildren } from 'react';
import { useLogout } from '../hooks/use-auth';
import { LogOut } from 'lucide-react';

const LogoutDialog = ({ children }: PropsWithChildren) => {
  const logout = useLogout();

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="destructive">
            <LogOut /> Log out
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log out?</DialogTitle>
          <DialogDescription>
            Are you sure you want to log out of EXP?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={logout}>
            <LogOut /> Log out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogoutDialog;
