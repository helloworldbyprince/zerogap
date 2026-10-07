'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2, UserPlus } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/button';
import { auth, onAuthStateChanged, signInWithGoogle } from '@/lib/firebase';

export default function SignUpPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => onAuthStateChanged(auth, (user) => {
    setCheckingSession(false);
    if (user) router.replace('/onboarding');
  }), [router]);

  const handleGoogleSignUp = async () => {
    if (creatingAccount) return;
    setCreatingAccount(true);
    setError('');

    const result = await signInWithGoogle();
    if (result.user) {
      router.replace('/onboarding');
      return;
    }

    setCreatingAccount(false);
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
              <UserPlus className="h-5 w-5" />
            </div>
            <h1 className="text-[26px] font-semibold tracking-[-0.02em]">Create your ZeroGap account</h1>
            <p className="mt-2 text-sm leading-relaxed text-[#5F6B7A]">
              Sign up with Google first. Next, we’ll set up your business and filing period.
            </p>
          </div>

          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={handleGoogleSignUp}
            disabled={checkingSession || creatingAccount}
          >
            {(checkingSession || creatingAccount) ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            {checkingSession ? 'Checking session…' : creatingAccount ? 'Opening Google…' : 'Sign up with Google'}
          </Button>

          {error && (
            <div role="alert" className="mt-4 rounded-[10px] border border-[#F31260]/25 bg-[#F31260]/5 p-3 text-xs leading-relaxed text-[#C70E4E]">
              Account creation failed: {error}
            </div>
          )}

          <p className="mt-4 text-center text-[11px] leading-relaxed text-[#5F6B7A]">
            By continuing, you agree to use ZeroGap for authorised business data only.
          </p>

          <div className="mt-6 border-t border-[#E3E7EE] pt-5 text-center text-xs text-[#5F6B7A]">
            Already have an account?{' '}
            <Link href="/sign-in" className="inline-flex items-center gap-1 font-semibold text-[#9E6400] hover:underline">
              Sign in
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
