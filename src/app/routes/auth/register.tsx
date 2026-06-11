import { AuthLayout } from '@/components/layouts/auth-layout';
import RegisterForm from '@/features/auth/components/register-form';

const RegisterRoute = () => {
  return (
    <AuthLayout
      title="Create an account"
      subtitle="Start training your pattern recognition in under a minute."
    >
      <RegisterForm />
    </AuthLayout>
  );
};

export default RegisterRoute;
