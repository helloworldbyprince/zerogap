'use client';

import React, { useState } from 'react';
import { COPY } from '@/lib/copy';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqItems = COPY.en.landing.faq;

  return (
    <div className="space-y-3 max-w-3xl mx-auto">
      {faqItems.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={item.q}
            className="rounded-[16px] border border-[#E3E7EE] bg-white overflow-hidden transition-colors"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-medium text-[#111418] hover:text-[#F5A524] transition-colors cursor-pointer"
            >
              <span>{item.q}</span>
              <ChevronDown
                className={cn(
                  'h-5 w-5 text-[#5F6B7A] transition-transform duration-200 shrink-0 ml-4',
                  isOpen && 'rotate-180 text-[#F5A524]'
                )}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-5 pt-0 text-sm text-[#5F6B7A] leading-relaxed border-t border-[#E3E7EE] mt-1 pt-3">
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
