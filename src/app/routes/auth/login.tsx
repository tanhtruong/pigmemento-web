import { AuthLayout } from '@/components/layouts/auth-layout';
import { LoginForm } from '@/features/auth/components/login-form';

const LoginRoute = () => {
  return (
    <AuthLayout
      title="Sign in"
      subtitle="Welcome back to your case-by-case practice."
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginRoute;
