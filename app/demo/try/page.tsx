import React, { Suspense } from 'react';
import TryPageClient from './TryPageClient';

export default function TryPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', color: 'white', textAlign: 'center' }}>Loading demo...</div>}>
      <TryPageClient />
    </Suspense>
  );
}
