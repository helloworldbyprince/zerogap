'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/layout/Logo';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Button } from '@/components/ui/button';
import { CONFIG } from '@/lib/config';
import { LanguageProvider, useLanguage } from '@/lib/LanguageContext';
import { auth, signInWithGoogle, signOutUser, onAuthStateChanged, User } from '@/lib/firebase';
import {
  BarChart3,
  Calendar,
  ChevronDown,
  FileText,
  Home,
  Menu,
  Scale,
  Search,
  Settings,
  User as UserIcon,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface AppShellProps {
  children: React.ReactNode;
}

function AppShellInner({ children }: AppShellProps) {
  const pathname = usePathname();
  const { lang, toggleLang, t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedBusiness] = useState(CONFIG.demo.businessName);
  const [selectedPeriod] = useState(CONFIG.demo.periodLabel);

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
      dot: 'amber', // 94% match
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

  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const res = await signInWithGoogle();
      if (res.user) {
        toast.success(`Signed in as ${res.user.displayName || res.user.email}`);
      } else if (res.error) {
        // If popup closed by user, don't show noisy error
        if (res.error.includes('popup-closed-by-user')) {
          toast.info('Sign-in cancelled');
        } else {
          toast.error(res.error);
        }
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to sign in');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    toast.success('Signed out');
  };

  return (
    <div className="min-h-screen bg-[#F6F7F9] text-[#111418] flex font-sans">
      {/* ─────────────────────────────────────────────────────────────
          1. Desktop Sidebar (240px)
      ────────────────────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-[240px] flex-col justify-between border-r border-[#E3E7EE] bg-white p-5 shrink-0 sticky top-0 h-screen">
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
                  className={`flex items-center justify-between px-3 py-2.5 rounded-[12px] text-xs font-medium transition-all ${
                    active
                      ? 'bg-[#FDF6E4] text-[#9E6400] border border-[#F5A524]/30 shadow-xs'
                      : 'text-[#5F6B7A] hover:text-[#111418] hover:bg-[#F6F7F9]'
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
                        ? 'bg-[#17C964]'
                        : item.dot === 'amber'
                        ? 'bg-[#F5A524]'
                        : item.dot === 'red'
                        ? 'bg-[#F31260]'
                        : 'bg-[#E3E7EE]'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom / Help & Compliance Badge */}
        <div className="pt-4 border-t border-[#E3E7EE] space-y-3">
          <div className="p-3 rounded-[12px] bg-[#F6F7F9] border border-[#E3E7EE] text-[11px] text-[#5F6B7A]">
            <p className="font-semibold text-[#111418] mb-0.5">Rule 88D Compliance</p>
            <p>Next GSTR-1 due: {CONFIG.gstr1.dueDay}th of month</p>
          </div>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          2. Main Layout Shell (TopBar + Content)
      ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopBar */}
        <header className="sticky top-0 z-40 h-16 border-b border-[#E3E7EE] bg-white/95 backdrop-blur-md px-6 flex items-center justify-between">
          {/* Left: Mobile hamburger + Business Switcher */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-[8px] border border-[#E3E7EE] text-[#5F6B7A]"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            {/* Business Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-1.5 rounded-[10px] bg-[#F6F7F9] border border-[#E3E7EE] text-xs font-medium text-[#111418] hover:border-[#CBD2DE] transition-colors"
              >
                <span className="h-2 w-2 rounded-full bg-[#17C964]" />
                <span className="truncate max-w-[130px] sm:max-w-[200px]">{selectedBusiness}</span>
                <ChevronDown className="h-3.5 w-3.5 text-[#5F6B7A]" />
              </button>
            </div>

            {/* Period Picker Dropdown */}
            <div className="relative hidden sm:block">
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-1.5 rounded-[10px] bg-[#F6F7F9] border border-[#E3E7EE] text-xs font-medium text-[#111418] hover:border-[#CBD2DE] transition-colors"
              >
                <Calendar className="h-3.5 w-3.5 text-[#F5A524]" />
                <span>{selectedPeriod}</span>
                <ChevronDown className="h-3.5 w-3.5 text-[#5F6B7A]" />
              </button>
            </div>
          </div>

          {/* Right: EN / हिं Toggle + User Account */}
          <div className="flex items-center gap-3">
            {/* Hinglish Toggle Button (from §9.3 & §9.4) */}
            <button
              type="button"
              onClick={toggleLang}
              className="px-2.5 py-1 rounded-[8px] border border-[#E3E7EE] bg-[#F6F7F9] text-xs font-semibold text-[#111418] hover:border-[#F5A524] transition-colors cursor-pointer"
              title="Toggle English / Hinglish"
            >
              {lang === 'en' ? 'EN / हिं' : 'हिं / EN'}
            </button>

            <ThemeToggle />

            {/* Google User Avatar / Sign-In Button */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-[10px] bg-white border border-[#E3E7EE] hover:border-[#F5A524] transition-colors cursor-pointer shadow-xs"
                  title={`${user.displayName || user.email || 'User'} — click to sign out`}
                  onClick={handleSignOut}
                >
                  <div className="h-6 w-6 rounded-full bg-[#F5A524] text-[#1A1A1A] font-bold text-xs flex items-center justify-center overflow-hidden shrink-0">
                    {user.photoURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.photoURL} alt={user.displayName || 'User'} className="h-full w-full object-cover" />
                    ) : (
                      <span>{user.displayName ? user.displayName[0].toUpperCase() : 'U'}</span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-[#111418] max-w-[120px] truncate hidden sm:inline">
                    {user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'User'}
                  </span>
                </button>
              </div>
            ) : (
              <Button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                variant="secondary"
                size="sm"
                className="h-8 text-xs font-medium cursor-pointer"
              >
                <UserIcon className="h-3.5 w-3.5 mr-1" />
                {isSigningIn ? 'Signing in...' : 'Sign in'}
              </Button>
            )}
          </div>
        </header>

        {/* Page Content Viewport (max-width 1200 per §9.1) */}
        <main className="flex-1 p-6 md:p-8 max-w-[1200px] w-full mx-auto">
          {children}
        </main>

        {/* ─────────────────────────────────────────────────────────────
            3. Mobile Bottom Tab Bar
        ────────────────────────────────────────────────────────────── */}
        <nav className="md:hidden sticky bottom-0 z-40 h-16 border-t border-[#E3E7EE] bg-white/95 backdrop-blur-md px-2 flex items-center justify-around">
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
                className={`flex flex-col items-center justify-center w-14 py-1 text-[10px] font-medium transition-colors ${
                  active ? 'text-[#9E6400] font-semibold' : 'text-[#5F6B7A]'
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

export function AppShell({ children }: AppShellProps) {
  return (
    <LanguageProvider>
      <AppShellInner>{children}</AppShellInner>
    </LanguageProvider>
  );
}
