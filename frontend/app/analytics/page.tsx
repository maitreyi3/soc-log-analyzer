'use client';

import React, { Suspense } from 'react';
import AnalyticsPageInner from './AnalyticsPageInner';

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div>Loading analytics...</div>}>
      <AnalyticsPageInner />
    </Suspense>
  );
}
