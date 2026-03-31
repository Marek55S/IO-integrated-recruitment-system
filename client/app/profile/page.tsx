import { getProfileViewConfig } from '@io/content-api/server';

import { ProfilePageClient } from './profile-page-client';

export default function ProfilePage() {
  const config = getProfileViewConfig();

  return <ProfilePageClient config={config} />;
}
