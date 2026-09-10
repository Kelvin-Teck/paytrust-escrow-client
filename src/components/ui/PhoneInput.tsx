"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  COUNTRIES,
  Country,
  DEFAULT_COUNTRY,
  getCountryByCode,
  findCountryFromPhone,
} from "@/data/countries";
import { ChevronDown, Search, Check, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PhoneInputProps {
  value?: string;
  defaultCountryCode?: string;
  onChange: (fullE164: string, country: Country, nationalNumber: string) => void;
  onCountryChange?: (country: Country) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value = "",
  defaultCountryCode = "NG",
  onChange,
  onCountryChange,
  placeholder,
  required = false,
  disabled = false,
  className = "",
  id,
  name,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(() =>
    getCountryByCode(defaultCountryCode)
  );
  const [nationalNumber, setNationalNumber] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Sync incoming value prop
  useEffect(() => {
    if (!value) {
      setNationalNumber("");
      return;
    }

    if (value.startsWith("+")) {
      const detected = findCountryFromPhone(value);
      if (detected) {
        setSelectedCountry(detected.country);
        setNationalNumber(detected.nationalNumber);
        return;
      }
    }

    // If it doesn't start with +, assume it's national number for current country
    setNationalNumber(value.replace(selectedCountry.dialCode, "").trim());
  }, [value, selectedCountry.dialCode]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Auto-focus search input when opening
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Filter countries by name, code or dial code
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return COUNTRIES;
    const q = searchQuery.toLowerCase().trim().replace("+", "");
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.dialCode.replace("+", "").includes(q)
    );
  }, [searchQuery]);

  const handleSelectCountry = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery("");
    if (onCountryChange) onCountryChange(country);

    // Compute updated full E.164
    const cleanNum = nationalNumber.replace(/^0+/, "").replace(/[\s\-\(\)]/g, "");
    const fullE164 = cleanNum ? `${country.dialCode}${cleanNum}` : "";
    onChange(fullE164, country, nationalNumber);

    // Return focus to phone input
    phoneInputRef.current?.focus();
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;

    // Check if user pasted/typed a number with international +
    if (rawVal.startsWith("+")) {
      const detected = findCountryFromPhone(rawVal);
      if (detected) {
        setSelectedCountry(detected.country);
        setNationalNumber(detected.nationalNumber);
        if (onCountryChange) onCountryChange(detected.country);

        const cleanNum = detected.nationalNumber.replace(/^0+/, "").replace(/[\s\-\(\)]/g, "");
        const fullE164 = cleanNum ? `${detected.country.dialCode}${cleanNum}` : "";
        onChange(fullE164, detected.country, detected.nationalNumber);
        return;
      }
    }

    setNationalNumber(rawVal);
    const cleanNum = rawVal.replace(/^0+/, "").replace(/[\s\-\(\)]/g, "");
    const fullE164 = cleanNum ? `${selectedCountry.dialCode}${cleanNum}` : "";
    onChange(fullE164, selectedCountry, rawVal);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="relative flex items-center rounded-2xl bg-slate-50 border border-slate-200 focus-within:bg-white focus-within:border-[#32A05F] focus-within:ring-2 focus-within:ring-[#32A05F]/20 transition-all">
        {/* Country Selector Trigger */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3.5 py-3.5 border-r border-slate-200 hover:bg-slate-100/80 active:bg-slate-200/60 rounded-l-2xl text-slate-800 font-semibold text-xs sm:text-sm shrink-0 transition-colors focus:outline-none"
          title={`${selectedCountry.name} (${selectedCountry.dialCode})`}
          aria-label="Select Country"
          aria-expanded={isOpen}
        >
          <span className="text-lg leading-none" role="img" aria-label={selectedCountry.name}>
            {selectedCountry.flag}
          </span>
          <span className="font-mono text-xs font-bold text-slate-700">
            {selectedCountry.dialCode}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* National Number Input */}
        <div className="relative flex-1 flex items-center">
          <Phone className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none sm:hidden" />
          <input
            ref={phoneInputRef}
            id={id}
            name={name}
            type="tel"
            required={required}
            disabled={disabled}
            value={nationalNumber}
            onChange={handleNumberChange}
            placeholder={placeholder || selectedCountry.placeholder}
            className="w-full pl-3 pr-4 py-3.5 bg-transparent text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none disabled:opacity-50"
          />
        </div>
      </div>

      {/* Country Dropdown Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 top-full mt-2 w-full max-w-sm sm:w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden flex flex-col max-h-80"
          >
            {/* Search Input */}
            <div className="p-3 border-b border-slate-100 bg-slate-50/70">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search country or code..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#32A05F]/30 focus:border-[#32A05F]"
                />
              </div>
            </div>

            {/* Countries Scrollable List */}
            <div className="overflow-y-auto flex-1 divide-y divide-slate-50 py-1 scrollbar-thin">
              {filteredCountries.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No matching countries found
                </div>
              ) : (
                filteredCountries.map((c) => {
                  const isSelected = c.code === selectedCountry.code;
                  return (
                    <button
                      key={`${c.code}-${c.dialCode}`}
                      type="button"
                      onClick={() => handleSelectCountry(c)}
                      className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors text-xs ${
                        isSelected ? "bg-[#32A05F]/10 text-[#28874E] font-bold" : "text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-base shrink-0">{c.flag}</span>
                        <span className="truncate font-medium">{c.name}</span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          ({c.code})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="font-mono text-slate-500 font-semibold">
                          {c.dialCode}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#32A05F]" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

