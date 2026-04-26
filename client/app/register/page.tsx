import { getPrograms } from '@/mockedBackend/programs';

import { RegisterPageClient } from './register-page-client';

export default function RegisterPage() {
  const validProgramIds = getPrograms().map((p) => p.id);

  return <RegisterPageClient validProgramIds={validProgramIds} />;
}
