import { AuthLayout } from '@/components/layouts/auth-layout';
import { LoginForm } from '@/features/auth/components/login-form';

const LoginRoute = () => {
  return (
    <AuthLayout title="Log in to your account">
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginRoute;
