import Shell from '@/components/Shell';
import AuthForm from '@/components/AuthForm';

export const metadata = { title: 'Abrir ficha · Saint Village XX Century' };

export default function Page() {
  return (
    <Shell>
      <AuthForm mode="register" />
    </Shell>
  );
}
