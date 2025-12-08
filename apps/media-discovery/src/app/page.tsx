'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDiscoveryStore } from '@/lib/discovery-store';

export default function RootPage() {
  const router = useRouter();
  const { profileComplete, userName } = useDiscoveryStore();

  useEffect(() => {
    // If profile is complete, go to home
    if (profileComplete) {
      router.replace('/home');
    }
    // If no name set and profile not complete, go to welcome
    else if (!userName) {
      router.replace('/welcome');
    }
    // If name is set but profile not complete, go to discover
    else {
      router.replace('/discover');
    }
  }, [profileComplete, userName, router]);

  // Show loading state while redirecting
  return (
    <main className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="text-center">
        <div className="inline-block animate-pulse">
          <div className="h-8 w-64 bg-bg-elevated rounded mb-4" />
          <div className="h-4 w-96 bg-bg-elevated rounded" />
        </div>
      </div>
    </main>
  );
}
