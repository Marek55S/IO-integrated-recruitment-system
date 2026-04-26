import { RegisterPageClient } from './register-page-client';
import { getPrograms } from '@/mockedBackend/programs';

export default function RegisterPage() {
  const validProgramIds = getPrograms().map((p) => p.id);

  return <RegisterPageClient validProgramIds={validProgramIds} />;
}
