"use client";

import React, { useState } from "react";

interface CountryFlagProps {
  code: string;
  name: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const CountryFlag: React.FC<CountryFlagProps> = ({
  code,
  name,
  className = "",
  size = "md",
}) => {
  const [hasError, setHasError] = useState(false);
  const lowerCode = code ? code.toLowerCase() : "ng";

  const sizeClasses = {
    sm: "w-4 h-3 min-w-[16px]",
    md: "w-5 h-3.5 min-w-[20px]",
    lg: "w-6 h-4 min-w-[24px]",
  }[size];

  if (hasError) {
    return (
      <span
        className={`inline-flex items-center justify-center bg-slate-200 text-slate-700 text-[10px] font-bold rounded-[3px] uppercase ${sizeClasses} ${className}`}
        title={name}
      >
        {code.slice(0, 2)}
      </span>
    );
  }

  return (
    <img
      src={`https://flagcdn.com/w40/${lowerCode}.png`}
      srcSet={`https://flagcdn.com/w80/${lowerCode}.png 2x`}
      alt={`${name} flag`}
      onError={() => setHasError(true)}
      loading="lazy"
      className={`rounded-[3px] object-cover shadow-[0_1px_2px_rgba(0,0,0,0.12)] border border-black/10 shrink-0 ${sizeClasses} ${className}`}
    />
  );
};

