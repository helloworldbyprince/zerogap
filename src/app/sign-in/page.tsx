'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2, LogIn } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/button';
import { auth, onAuthStateChanged, signInWithGoogle } from '@/lib/firebase';

export default function SignInPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => onAuthStateChanged(auth, (user) => {
    setCheckingSession(false);
    if (user) router.replace('/app');
  }), [router]);

  const handleGoogleSignIn = async () => {
    if (signingIn) return;
    setSigningIn(true);
    setError('');

    const result = await signInWithGoogle();
    if (result.user) {
      router.replace('/app');
      return;
    }

    setSigningIn(false);
    if (result.error && !result.error.includes('popup-closed-by-user')) {
      setError(result.error);
    }
  };

  return (
    <main className="min-h-screen bg-[#F6F7F9] px-6 py-8 text-[#111418]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-10">
        <div className="flex items-center justify-between">
          <Logo href="/" size="md" />
          <Link href="/" className="flex items-center gap-1 text-xs font-medium text-[#5F6B7A] hover:text-[#111418]">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back home
          </Link>
        </div>

        <section className="rounded-[16px] border border-[#E3E7EE] bg-white p-8 shadow-xs">
          <div className="mb-7">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#FDF6E4] text-[#9E6400]">
              <LogIn className="h-5 w-5" />
            </div>
            <h1 className="text-[26px] font-semibold tracking-[-0.02em]">Sign in to ZeroGap</h1>
            <p className="mt-2 text-sm leading-relaxed text-[#5F6B7A]">
              Continue with your Google account to access your GST workspace.
            </p>
          </div>

          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={checkingSession || signingIn}
          >
            {(checkingSession || signingIn) ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            {checkingSession ? 'Checking session…' : signingIn ? 'Opening Google…' : 'Continue with Google'}
          </Button>

          {error && (
            <div role="alert" className="mt-4 rounded-[10px] border border-[#F31260]/25 bg-[#F31260]/5 p-3 text-xs leading-relaxed text-[#C70E4E]">
              Sign-in failed: {error}
            </div>
          )}

          <div className="mt-6 border-t border-[#E3E7EE] pt-5 text-center text-xs text-[#5F6B7A]">
            New to ZeroGap?{' '}
            <Link href="/onboarding" className="inline-flex items-center gap-1 font-semibold text-[#9E6400] hover:underline">
              Create your workspace
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
