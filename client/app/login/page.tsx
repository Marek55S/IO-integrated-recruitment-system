import { getPrograms } from '@/mockedBackend/programs';

import { LoginPageClient } from './login-page-client';

export default function LoginPage() {
  const validProgramIds = getPrograms().map((p) => p.id);

  return <LoginPageClient validProgramIds={validProgramIds} />;
}
