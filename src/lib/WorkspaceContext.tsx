'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CONFIG } from './config';
import { auth, onAuthStateChanged } from './firebase';

export interface WorkspaceBusiness {
  id: string;
  name: string;
  gstin: string;
  stateCode: string;
  turnoverSlab: 'UNDER_5CR' | 'OVER_5CR';
}

const DEMO_BIZ_ID = 'biz_sharma_traders_demo';
const BUSINESS_KEY = 'zerogap.activeBusinessId';
const BUSINESS_GSTIN_KEY = 'zerogap.activeBusinessGstin';
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

  const loadBusinesses = async (): Promise<WorkspaceBusiness[]> => {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch('/api/businesses', {
      cache: 'no-store',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('Could not load businesses');
    const payload = await response.json();
    const nextBusinesses = payload.businesses || [];
    setBusinesses(nextBusinesses);
    return nextBusinesses;
  };

  const refreshBusinesses = async () => { await loadBusinesses(); };

  useEffect(() => {
    const storedBusiness = window.localStorage.getItem(BUSINESS_KEY);
    const storedGstin = window.localStorage.getItem(BUSINESS_GSTIN_KEY);
    const storedPeriod = window.localStorage.getItem(PERIOD_KEY);
    if (storedPeriod) setPeriodState(storedPeriod);
    const unsubscribe = onAuthStateChanged(auth, () => loadBusinesses()
      .then((available) => {
        const exact = available.find((business) => business.id === storedBusiness);
        const sameGstin = storedGstin
          ? available.find((business) => business.gstin === storedGstin)
          : null;
        const replacement = storedBusiness && storedBusiness !== DEMO_BIZ_ID
          ? [...available].reverse().find((business) => business.id !== DEMO_BIZ_ID)
          : null;
        const selected = exact || sameGstin || replacement || available.find((business) => business.id === DEMO_BIZ_ID) || available[0];
        if (selected) {
          setBusinessIdState(selected.id);
          window.localStorage.setItem(BUSINESS_KEY, selected.id);
          window.localStorage.setItem(BUSINESS_GSTIN_KEY, selected.gstin);
        }
      })
      .finally(() => setLoading(false)));
    return unsubscribe;
  }, []);

  const setActiveBusinessId = (id: string) => {
    setBusinessIdState(id);
    window.localStorage.setItem(BUSINESS_KEY, id);
    const selected = businesses.find((business) => business.id === id);
    if (selected) window.localStorage.setItem(BUSINESS_GSTIN_KEY, selected.gstin);
  };

  const setActivePeriod = (period: string) => {
    setPeriodState(period);
    window.localStorage.setItem(PERIOD_KEY, period);
  };

  const value = useMemo<WorkspaceValue>(() => {
    const activeBusiness = businesses.find((business) => business.id === activeBusinessId) || null;
    return {
      businesses,
      activeBusiness,
      activeBusinessId,
      activePeriod,
      isDemo: activeBusiness?.id === DEMO_BIZ_ID,
      loading,
      setActiveBusinessId,
      setActivePeriod,
      refreshBusinesses,
    };
  }, [businesses, activeBusinessId, activePeriod, loading]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error('useWorkspace must be used inside WorkspaceProvider');
  return value;
}

export const WORKSPACE_STORAGE_KEYS = { business: BUSINESS_KEY, businessGstin: BUSINESS_GSTIN_KEY, period: PERIOD_KEY } as const;
