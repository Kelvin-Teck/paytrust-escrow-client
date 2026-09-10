export interface Country {
  name: string;
  code: string; // ISO 3166-1 alpha-2
  dialCode: string; // e.g. "+234"
  flag: string; // Emoji flag
  placeholder: string;
}

export const COUNTRIES: Country[] = [
  // Primary & Popular African / Global trading hubs first
  { name: "Nigeria", code: "NG", dialCode: "+234", flag: "🇳🇬", placeholder: "801 234 5678" },
  { name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸", placeholder: "(555) 000-0000" },
  { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "🇬🇧", placeholder: "7911 123456" },
  { name: "Canada", code: "CA", dialCode: "+1", flag: "🇨🇦", placeholder: "(555) 000-0000" },
  { name: "Ghana", code: "GH", dialCode: "+233", flag: "🇬🇭", placeholder: "24 123 4567" },
  { name: "Kenya", code: "KE", dialCode: "+254", flag: "🇰🇪", placeholder: "712 345678" },
  { name: "South Africa", code: "ZA", dialCode: "+27", flag: "🇿🇦", placeholder: "82 123 4567" },
  { name: "United Arab Emirates", code: "AE", dialCode: "+971", flag: "🇦🇪", placeholder: "50 123 4567" },
  { name: "Germany", code: "DE", dialCode: "+49", flag: "🇩🇪", placeholder: "151 12345678" },
  { name: "France", code: "FR", dialCode: "+33", flag: "🇫🇷", placeholder: "6 12 34 56 78" },
  { name: "India", code: "IN", dialCode: "+91", flag: "🇮🇳", placeholder: "98765 43210" },
  { name: "China", code: "CN", dialCode: "+86", flag: "🇨🇳", placeholder: "138 0013 8000" },
  { name: "Australia", code: "AU", dialCode: "+61", flag: "🇦🇺", placeholder: "412 345 678" },
  { name: "Rwanda", code: "RW", dialCode: "+250", flag: "🇷🇼", placeholder: "788 123 456" },
  { name: "Egypt", code: "EG", dialCode: "+20", flag: "🇪🇬", placeholder: "100 123 4567" },
  { name: "Uganda", code: "UG", dialCode: "+256", flag: "🇺🇬", placeholder: "772 123456" },
  { name: "Tanzania", code: "TZ", dialCode: "+255", flag: "🇹🇿", placeholder: "754 123 456" },
  { name: "Cameroon", code: "CM", dialCode: "+237", flag: "🇨🇲", placeholder: "6 71 23 45 67" },
  { name: "Ivory Coast", code: "CI", dialCode: "+225", flag: "🇨🇮", placeholder: "07 08 12 34 56" },
  { name: "Senegal", code: "SN", dialCode: "+221", flag: "🇸🇳", placeholder: "77 123 45 67" },

  // Alphabetical list of remaining world nations
  { name: "Afghanistan", code: "AF", dialCode: "+93", flag: "🇦🇫", placeholder: "70 123 4567" },
  { name: "Albania", code: "AL", dialCode: "+355", flag: "🇦🇱", placeholder: "69 123 4567" },
  { name: "Algeria", code: "DZ", dialCode: "+213", flag: "🇩🇿", placeholder: "551 23 45 67" },
  { name: "Andorra", code: "AD", dialCode: "+376", flag: "🇦🇩", placeholder: "312 345" },
  { name: "Angola", code: "AO", dialCode: "+244", flag: "🇦🇴", placeholder: "923 123 456" },
  { name: "Argentina", code: "AR", dialCode: "+54", flag: "🇦🇷", placeholder: "9 11 1234-5678" },
  { name: "Armenia", code: "AM", dialCode: "+374", flag: "🇦🇲", placeholder: "77 123456" },
  { name: "Austria", code: "AT", dialCode: "+43", flag: "🇦🇹", placeholder: "664 1234567" },
  { name: "Azerbaijan", code: "AZ", dialCode: "+994", flag: "🇦🇿", placeholder: "50 123 45 67" },
  { name: "Bahamas", code: "BS", dialCode: "+1242", flag: "🇧🇸", placeholder: "359 1234" },
  { name: "Bahrain", code: "BH", dialCode: "+973", flag: "🇧🇭", placeholder: "3912 3456" },
  { name: "Bangladesh", code: "BD", dialCode: "+880", flag: "🇧🇩", placeholder: "1712-345678" },
  { name: "Barbados", code: "BB", dialCode: "+1246", flag: "🇧🇧", placeholder: "256 1234" },
  { name: "Belarus", code: "BY", dialCode: "+375", flag: "🇧🇾", placeholder: "29 123-45-67" },
  { name: "Belgium", code: "BE", dialCode: "+32", flag: "🇧🇪", placeholder: "470 12 34 56" },
  { name: "Belize", code: "BZ", dialCode: "+501", flag: "🇧🇿", placeholder: "622-1234" },
  { name: "Benin", code: "BJ", dialCode: "+229", flag: "🇧🇯", placeholder: "97 12 34 56" },
  { name: "Bermuda", code: "BM", dialCode: "+1441", flag: "🇧🇲", placeholder: "599 1234" },
  { name: "Bhutan", code: "BT", dialCode: "+975", flag: "🇧🇹", placeholder: "17 12 34 56" },
  { name: "Bolivia", code: "BO", dialCode: "+591", flag: "🇧🇴", placeholder: "71234567" },
  { name: "Bosnia and Herzegovina", code: "BA", dialCode: "+387", flag: "🇧🇦", placeholder: "61 123 456" },
  { name: "Botswana", code: "BW", dialCode: "+267", flag: "🇧🇼", placeholder: "71 123 456" },
  { name: "Brazil", code: "BR", dialCode: "+55", flag: "🇧🇷", placeholder: "11 91234-5678" },
  { name: "Bulgaria", code: "BG", dialCode: "+359", flag: "🇧🇬", placeholder: "87 123 4567" },
  { name: "Burkina Faso", code: "BF", dialCode: "+226", flag: "🇧🇫", placeholder: "70 12 34 56" },
  { name: "Burundi", code: "BI", dialCode: "+257", flag: "🇧🇮", placeholder: "79 12 34 56" },
  { name: "Cambodia", code: "KH", dialCode: "+855", flag: "🇰🇭", placeholder: "12 345 678" },
  { name: "Cape Verde", code: "CV", dialCode: "+238", flag: "🇨🇻", placeholder: "991 12 34" },
  { name: "Chile", code: "CL", dialCode: "+56", flag: "🇨🇱", placeholder: "9 1234 5678" },
  { name: "Colombia", code: "CO", dialCode: "+57", flag: "🇨🇴", placeholder: "300 1234567" },
  { name: "Congo (DRC)", code: "CD", dialCode: "+243", flag: "🇨🇩", placeholder: "81 123 4567" },
  { name: "Congo (Republic)", code: "CG", dialCode: "+242", flag: "🇨🇬", placeholder: "06 123 4567" },
  { name: "Costa Rica", code: "CR", dialCode: "+506", flag: "🇨🇷", placeholder: "8312 3456" },
  { name: "Croatia", code: "HR", dialCode: "+385", flag: "🇭🇷", placeholder: "91 123 4567" },
  { name: "Cyprus", code: "CY", dialCode: "+357", flag: "🇨🇾", placeholder: "96 123456" },
  { name: "Czech Republic", code: "CZ", dialCode: "+420", flag: "🇨🇿", placeholder: "601 123 456" },
  { name: "Denmark", code: "DK", dialCode: "+45", flag: "🇩🇰", placeholder: "20 12 34 56" },
  { name: "Dominican Republic", code: "DO", dialCode: "+1809", flag: "🇩🇴", placeholder: "234 5678" },
  { name: "Ecuador", code: "EC", dialCode: "+593", flag: "🇪🇨", placeholder: "99 123 4567" },
  { name: "Estonia", code: "EE", dialCode: "+372", flag: "🇪🇪", placeholder: "5123 4567" },
  { name: "Ethiopia", code: "ET", dialCode: "+251", flag: "🇪🇹", placeholder: "91 123 4567" },
  { name: "Finland", code: "FI", dialCode: "+358", flag: "🇫🇮", placeholder: "40 1234567" },
  { name: "Gambia", code: "GM", dialCode: "+220", flag: "🇬🇲", placeholder: "701 2345" },
  { name: "Georgia", code: "GE", dialCode: "+995", flag: "🇬🇪", placeholder: "555 12 34 56" },
  { name: "Greece", code: "GR", dialCode: "+30", flag: "🇬🇷", placeholder: "691 234 5678" },
  { name: "Hong Kong", code: "HK", dialCode: "+852", flag: "🇭🇰", placeholder: "5123 4567" },
  { name: "Hungary", code: "HU", dialCode: "+36", flag: "🇭🇺", placeholder: "20 123 4567" },
  { name: "Iceland", code: "IS", dialCode: "+354", flag: "🇮🇸", placeholder: "612 3456" },
  { name: "Indonesia", code: "ID", dialCode: "+62", flag: "🇮🇩", placeholder: "812-345-678" },
  { name: "Ireland", code: "IE", dialCode: "+353", flag: "🇮🇪", placeholder: "85 123 4567" },
  { name: "Israel", code: "IL", dialCode: "+972", flag: "🇮🇱", placeholder: "50-123-4567" },
  { name: "Italy", code: "IT", dialCode: "+39", flag: "🇮🇹", placeholder: "320 123 4567" },
  { name: "Jamaica", code: "JM", dialCode: "+1876", flag: "🇯🇲", placeholder: "301 2345" },
  { name: "Japan", code: "JP", dialCode: "+81", flag: "🇯🇵", placeholder: "90-1234-5678" },
  { name: "Jordan", code: "JO", dialCode: "+962", flag: "🇯🇴", placeholder: "7 9012 3456" },
  { name: "Kazakhstan", code: "KZ", dialCode: "+7", flag: "🇰🇿", placeholder: "701 123 4567" },
  { name: "Kuwait", code: "KW", dialCode: "+965", flag: "🇰🇼", placeholder: "5012 3456" },
  { name: "Lebanon", code: "LB", dialCode: "+961", flag: "🇱🇧", placeholder: "70 123 456" },
  { name: "Liberia", code: "LR", dialCode: "+231", flag: "🇱🇷", placeholder: "77 012 3456" },
  { name: "Lithuania", code: "LT", dialCode: "+370", flag: "🇱🇹", placeholder: "612 34567" },
  { name: "Luxembourg", code: "LU", dialCode: "+352", flag: "🇱🇺", placeholder: "621 123 456" },
  { name: "Malaysia", code: "MY", dialCode: "+60", flag: "🇲🇾", placeholder: "12-345 6789" },
  { name: "Mali", code: "ML", dialCode: "+223", flag: "🇲🇱", placeholder: "65 12 34 56" },
  { name: "Malta", code: "MT", dialCode: "+356", flag: "🇲🇹", placeholder: "9912 3456" },
  { name: "Mauritius", code: "MU", dialCode: "+230", flag: "🇲🇺", placeholder: "5123 4567" },
  { name: "Mexico", code: "MX", dialCode: "+52", flag: "🇲🇽", placeholder: "1 55 1234 5678" },
  { name: "Morocco", code: "MA", dialCode: "+212", flag: "🇲🇦", placeholder: "661-234567" },
  { name: "Mozambique", code: "MZ", dialCode: "+258", flag: "🇲🇿", placeholder: "84 123 4567" },
  { name: "Namibia", code: "NA", dialCode: "+264", flag: "🇳🇦", placeholder: "81 123 4567" },
  { name: "Netherlands", code: "NL", dialCode: "+31", flag: "🇳🇱", placeholder: "6 12345678" },
  { name: "New Zealand", code: "NZ", dialCode: "+64", flag: "🇳🇿", placeholder: "21 123 456" },
  { name: "Niger", code: "NE", dialCode: "+227", flag: "🇳🇪", placeholder: "90 12 34 56" },
  { name: "Norway", code: "NO", dialCode: "+47", flag: "🇳🇴", placeholder: "412 34 567" },
  { name: "Oman", code: "OM", dialCode: "+968", flag: "🇴🇲", placeholder: "9123 4567" },
  { name: "Pakistan", code: "PK", dialCode: "+92", flag: "🇵🇰", placeholder: "301 2345678" },
  { name: "Panama", code: "PA", dialCode: "+507", flag: "🇵🇦", placeholder: "6123-4567" },
  { name: "Peru", code: "PE", dialCode: "+51", flag: "🇵🇪", placeholder: "912 345 678" },
  { name: "Philippines", code: "PH", dialCode: "+63", flag: "🇵🇭", placeholder: "917 123 4567" },
  { name: "Poland", code: "PL", dialCode: "+48", flag: "🇵🇱", placeholder: "512 345 678" },
  { name: "Portugal", code: "PT", dialCode: "+351", flag: "🇵🇹", placeholder: "912 345 678" },
  { name: "Qatar", code: "QA", dialCode: "+974", flag: "🇶🇦", placeholder: "3312 3456" },
  { name: "Romania", code: "RO", dialCode: "+40", flag: "🇷🇴", placeholder: "712 345 678" },
  { name: "Saudi Arabia", code: "SA", dialCode: "+966", flag: "🇸🇦", placeholder: "50 123 4567" },
  { name: "Sierra Leone", code: "SL", dialCode: "+232", flag: "🇸🇱", placeholder: "76 123456" },
  { name: "Singapore", code: "SG", dialCode: "+65", flag: "🇸🇬", placeholder: "8123 4567" },
  { name: "South Korea", code: "KR", dialCode: "+82", flag: "🇰🇷", placeholder: "10-1234-5678" },
  { name: "Spain", code: "ES", dialCode: "+34", flag: "🇪🇸", placeholder: "612 34 56 78" },
  { name: "Sri Lanka", code: "LK", dialCode: "+94", flag: "🇱🇰", placeholder: "71 234 5678" },
  { name: "Sweden", code: "SE", dialCode: "+46", flag: "🇸🇪", placeholder: "70 123 45 67" },
  { name: "Switzerland", code: "CH", dialCode: "+41", flag: "🇨🇭", placeholder: "78 123 45 67" },
  { name: "Thailand", code: "TH", dialCode: "+66", flag: "🇹🇭", placeholder: "81 234 5678" },
  { name: "Togo", code: "TG", dialCode: "+228", flag: "🇹🇬", placeholder: "90 12 34 56" },
  { name: "Trinidad and Tobago", code: "TT", dialCode: "+1868", flag: "🇹🇹", placeholder: "291 1234" },
  { name: "Tunisia", code: "TN", dialCode: "+216", flag: "🇹🇳", placeholder: "20 123 456" },
  { name: "Turkey", code: "TR", dialCode: "+90", flag: "🇹🇷", placeholder: "501 234 56 78" },
  { name: "Ukraine", code: "UA", dialCode: "+380", flag: "🇺🇦", placeholder: "50 123 4567" },
  { name: "Vietnam", code: "VN", dialCode: "+84", flag: "🇻🇳", placeholder: "91 234 56 78" },
  { name: "Zambia", code: "ZM", dialCode: "+260", flag: "🇿🇲", placeholder: "97 1234567" },
  { name: "Zimbabwe", code: "ZW", dialCode: "+263", flag: "🇿🇼", placeholder: "71 234 5678" },
];

export const DEFAULT_COUNTRY = COUNTRIES[0]; // Nigeria

const TIMEZONE_COUNTRY_MAP: Record<string, string> = {
  // Africa
  "Africa/Lagos": "NG",
  "Africa/Accra": "GH",
  "Africa/Nairobi": "KE",
  "Africa/Johannesburg": "ZA",
  "Africa/Cairo": "EG",
  "Africa/Kigali": "RW",
  "Africa/Kampala": "UG",
  "Africa/Dar_es_Salaam": "TZ",
  "Africa/Douala": "CM",
  "Africa/Abidjan": "CI",
  "Africa/Dakar": "SN",
  "Africa/Casablanca": "MA",
  "Africa/Algiers": "DZ",
  "Africa/Tunis": "TN",
  "Africa/Addis_Ababa": "ET",
  "Africa/Luanda": "AO",
  "Africa/Lusaka": "ZM",
  "Africa/Harare": "ZW",
  "Africa/Monrovia": "LR",
  "Africa/Freetown": "SL",
  "Africa/Banjul": "GM",
  "Africa/Niamey": "NE",
  "Africa/Bamako": "ML",
  "Africa/Ouagadougou": "BF",
  "Africa/Lome": "TG",
  "Africa/Cotonou": "BJ",
  "Africa/Kinshasa": "CD",
  "Africa/Lubumbashi": "CD",
  "Africa/Brazzaville": "CG",
  "Africa/Gaborone": "BW",
  "Africa/Windhoek": "NA",
  "Africa/Maputo": "MZ",
  "Africa/Bujumbura": "BI",

  // North America
  "America/New_York": "US",
  "America/Chicago": "US",
  "America/Denver": "US",
  "America/Los_Angeles": "US",
  "America/Phoenix": "US",
  "America/Anchorage": "US",
  "America/Honolulu": "US",
  "America/Detroit": "US",
  "America/Indiana/Indianapolis": "US",
  "America/Toronto": "CA",
  "America/Vancouver": "CA",
  "America/Montreal": "CA",
  "America/Edmonton": "CA",
  "America/Winnipeg": "CA",
  "America/Halifax": "CA",
  "America/St_Johns": "CA",
  "America/Mexico_City": "MX",
  "America/Cancun": "MX",

  // Europe
  "Europe/London": "GB",
  "Europe/Belfast": "GB",
  "Europe/Dublin": "IE",
  "Europe/Paris": "FR",
  "Europe/Berlin": "DE",
  "Europe/Rome": "IT",
  "Europe/Madrid": "ES",
  "Europe/Amsterdam": "NL",
  "Europe/Brussels": "BE",
  "Europe/Vienna": "AT",
  "Europe/Zurich": "CH",
  "Europe/Stockholm": "SE",
  "Europe/Oslo": "NO",
  "Europe/Copenhagen": "DK",
  "Europe/Helsinki": "FI",
  "Europe/Warsaw": "PL",
  "Europe/Prague": "CZ",
  "Europe/Budapest": "HU",
  "Europe/Bucharest": "RO",
  "Europe/Athens": "GR",
  "Europe/Lisbon": "PT",
  "Europe/Kyiv": "UA",
  "Europe/Istanbul": "TR",

  // Middle East & Asia
  "Asia/Dubai": "AE",
  "Asia/Riyadh": "SA",
  "Asia/Qatar": "QA",
  "Asia/Bahrain": "BH",
  "Asia/Kuwait": "KW",
  "Asia/Muscat": "OM",
  "Asia/Beirut": "LB",
  "Asia/Amman": "JO",
  "Asia/Jerusalem": "IL",
  "Asia/Kolkata": "IN",
  "Asia/Calcutta": "IN",
  "Asia/Karachi": "PK",
  "Asia/Dhaka": "BD",
  "Asia/Colombo": "LK",
  "Asia/Kathmandu": "NP",
  "Asia/Singapore": "SG",
  "Asia/Kuala_Lumpur": "MY",
  "Asia/Jakarta": "ID",
  "Asia/Bangkok": "TH",
  "Asia/Manila": "PH",
  "Asia/Ho_Chi_Minh": "VN",
  "Asia/Tokyo": "JP",
  "Asia/Seoul": "KR",
  "Asia/Hong_Kong": "HK",
  "Asia/Shanghai": "CN",

  // Oceania & South America
  "Australia/Sydney": "AU",
  "Australia/Melbourne": "AU",
  "Australia/Brisbane": "AU",
  "Australia/Perth": "AU",
  "Australia/Adelaide": "AU",
  "Pacific/Auckland": "NZ",
  "America/Sao_Paulo": "BR",
  "America/Buenos_Aires": "AR",
  "America/Bogota": "CO",
  "America/Lima": "PE",
  "America/Santiago": "CL",
};

/**
 * Lookup a country by its 2-letter ISO code (case-insensitive)
 */
export function getCountryByCode(code?: string): Country {
  if (!code) return DEFAULT_COUNTRY;
  const match = COUNTRIES.find((c) => c.code.toUpperCase() === code.toUpperCase());
  return match || DEFAULT_COUNTRY;
}

/**
 * Lookup a country by dial code (e.g. "+234", "+1")
 */
export function getCountryByDialCode(dialCode?: string): Country | undefined {
  if (!dialCode) return undefined;
  const cleanDial = dialCode.startsWith("+") ? dialCode : `+${dialCode}`;
  return COUNTRIES.find((c) => c.dialCode === cleanDial);
}

/**
 * Auto-detect country from a raw input string that starts with +
 */
export function findCountryFromPhone(input: string): { country: Country; nationalNumber: string } | null {
  const trimmed = input.trim();
  if (!trimmed.startsWith("+")) return null;

  // Sort countries by dialCode length descending to match longest prefix first (+1868 before +1)
  const sorted = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
  for (const country of sorted) {
    if (trimmed.startsWith(country.dialCode)) {
      const nationalNumber = trimmed.slice(country.dialCode.length).trim();
      return { country, nationalNumber };
    }
  }
  return null;
}

/**
 * Synchronously detect user's country from timezone or browser locale
 */
export function detectUserCountrySync(): Country {
  if (typeof window === "undefined") return DEFAULT_COUNTRY;

  try {
    // 1. Check browser timezone
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TIMEZONE_COUNTRY_MAP[tz]) {
      return getCountryByCode(TIMEZONE_COUNTRY_MAP[tz]);
    }

    // 2. Check navigator language region code (e.g. "en-US" -> "US", "en-GB" -> "GB", "en-NG" -> "NG")
    const languages = navigator.languages || [navigator.language];
    for (const lang of languages) {
      if (lang && lang.includes("-")) {
        const region = lang.split("-")[1].toUpperCase();
        if (region.length === 2) {
          const match = COUNTRIES.find((c) => c.code === region);
          if (match) return match;
        }
      }
    }
  } catch (e) {
    // Ignore error
  }

  return DEFAULT_COUNTRY;
}

/**
 * Asynchronously detect user's country with network GeoIP fallback
 */
export async function detectUserCountryAsync(): Promise<Country> {
  const syncMatch = detectUserCountrySync();
  if (typeof window === "undefined") return syncMatch;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch("https://api.country.is/", {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data?.country) {
        return getCountryByCode(data.country);
      }
    }
  } catch (e) {
    // Fallback to sync match
  }

  return syncMatch;
}
