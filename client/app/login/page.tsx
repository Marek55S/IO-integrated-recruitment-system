import { LoginPageClient } from './login-page-client';
import { getPrograms } from '@/mockedBackend/programs';

export default function LoginPage() {
  const validProgramIds = getPrograms().map((p) => p.id);

  return <LoginPageClient validProgramIds={validProgramIds} />;
}
