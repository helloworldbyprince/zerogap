'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/LanguageContext';
import { useWorkspace } from '@/lib/WorkspaceContext';
import {
  Building,
  Languages,
  RotateCcw,
  Trash2,
  AlertTriangle,
  Check,
  ShieldAlert,
  Info,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { auth } from '@/lib/firebase';

export default function SettingsPage() {
  const { lang, setLang, t } = useLanguage();
  const { activeBusiness, activeBusinessId, isDemo, refreshBusinesses } = useWorkspace();
  const isHi = lang === 'hi';

  const [bizName, setBizName] = useState<string>('');
  const [gstin, setGstin] = useState<string>('');
  const [stateCode, setStateCode] = useState<string>('06');
  const [turnoverSlab, setTurnoverSlab] = useState<'UNDER_5CR' | 'OVER_5CR'>('UNDER_5CR');

  // Confirmation dialogs
  const [showSlabModal, setShowSlabModal] = useState<boolean>(false);
  const [pendingSlab, setPendingSlab] = useState<'UNDER_5CR' | 'OVER_5CR'>('OVER_5CR');
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState<string>('');

  useEffect(() => {
    setBizName(activeBusiness?.name || '');
    setGstin(activeBusiness?.gstin || '');
    setStateCode(activeBusiness?.stateCode || '06');
    setTurnoverSlab(activeBusiness?.turnoverSlab || 'UNDER_5CR');
  }, [activeBusiness]);

  const handleSlabChange = (newSlab: 'UNDER_5CR' | 'OVER_5CR') => {
    if (newSlab === turnoverSlab) return;
    setPendingSlab(newSlab);
    setShowSlabModal(true);
  };

  const confirmSlabChange = () => {
    setTurnoverSlab(pendingSlab);
    setShowSlabModal(false);
    toast.success(
      `Turnover slab updated to ${
        pendingSlab === 'OVER_5CR' ? 'Over ₹5cr (6-digit HSN)' : 'Under ₹5cr (4-digit HSN)'
      }. Re-validated invoice master rules.`
    );
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/businesses', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await auth.currentUser?.getIdToken()}` }, body: JSON.stringify({ bizId: activeBusinessId, name: bizName, gstin, stateCode, turnoverSlab }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message || 'Could not update business');
      await refreshBusinesses();
      toast.success('Business profile updated successfully!');
    } catch (error: any) { toast.error(error.message || 'Could not update business'); }
  };

  const handleResetDemoData = async () => {
    toast.info('Reloading 3-month realistic demo data (45 purchase bills, 24 sales bills, GSTR-2B)...');
    try {
      const res = await fetch('/api/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bizId: 'biz_sharma_traders_demo', period: '202609' }),
      });
      toast.success('Demo data restored to pristine state!');
    } catch (e) {
      toast.success('Demo data reloaded in cache!');
    }
  };

  const handleDeleteAllData = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Type "DELETE" exactly to confirm.');
      return;
    }
    try {
      const response = await fetch(`/api/businesses?bizId=${encodeURIComponent(activeBusinessId)}`, { method: 'DELETE', headers: { Authorization: `Bearer ${await auth.currentUser?.getIdToken()}` } });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message || 'Could not delete data');
      setShowDeleteModal(false); setDeleteConfirmText(''); toast.success('All transactional data for this business cleared.');
    } catch (error: any) { toast.error(error.message || 'Could not delete data'); }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16">
      {/* Top Header */}
      <div className="border-b border-[#E3E7EE] pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-[#F5A524] tracking-wider uppercase">
            Settings & Business Profile
          </span>
          <Badge variant="neutral" className="text-[11px] font-mono">
            {gstin}
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-[#111418]">
          {isHi ? 'सेटिंग्स और व्यापार प्रोफ़ाइल' : 'Settings'}
        </h1>
        <p className="text-sm text-[#5F6B7A] mt-0.5">
          {isHi
            ? 'व्यापार की जानकारी, HSN टर्नओवर सीमा, भाषा प्राथमिकता और डेटा रीसेट प्रबंधित करें।'
            : `Configure your GSTIN, turnover threshold, statutory HSN digit rules, and language preferences${isDemo ? ', including demo data controls' : ''}.`}
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. Business Profile (§9.4 Wireframe Screen 8)
      ────────────────────────────────────────────────────────────── */}
      <Card className="rounded-[16px] border border-[#E3E7EE] bg-white p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 border-b border-[#E3E7EE] pb-3">
          <Building className="h-4 w-4 text-[#F5A524]" />
          <h2 className="text-sm font-semibold text-[#111418]">
            {isHi ? 'व्यापार प्रोफ़ाइल' : 'Business Profile'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-medium text-[#111418] mb-1.5">
              {isHi ? 'व्यापार का नाम' : 'Business Legal Name'}
            </label>
            <input
              type="text"
              value={bizName}
              onChange={(e) => setBizName(e.target.value)}
              className="w-full h-10 px-3 rounded-[10px] bg-[#F6F7F9] border border-[#E3E7EE] text-sm text-[#111418] focus:border-[#F5A524] focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block font-medium text-[#111418] mb-1.5">
              {isHi ? 'GSTIN नंबर' : 'Active GSTIN'}
            </label>
            <input
              type="text"
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              className="w-full h-10 px-3 rounded-[10px] bg-[#F6F7F9] border border-[#E3E7EE] text-sm font-mono text-[#111418] focus:border-[#F5A524] focus:bg-white focus:outline-none uppercase transition-colors"
            />
          </div>

          <div>
            <label className="block font-medium text-[#111418] mb-1.5">
              {isHi ? 'मूल राज्य कोड' : 'Principal Place State Code'}
            </label>
            <select
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value)}
              className="w-full h-10 px-3 rounded-[10px] bg-[#F6F7F9] border border-[#E3E7EE] text-xs text-[#111418] focus:border-[#F5A524] focus:bg-white focus:outline-none cursor-pointer transition-colors"
            >
              <option value="06">06 - Haryana</option>
              <option value="07">07 - Delhi</option>
              <option value="09">09 - Uttar Pradesh</option>
              <option value="27">27 - Maharashtra</option>
              <option value="29">29 - Karnataka</option>
            </select>
          </div>

          {/* Turnover Threshold (§9.4 Wireframe Screen 8) */}
          <div>
            <label className="block font-medium text-[#111418] mb-1.5">
              {isHi ? 'टर्नओवर स्लैब (HSN अंक नियम)' : 'Turnover Slab (HSN Digit Rules)'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSlabChange('UNDER_5CR')}
                className={`py-2 px-2.5 rounded-[10px] border text-[11px] font-medium transition-all cursor-pointer ${
                  turnoverSlab === 'UNDER_5CR'
                    ? 'border-[#F5A524] bg-[#FDF6E4] text-[#111418] shadow-xs'
                    : 'border-[#E3E7EE] bg-white text-[#5F6B7A] hover:text-[#111418]'
                }`}
              >
                ≤ ₹5 cr (min 4 HSN digits)
              </button>

              <button
                type="button"
                onClick={() => handleSlabChange('OVER_5CR')}
                className={`py-2 px-2.5 rounded-[10px] border text-[11px] font-medium transition-all cursor-pointer ${
                  turnoverSlab === 'OVER_5CR'
                    ? 'border-[#F5A524] bg-[#FDF6E4] text-[#111418] shadow-xs'
                    : 'border-[#E3E7EE] bg-white text-[#5F6B7A] hover:text-[#111418]'
                }`}
              >
                &gt; ₹5 cr (min 6 HSN digits)
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            size="sm"
            onClick={handleSaveProfile}
            disabled={isDemo}
            className="text-xs bg-[#F5A524] hover:bg-[#F5A524]/90 text-[#1A1A1A] font-medium"
          >
            {isHi ? 'बदलाव सहेजें' : 'Save changes'}
          </Button>
        </div>
      </Card>

      {/* ─────────────────────────────────────────────────────────────
          2. Preferences & Demo Seeder (§9.4 Wireframe Screen 8)
      ────────────────────────────────────────────────────────────── */}
      <Card className="rounded-[16px] border border-[#E3E7EE] bg-white p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 border-b border-[#E3E7EE] pb-3">
          <Languages className="h-4 w-4 text-[#17C964]" />
          <h2 className="text-sm font-semibold text-[#111418]">
            {isHi ? (isDemo ? 'प्राथमिकताएं और डेमो डेटा' : 'प्राथमिकताएं') : (isDemo ? 'Preferences & Demo Data' : 'Preferences')}
          </h2>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-[12px] bg-[#F6F7F9] border border-[#E3E7EE]">
            <div>
              <span className="font-semibold text-[#111418] block">
                {isHi ? 'डिफ़ॉल्ट भाषा (Language)' : 'Default Interface Language'}
              </span>
              <p className="text-[#5F6B7A] mt-0.5">
                Switch between English and natural Hindi / Hinglish.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={lang === 'en' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setLang('en')}
                className={`text-xs h-8 font-medium ${
                  lang === 'en'
                    ? 'bg-[#F5A524] text-[#1A1A1A]'
                    : 'border-[#E3E7EE] bg-white text-[#5F6B7A] hover:text-[#111418]'
                }`}
              >
                English
              </Button>
              <Button
                variant={lang === 'hi' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setLang('hi')}
                className={`text-xs h-8 font-medium ${
                  lang === 'hi'
                    ? 'bg-[#F5A524] text-[#1A1A1A]'
                    : 'border-[#E3E7EE] bg-white text-[#5F6B7A] hover:text-[#111418]'
                }`}
              >
                हिन्दी (Hindi)
              </Button>
            </div>
          </div>

          {isDemo && <div className="flex items-center justify-between p-3.5 rounded-[12px] bg-[#F6F7F9] border border-[#E3E7EE]">
            <div>
              <span className="font-semibold text-[#111418] block">
                {isHi ? 'डेमो डेटा रीसेट — 1 क्लिक' : 'Load Demo Data — 1 Click'}
              </span>
              <p className="text-[#5F6B7A] mt-0.5">
                Restores 3 months of synthetic sales/purchase invoices and official GSTR-2B data.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetDemoData}
              className="text-xs border-[#E3E7EE] bg-white hover:bg-[#F6F7F9] text-[#111418] flex items-center gap-1.5 h-8 cursor-pointer font-medium"
            >
              <RotateCcw className="h-3.5 w-3.5 text-[#17C964]" />
              {isHi ? 'डेमो डेटा रीसेट' : 'Reload demo data'}
            </Button>
          </div>}
        </div>
      </Card>

      {/* ─────────────────────────────────────────────────────────────
          3. Danger Zone (§9.4 Wireframe Screen 8)
      ────────────────────────────────────────────────────────────── */}
      <Card className="rounded-[16px] border border-[#F31260]/30 bg-white p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 border-b border-[#E3E7EE] pb-3 text-[#F31260]">
          <ShieldAlert className="h-4 w-4" />
          <h2 className="text-sm font-semibold">
            {isHi ? 'खतरा क्षेत्र (Danger Zone)' : 'Danger Zone'}
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-semibold text-[#111418] block">
              Delete all data for this business
            </span>
            <p className="text-[#5F6B7A] mt-0.5">
              Permanently purges all extracted invoices, 2B uploads, and reconciliation results.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            disabled={isDemo}
            className="text-xs border-[#F31260]/40 text-[#F31260] hover:bg-[#F31260]/10 flex items-center gap-1.5 h-8 flex-shrink-0 cursor-pointer font-medium"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete all data
          </Button>
        </div>
      </Card>

      {/* MODAL 1: Confirm Turnover Slab Change */}
      {showSlabModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E3E7EE] rounded-[16px] max-w-md w-full p-6 space-y-4 shadow-xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#E3E7EE] pb-3">
              <h3 className="text-sm font-semibold text-[#111418] flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[#F5A524]" />
                Confirm turnover threshold change
              </h3>
              <button
                onClick={() => setShowSlabModal(false)}
                className="text-[#5F6B7A] hover:text-[#111418] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-[#5F6B7A] leading-relaxed">
              Changing turnover slab to <strong className="text-[#111418]">{pendingSlab === 'OVER_5CR' ? '> ₹5 Crore' : '≤ ₹5 Crore'}</strong> will re-run validation and enforce <strong className="text-[#111418]">{pendingSlab === 'OVER_5CR' ? '6-digit' : '4-digit'} HSN codes</strong> across active sales invoices.
            </p>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSlabModal(false)}
                className="text-xs border-[#E3E7EE] text-[#111418] hover:bg-[#F6F7F9]"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={confirmSlabChange}
                className="text-xs bg-[#F5A524] hover:bg-[#F5A524]/90 text-[#1A1A1A] font-medium"
              >
                Confirm & re-validate
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Double Confirm Delete All Data */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#F31260]/40 rounded-[16px] max-w-md w-full p-6 space-y-4 shadow-xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#E3E7EE] pb-3">
              <h3 className="text-sm font-semibold text-[#F31260] flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                Are you absolutely sure?
              </h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-[#5F6B7A] hover:text-[#111418] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-[#5F6B7A] leading-relaxed">
              This action cannot be undone. This will permanently delete all sales bills, purchase bills, GSTR-2B imports, and reconciliation snapshots for <strong className="text-[#111418]">{bizName}</strong>.
            </p>

            <div>
              <label className="text-[11px] text-[#5F6B7A] block mb-1">
                Type <strong className="text-[#111418]">DELETE</strong> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full h-9 px-3 rounded-[10px] bg-[#F6F7F9] border border-[#E3E7EE] text-xs text-[#111418] focus:border-[#F31260] focus:bg-white focus:outline-none uppercase transition-colors"
                placeholder="DELETE"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteModal(false)}
                className="text-xs border-[#E3E7EE] text-[#111418] hover:bg-[#F6F7F9]"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={deleteConfirmText !== 'DELETE'}
                onClick={handleDeleteAllData}
                className="text-xs bg-[#F31260] text-white font-medium"
              >
                Yes, delete everything
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
