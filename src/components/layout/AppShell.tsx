'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/layout/Logo';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Button } from '@/components/ui/button';
import { CONFIG } from '@/lib/config';
import { COPY, Language } from '@/lib/copy';
import { auth, signInWithGoogle, signOutUser, onAuthStateChanged, User } from '@/lib/firebase';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  Home,
  LogOut,
  Menu,
  Scale,
  Search,
  Settings,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  User as UserIcon,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [lang, setLang] = useState<Language>('en');
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(CONFIG.demo.businessName);
  const [selectedPeriod, setSelectedPeriod] = useState(CONFIG.demo.periodLabel);

  const t = COPY[lang];

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  const navItems = [
    {
      name: t.nav.dashboard,
      href: '/app',
      icon: Home,
      dot: 'emerald', // done
    },
    {
      name: t.nav.sales,
      href: '/app/sales',
      icon: FileText,
      dot: 'emerald', // 24 bills ready
    },
    {
      name: t.nav.purchases,
      href: '/app/purchases',
      icon: Search,
      dot: 'amber', // 94% match, 14 mismatches
    },
    {
      name: t.nav.triangle,
      href: '/app/triangle',
      icon: Scale,
      dot: 'red', // 1 gap
    },
    {
      name: t.nav.periods,
      href: '/app/periods',
      icon: Calendar,
      dot: 'grey',
    },
    {
      name: t.nav.reports,
      href: '/app/reports',
      icon: BarChart3,
      dot: 'grey',
    },
    {
      name: t.nav.settings,
      href: '/app/settings',
      icon: Settings,
      dot: 'grey',
    },
  ];

  const handleGoogleSignIn = async () => {
    const res = await signInWithGoogle();
    if (res.user) {
      toast.success(`Signed in as ${res.user.displayName || res.user.email}`);
    } else if (res.error) {
      toast.info('Using guest demo session.');
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    toast.success('Signed out');
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex transition-colors duration-200">
      {/* ─────────────────────────────────────────────────────────────
          1. Desktop Sidebar (240px)
      ────────────────────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-[240px] flex-col justify-between border-r border-[var(--color-border)] bg-[var(--color-surface)] p-5 shrink-0 sticky top-0 h-screen transition-colors">
        <div className="space-y-6">
          <div className="px-1 py-1">
            <Logo href="/app" size="sm" />
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-[12px] text-xs font-semibold transition-all ${
                    active
                      ? 'bg-[var(--color-surface-2)] text-[var(--color-amber)] border border-[var(--color-border)]'
                      : 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.name}</span>
                  </div>

                  {/* Status dot: emerald / amber / red / grey */}
                  <span
                    className={`h-2 w-2 rounded-full ${
                      item.dot === 'emerald'
                        ? 'bg-[var(--color-emerald)]'
                        : item.dot === 'amber'
                        ? 'bg-[var(--color-amber)]'
                        : item.dot === 'red'
                        ? 'bg-[var(--color-red)]'
                        : 'bg-[var(--color-border)]'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom / Help & Compliance Badge */}
        <div className="pt-4 border-t border-[var(--color-border)] space-y-3">
          <div className="p-3 rounded-[12px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[11px] text-[var(--color-muted)]">
            <p className="font-bold text-[var(--color-text)] mb-0.5">Rule 88D Compliance</p>
            <p>Next GSTR-1 due: {CONFIG.gstr1.dueDay}th of month</p>
          </div>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          2. Main Layout Shell (TopBar + Content)
      ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopBar */}
        <header className="sticky top-0 z-40 h-16 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md px-6 flex items-center justify-between transition-colors">
          {/* Left: Mobile hamburger + Business Switcher */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-[8px] border border-[var(--color-border)] text-[var(--color-muted)]"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            {/* Business Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-1.5 rounded-[10px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] hover:border-[var(--color-amber)]/40 transition-colors"
              >
                <span className="h-2 w-2 rounded-full bg-[var(--color-emerald)]" />
                <span className="truncate max-w-[130px] sm:max-w-[200px]">{selectedBusiness}</span>
                <ChevronDown className="h-3.5 w-3.5 text-[var(--color-muted)]" />
              </button>
            </div>

            {/* Period Picker Dropdown */}
            <div className="relative hidden sm:block">
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-1.5 rounded-[10px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] hover:border-[var(--color-amber)]/40 transition-colors"
              >
                <Calendar className="h-3.5 w-3.5 text-[var(--color-amber)]" />
                <span>{selectedPeriod}</span>
                <ChevronDown className="h-3.5 w-3.5 text-[var(--color-muted)]" />
              </button>
            </div>
          </div>

          {/* Right: EN / हिं Toggle + Theme Toggle + User Account */}
          <div className="flex items-center gap-3">
            {/* Hinglish Toggle Button (from §9.3 & §9.4) */}
            <button
              type="button"
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="px-2.5 py-1 rounded-[8px] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-xs font-bold text-[var(--color-text)] hover:border-[var(--color-amber)] transition-colors cursor-pointer"
              title="Toggle English / Hinglish"
            >
              {lang === 'en' ? 'EN / हिं' : 'हिं / EN'}
            </button>

            {/* Theme Switcher (Dark / Light) */}
            <ThemeToggle />

            {/* Google User Avatar / Sign-In Button */}
            {user ? (
              <div className="flex items-center gap-2">
                <div
                  className="h-8 w-8 rounded-full bg-[var(--color-amber)] text-[#0A0C10] font-bold text-xs flex items-center justify-center border border-[var(--color-border)] cursor-pointer"
                  title={user.email || 'Logged in'}
                  onClick={handleSignOut}
                >
                  {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                </div>
              </div>
            ) : (
              <Button
                type="button"
                onClick={handleGoogleSignIn}
                variant="secondary"
                size="sm"
                className="h-8 text-xs font-semibold"
              >
                <UserIcon className="h-3.5 w-3.5 mr-1" />
                Sign in
              </Button>
            )}
          </div>
        </header>

        {/* Page Content Viewport (max-width 1200 per §9.1) */}
        <main className="flex-1 p-6 md:p-8 max-w-[1200px] w-full mx-auto">
          {children}
        </main>

        {/* ─────────────────────────────────────────────────────────────
            3. Mobile Bottom Tab Bar (Dashboard, Sales, Purchases, Triangle, More)
        ────────────────────────────────────────────────────────────── */}
        <nav className="md:hidden sticky bottom-0 z-40 h-16 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-md px-2 flex items-center justify-around">
          {[
            { name: 'Dash', href: '/app', icon: Home },
            { name: 'Sales', href: '/app/sales', icon: FileText },
            { name: '2B Match', href: '/app/purchases', icon: Search },
            { name: 'Triangle', href: '/app/triangle', icon: Scale },
            { name: 'Reports', href: '/app/reports', icon: BarChart3 },
          ].map((tab) => {
            const active = pathname === tab.href;
            const TabIcon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center w-14 py-1 text-[10px] font-semibold transition-colors ${
                  active ? 'text-[var(--color-amber)]' : 'text-[var(--color-muted)]'
                }`}
              >
                <TabIcon className="h-4 w-4 mb-0.5" />
                <span>{tab.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
