'use client';

import React from 'react';
import { TopProgressBar, DashboardSkeleton } from '@/components/ui/ZeroLatencyLoader';

export default function AppLoading() {
  return (
    <>
      <TopProgressBar active={true} />
      <DashboardSkeleton />
    </>
  );
}

