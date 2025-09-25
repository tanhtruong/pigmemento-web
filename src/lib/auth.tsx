import { jwtDecode } from 'jwt-decode';
import { Navigate, useLocation } from 'react-router';
import { paths } from '@/config/paths';
import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';

type JwtPayload = {
  [key: string]: any;
  exp: number;
  sub: string;
};

export const isTokenValid = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    return false;
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const now = Date.now() / 1000;
    return decoded.exp > now;
  } catch (e) {
    return false;
  }
};

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isValid, setIsValid] = useState<boolean>(false);

  useEffect(() => {
    const valid = isTokenValid();
    setIsValid(valid);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isValid) {
    return (
      <Navigate to={paths.auth.login.getHref(location.pathname)} replace />
    );
  }

  return children;
};

export const getUserFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);

    return {
      id:
        (decoded[
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
        ] as string) ?? decoded.sub,
      name: decoded[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
      ] as string,
      email: decoded[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
      ] as string,
    };
  } catch (error) {
    console.warn('Invalid token:', error);
    return null;
  }
};
