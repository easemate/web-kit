'use client';

import { useEffect, type ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    // Dynamic import to avoid SSR/build issues with decorators
    // The web-kit package uses TC39 decorators which aren't supported by Next.js's SWC
    let controller: { dispose: () => void } | null = null;
    
    import('@easemate/web-kit').then(({ initWebKit }) => {
      controller = initWebKit({ theme: 'default', styles: 'main' });
    });
    
    return () => {
      controller?.dispose();
    };
  }, []);

  return <>{children}</>;
}
