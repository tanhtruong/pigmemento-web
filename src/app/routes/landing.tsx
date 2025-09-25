import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { paths } from '@/config/paths';
import { Link } from '@/components/ui/link';
import { isTokenValid } from '@/lib/auth';

const LandingRoute = () => {
  const navigate = useNavigate();
  const isLoggedin = isTokenValid();

  const handleStart = () => {
    if (isLoggedin) {
      navigate(paths.app.dashboard.getHref());
    } else {
      navigate(paths.auth.login.getHref());
    }
  };

  return (
    <>
      <div className="flex h-screen items-center bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8 lg:py-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">Bulletproof React: ATT</span>
          </h2>
          <p>Showcasing My Best Practices For Building React Applications</p>
          <div className="mt-8 flex justify-center gap-5">
            <Button onClick={handleStart}>Get started</Button>
            <Link
              to="https://github.com/tanhtruong"
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="outline">Github Repo</Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingRoute;
