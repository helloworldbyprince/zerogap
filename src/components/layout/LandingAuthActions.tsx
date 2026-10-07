'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, LogIn, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { auth, onAuthStateChanged, signInWithGoogle, User } from '@/lib/firebase';

export function LandingAuthActions({ demoLabel }: { demoLabel: string }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  const handleSignIn = async () => {
    setSigningIn(true);
    const result = await signInWithGoogle();
    setSigningIn(false);

    if (result.user) {
      toast.success(`Welcome back, ${result.user.displayName || 'there'}!`);
      router.push('/app');
      return;
    }
    if (result.error && !result.error.includes('popup-closed-by-user')) {
      toast.error(result.error);
    }
  };

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
      <Button type="button" variant="ghost" size="sm" onClick={handleSignIn} disabled={signingIn}>
        <LogIn className="h-3.5 w-3.5 sm:hidden" />
        {signingIn ? 'Signing in…' : 'Sign in'}
      </Button>
      <Button asChild variant="secondary" size="sm">
        <Link href="/onboarding">
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
