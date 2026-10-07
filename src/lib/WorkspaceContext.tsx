'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CONFIG } from './config';

export interface WorkspaceBusiness {
  id: string;
  name: string;
  gstin: string;
  stateCode: string;
  turnoverSlab: 'UNDER_5CR' | 'OVER_5CR';
}

const DEMO_BIZ_ID = 'biz_sharma_traders_demo';
const BUSINESS_KEY = 'zerogap.activeBusinessId';
const PERIOD_KEY = 'zerogap.activePeriod';

interface WorkspaceValue {
  businesses: WorkspaceBusiness[];
  activeBusiness: WorkspaceBusiness | null;
  activeBusinessId: string;
  activePeriod: string;
  isDemo: boolean;
  loading: boolean;
  setActiveBusinessId: (id: string) => void;
  setActivePeriod: (period: string) => void;
  refreshBusinesses: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [businesses, setBusinesses] = useState<WorkspaceBusiness[]>([]);
  const [activeBusinessId, setBusinessIdState] = useState<string>(DEMO_BIZ_ID);
  const [activePeriod, setPeriodState] = useState<string>(CONFIG.demo.periodCode);
  const [loading, setLoading] = useState(true);

  const refreshBusinesses = async () => {
    const response = await fetch('/api/businesses', { cache: 'no-store' });
    if (!response.ok) throw new Error('Could not load businesses');
    const payload = await response.json();
    setBusinesses(payload.businesses || []);
  };

  useEffect(() => {
    const storedBusiness = window.localStorage.getItem(BUSINESS_KEY);
    const storedPeriod = window.localStorage.getItem(PERIOD_KEY);
    if (storedBusiness) setBusinessIdState(storedBusiness);
    if (storedPeriod) setPeriodState(storedPeriod);
    refreshBusinesses().finally(() => setLoading(false));
  }, []);

  const setActiveBusinessId = (id: string) => {
    setBusinessIdState(id);
    window.localStorage.setItem(BUSINESS_KEY, id);
  };

  const setActivePeriod = (period: string) => {
    setPeriodState(period);
    window.localStorage.setItem(PERIOD_KEY, period);
  };

  const value = useMemo<WorkspaceValue>(() => ({
    businesses,
    activeBusiness: businesses.find((business) => business.id === activeBusinessId) || null,
    activeBusinessId,
    activePeriod,
    isDemo: activeBusinessId === DEMO_BIZ_ID,
    loading,
    setActiveBusinessId,
    setActivePeriod,
    refreshBusinesses,
  }), [businesses, activeBusinessId, activePeriod, loading]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error('useWorkspace must be used inside WorkspaceProvider');
  return value;
}

export const WORKSPACE_STORAGE_KEYS = { business: BUSINESS_KEY, period: PERIOD_KEY } as const;
