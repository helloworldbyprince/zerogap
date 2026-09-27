import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardMockCard } from '@/components/cards/DashboardMockCard';
import { LandingFaq } from '@/components/layout/LandingFaq';
import { CONFIG } from '@/lib/config';
import { COPY } from '@/lib/copy';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Play,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UploadCloud,
  Check,
} from 'lucide-react';

export default function LandingPage() {
  const t = COPY.en.landing;
  const nav = COPY.en.nav;

  const featureIcons = [
    <FileText key="f1" className="h-6 w-6 text-[#F5A524]" />,
    <Search key="f2" className="h-6 w-6 text-[#17C964]" />,
    <Scale key="f3" className="h-6 w-6 text-[#2563EB]" />,
    <TrendingUp key="f4" className="h-6 w-6 text-[#F5A524]" />,
  ];

  return (
    <div className="min-h-screen bg-[#F6F7F9] text-[#111418] flex flex-col selection:bg-[#F5A524] selection:text-[#1A1A1A]">
      {/* ─────────────────────────────────────────────────────────────
          1. TopNav
      ────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-[#E3E7EE] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-18 max-w-[1200px] items-center justify-between px-6">
          <Logo href="/" size="md" />

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#5F6B7A]">
            <a
              href="#features"
              className="hover:text-[#111418] transition-colors"
            >
              {nav.features}
            </a>
            <a
              href="#how-it-works"
              className="hover:text-[#111418] transition-colors"
            >
              {nav.howItWorks}
            </a>
            <a
              href="#faq"
              className="hover:text-[#111418] transition-colors"
            >
              {nav.faq}
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Button asChild variant="primary" size="default">
              <Link href="/onboarding?demo=1">
                {t.primaryCta}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. Hero Section
      ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-[#E3E7EE]">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.4] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #E3E7EE 1px, transparent 1px), linear-gradient(to bottom, #E3E7EE 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="mx-auto max-w-[1200px] px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headlines + CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#F5A524]/30 bg-[#FDF6E4] px-3.5 py-1 text-xs font-semibold text-[#9E6400]">
                <Sparkles className="h-3.5 w-3.5 text-[#F5A524]" />
                <span>{t.eyebrow}</span>
              </div>

              {/* H1 */}
              <h1 className="text-5xl sm:text-6xl font-semibold tracking-[-0.03em] text-[#111418] leading-[1.08]">
                <span>{t.h1Line1}</span>
                <br />
                <span className="text-[#F5A524]">{t.h1Line2}</span>
              </h1>

              {/* Subtitle */}
              <p className="max-w-xl text-base sm:text-lg text-[#5F6B7A] leading-relaxed">
                {t.sub}
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button asChild variant="primary" size="lg">
                  <Link href="/onboarding?demo=1">
                    {t.primaryCta}
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <a href="#how-it-works">{t.secondaryCta}</a>
                </Button>
              </div>

              {/* Quick stats pill */}
              <div className="flex flex-wrap items-center gap-6 pt-3 text-xs text-[#5F6B7A]">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#17C964] stroke-[3]" />
                  <span>Rule 88C / 88D compliance</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#17C964] stroke-[3]" />
                  <span>No GST password needed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#17C964] stroke-[3]" />
                  <span>1-click demo load</span>
                </div>
              </div>
            </div>

            {/* Right Column: Dashboard Mock Card */}
            <div className="lg:col-span-5 flex justify-center">
              <DashboardMockCard />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. Trust Strip
      ────────────────────────────────────────────────────────────── */}
      <section className="border-b border-[#E3E7EE] bg-white py-5">
        <div className="mx-auto max-w-[1200px] px-6 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm font-medium text-[#5F6B7A]">
            <span className="flex h-2 w-2 rounded-full bg-[#17C964]" />
            <span>{t.trustStrip}</span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. The 4 Feature Cards (Screen 0 §9.4 wireframe)
      ────────────────────────────────────────────────────────────── */}
      <section id="features" className="py-20 md:py-28 border-b border-[#E3E7EE] bg-white">
        <div className="mx-auto max-w-[1200px] px-6 space-y-12">
          {/* Section Heading */}
          <div className="space-y-3 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-[30px] font-semibold tracking-[-0.02em] text-[#111418]">
              {t.featuresTitle}
            </h2>
            <p className="text-sm sm:text-base text-[#5F6B7A]">
              {t.featuresSub}
            </p>
          </div>

          {/* Grid of 4 Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {t.featureCards.map((feat, index) => (
              <div
                key={feat.id}
                className="group relative rounded-[16px] border border-[#E3E7EE] bg-white p-7 transition-all duration-200 hover:border-[#F5A524] hover:shadow-md shadow-xs"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-[12px] bg-[#FDF6E4] border border-[#F5A524]/20">
                    {featureIcons[index]}
                  </div>
                  <span className="text-[11px] font-semibold text-[#9E6400] uppercase tracking-wider bg-[#FDF6E4] px-2.5 py-1 rounded-full border border-[#F5A524]/20">
                    {feat.tag}
                  </span>
                </div>

                <h3 className="text-[17px] font-medium text-[#111418] mb-2 group-hover:text-[#9E6400] transition-colors">
                  {feat.title}
                </h3>
                <p className="text-sm text-[#5F6B7A] leading-relaxed mb-6">
                  {feat.desc}
                </p>

                <div className="pt-4 border-t border-[#E3E7EE] flex items-center justify-between text-xs font-medium">
                  <span className="text-[#0F8C43] font-semibold">{feat.stat}</span>
                  <Link
                    href="/onboarding?demo=1"
                    className="flex items-center gap-1 text-[#9E6400] hover:underline"
                  >
                    Try feature
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. How it Works (4-step stepper)
      ────────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 md:py-28 border-b border-[#E3E7EE] bg-[#F6F7F9]">
        <div className="mx-auto max-w-[1200px] px-6 space-y-14">
          <div className="space-y-3 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-[30px] font-semibold tracking-[-0.02em] text-[#111418]">
              {t.howItWorksTitle}
            </h2>
            <p className="text-sm sm:text-base text-[#5F6B7A]">
              {t.howItWorksSub}
            </p>
          </div>

          {/* Stepper items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.steps.map((step) => (
              <div
                key={step.num}
                className="relative rounded-[16px] border border-[#E3E7EE] bg-white p-6 space-y-3 shadow-xs hover:border-[#CBD2DE] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#F5A524] font-semibold text-[#1A1A1A] text-sm shadow-xs">
                    {step.num}
                  </div>
                  <span className="text-[11px] uppercase tracking-wider text-[#5F6B7A] font-semibold">
                    Step {step.num}
                  </span>
                </div>
                <h4 className="text-base font-semibold text-[#111418] pt-1">
                  {step.title}
                </h4>
                <p className="text-xs sm:text-sm text-[#5F6B7A] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. Demo Band
      ────────────────────────────────────────────────────────────── */}
      <section className="py-16 border-b border-[#E3E7EE] bg-white">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="rounded-[16px] border border-[#F5A524]/30 bg-[#FDF6E4] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="space-y-2 text-left">
              <span className="text-xs font-semibold text-[#9E6400] uppercase tracking-widest">
                Interactive Preview
              </span>
              <h3 className="text-2xl sm:text-[30px] font-semibold tracking-[-0.02em] text-[#111418]">
                {t.demoBand.title}
              </h3>
              <p className="text-sm text-[#5F6B7A] max-w-xl">
                {t.demoBand.tagline}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button asChild variant="primary" size="lg">
                <Link href="/onboarding?demo=1">
                  <Play className="h-4 w-4 fill-current mr-1.5" />
                  {t.primaryCta}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. FAQ Section (4 items accordion)
      ────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 md:py-28 border-b border-[#E3E7EE] bg-[#F6F7F9]">
        <div className="mx-auto max-w-[1200px] px-6 space-y-12">
          <div className="space-y-3 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-[30px] font-semibold tracking-[-0.02em] text-[#111418]">
              {t.faqTitle}
            </h2>
            <p className="text-sm sm:text-base text-[#5F6B7A]">
              {t.faqSub}
            </p>
          </div>

          <LandingFaq />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. Footer
      ────────────────────────────────────────────────────────────── */}
      <footer className="py-12 bg-white">
        <div className="mx-auto max-w-[1200px] px-6 space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-[#E3E7EE]">
            <div>
              <Logo size="md" />
              <p className="text-xs text-[#5F6B7A] mt-2">
                {t.footer.tagline}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs font-semibold text-[#111418]">
                {t.footer.team}
              </p>
              <p className="text-xs text-[#5F6B7A] mt-1">
                Region: {CONFIG.region} · Cloud Run
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5F6B7A]">
            <p>{t.footer.disclaimer}</p>
            <p>© {new Date().getFullYear()} {CONFIG.app.name}. Built with Google Cloud.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
