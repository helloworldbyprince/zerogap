'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { auth, onAuthStateChanged, User } from '@/lib/firebase';

export function LandingAuthActions({ demoLabel }: { demoLabel: string }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  if (user) {
    return (
      <Button asChild variant="primary" size="sm">
        <Link href="/app">
          Open dashboard
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <Button asChild variant="ghost" size="sm">
        <Link href="/sign-in">
          <LogIn className="h-3.5 w-3.5 sm:hidden" />
          Sign in
        </Link>
      </Button>
      <Button asChild variant="secondary" size="sm">
        <Link href="/sign-up">
          <UserPlus className="h-3.5 w-3.5 sm:hidden" />
          Sign up
        </Link>
      </Button>
      <Button asChild variant="primary" size="sm" className="hidden sm:inline-flex">
        <Link href="/onboarding?demo=1">
          {demoLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </Button>
    </div>
  );
}
