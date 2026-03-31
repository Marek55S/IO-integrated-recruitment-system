import { getProgramsIndex } from '@io/content-api/server';

import { LoginPageClient } from './login-page-client';

export default function LoginPage() {
  const { programs } = getProgramsIndex();
  const validProgramIds = programs.map((p) => p.id);

  return <LoginPageClient validProgramIds={validProgramIds} />;
}
