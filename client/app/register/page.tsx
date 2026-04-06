import { getProgramsIndex } from '@io/content-api/server';

import { RegisterPageClient } from './register-page-client';

export default function RegisterPage() {
  const { programs } = getProgramsIndex();
  const validProgramIds = programs.map((p) => p.id);

  return <RegisterPageClient validProgramIds={validProgramIds} />;
}
