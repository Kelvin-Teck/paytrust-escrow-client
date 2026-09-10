'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  href?: string;
  className?: string;
}

export function Logo({
  size = 'md',
  showText = true,
  href = '/',
  className = '',
}: LogoProps) {
  const dimension = size === 'sm' ? 24 : size === 'md' ? 32 : 40;
  const textSize = size === 'sm' ? 'text-base' : size === 'md' ? 'text-xl' : 'text-2xl';

  const content = (
    <div className={`flex items-center gap-2.5 group ${className}`}>
      <div className="relative shrink-0 transition-transform group-hover:scale-105">
        <Image
          src="/paytrust-logo.png"
          alt="PayTrust"
          width={dimension}
          height={dimension}
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <span className={`font-extrabold tracking-tight text-slate-900 ${textSize}`}>
          Pay<span className="text-[#32A05F]">Trust</span>
        </span>
      )}
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="focus:outline-none">
      {content}
    </Link>
  );
}

export default Logo;
