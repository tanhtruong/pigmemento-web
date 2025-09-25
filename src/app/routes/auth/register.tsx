import { AuthLayout } from '@/components/layouts/auth-layout';
import RegisterForm from '@/features/auth/components/register-form';

const RegisterRoute = () => {
  return (
    <AuthLayout title="Register your account">
      <RegisterForm />
    </AuthLayout>
  );
};

export default RegisterRoute;
