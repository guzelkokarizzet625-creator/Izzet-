import nextDynamic from 'next/dynamic';
import { AppProvider } from '@/context/AppContext';

export const dynamic = 'force-dynamic';

// Dynamically import the main dashboard client-side only (ssr: false)
// This avoids any static generation or server-side hydration mismatches or useContext errors.
const HomeClient = nextDynamic(() => import('@/components/HomeClient'), { ssr: false });

export default function Page() {
  return (
    <AppProvider>
      <HomeClient />
    </AppProvider>
  );
}
