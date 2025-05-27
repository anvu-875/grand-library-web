'use client';

import { useRouter } from 'next/navigation';
import { PropsWithChildren, useEffect } from 'react';

interface PNFBoundaryProps extends PropsWithChildren {
  condition: boolean;
}

export default function PNFBoundary({ condition, children }: PNFBoundaryProps) {
  const router = useRouter();

  useEffect(() => {
    if (condition) {
      router.replace('/page-not-found');
    }
  }, [condition, router]);

  if (condition) {
    return null;
  }

  return children;
}
