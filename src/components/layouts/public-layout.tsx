import { Outlet } from 'react-router';
import { PublicFooter } from '@/components/layouts/public-footer.tsx';
import { PublicHeader } from '@/components/layouts/public-header.tsx';

export const PublicLayout = () => {
  return (
    <>
      <PublicHeader />

      <main className="mx-auto w-full">
        <Outlet />
      </main>

      <PublicFooter />
    </>
  );
};
