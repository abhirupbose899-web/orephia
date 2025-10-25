// Currency conversion utilities

export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  "United States": "USD",
  "United Kingdom": "GBP",
  "India": "INR",
  "Canada": "CAD",
  "Australia": "AUD",
  "Germany": "EUR",
  "France": "EUR",
  "Italy": "EUR",
  "Spain": "EUR",
  "Netherlands": "EUR",
  "Belgium": "EUR",
  "Austria": "EUR",
  "Portugal": "EUR",
  "Ireland": "EUR",
  "Greece": "EUR",
  "Japan": "JPY",
  "China": "CNY",
  "Singapore": "SGD",
  "UAE": "AED",
  "Saudi Arabia": "SAR",
  "Kuwait": "KWD",
  "Switzerland": "CHF",
  "Sweden": "SEK",
  "Norway": "NOK",
  "Denmark": "DKK",
  "South Korea": "KRW",
  "Brazil": "BRL",
  "Mexico": "MXN",
  "South Africa": "ZAR",
  "New Zealand": "NZD",
  "Hong Kong": "HKD",
  "Thailand": "THB",
  "Malaysia": "MYR",
  "Indonesia": "IDR",
  "Philippines": "PHP",
  "Vietnam": "VND",
  "Poland": "PLN",
  "Turkey": "TRY",
  "Russia": "RUB",
  "Argentina": "ARS",
  "Chile": "CLP",
  "Colombia": "COP",
  "Egypt": "EGP",
  "Israel": "ILS",
  "Qatar": "QAR",
  "Bahrain": "BHD",
  "Oman": "OMR",
  "Pakistan": "PKR",
  "Bangladesh": "BDT",
  "Sri Lanka": "LKR",
  "Nepal": "NPR",
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  GBP: "£",
  EUR: "€",
  INR: "₹",
  JPY: "¥",
  CNY: "¥",
  CAD: "C$",
  AUD: "A$",
  AED: "AED",
  SAR: "SAR",
  KWD: "KWD",
  CHF: "CHF",
  SGD: "S$",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
  KRW: "₩",
  BRL: "R$",
  MXN: "$",
  ZAR: "R",
  NZD: "NZ$",
  HKD: "HK$",
  THB: "฿",
  MYR: "RM",
  IDR: "Rp",
  PHP: "₱",
  VND: "₫",
  PLN: "zł",
  TRY: "₺",
  RUB: "₽",
  ARS: "$",
  CLP: "$",
  COP: "$",
  EGP: "E£",
  ILS: "₪",
  QAR: "QAR",
  BHD: "BHD",
  OMR: "OMR",
  PKR: "₨",
  BDT: "৳",
  LKR: "Rs",
  NPR: "Rs",
};

// Exchange rates cache
let exchangeRatesCache: { rates: Record<string, number>; timestamp: number } | null = null;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

/**
 * Fetch exchange rates from ExchangeRate-API (free tier, no API key needed)
 * Base currency is INR since all prices in the database are in INR
 */
export async function fetchExchangeRates(): Promise<Record<string, number>> {
  // Check cache first
  if (
    exchangeRatesCache &&
    Date.now() - exchangeRatesCache.timestamp < CACHE_DURATION
  ) {
    return exchangeRatesCache.rates;
  }

  try {
    const response = await fetch("https://open.er-api.com/v6/latest/INR");
    const data = await response.json();

    if (data.result === "success") {
      exchangeRatesCache = {
        rates: data.rates,
        timestamp: Date.now(),
      };
      return data.rates;
    } else {
      throw new Error("Failed to fetch exchange rates");
    }
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    // Return default rates if API fails
    return {
      USD: 0.012,
      GBP: 0.0095,
      EUR: 0.011,
      INR: 1,
      JPY: 1.8,
      CNY: 0.086,
      CAD: 0.017,
      AUD: 0.018,
      AED: 0.044,
      SAR: 0.045,
      KWD: 0.0037,
      CHF: 0.011,
      SGD: 0.016,
    };
  }
}

/**
 * Convert price from INR to target currency
 */
export async function convertPrice(
  priceInINR: number,
  targetCurrency: string
): Promise<number> {
  if (targetCurrency === "INR") {
    return priceInINR;
  }

  const rates = await fetchExchangeRates();
  const rate = rates[targetCurrency] || 1;
  return priceInINR * rate;
}

/**
 * Format price with currency symbol
 */
export function formatPrice(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const formatted = amount.toFixed(2);
  
  // For currencies that typically show symbol after amount
  if (["EUR", "SEK", "NOK", "DKK", "PLN"].includes(currency)) {
    return `${formatted}${symbol}`;
  }
  
  return `${symbol}${formatted}`;
}

/**
 * Get currency for a country
 */
export function getCurrencyForCountry(country: string): string {
  return COUNTRY_CURRENCY_MAP[country] || "INR";
}

/**
 * Get list of available countries
 */
export function getAvailableCountries(): string[] {
  return Object.keys(COUNTRY_CURRENCY_MAP).sort();
}

/**
 * Mapping of currency codes to their primary country/region
 */
export const CURRENCY_TO_COUNTRY: Record<string, string> = {
  USD: "United States",
  GBP: "United Kingdom",
  INR: "India",
  CAD: "Canada",
  AUD: "Australia",
  EUR: "Europe",
  JPY: "Japan",
  CNY: "China",
  SGD: "Singapore",
  AED: "UAE",
  SAR: "Saudi Arabia",
  KWD: "Kuwait",
  CHF: "Switzerland",
  SEK: "Sweden",
  NOK: "Norway",
  DKK: "Denmark",
  KRW: "South Korea",
  BRL: "Brazil",
  MXN: "Mexico",
  ZAR: "South Africa",
  NZD: "New Zealand",
  HKD: "Hong Kong",
  THB: "Thailand",
  MYR: "Malaysia",
  IDR: "Indonesia",
  PHP: "Philippines",
  VND: "Vietnam",
  PLN: "Poland",
  TRY: "Turkey",
  RUB: "Russia",
  ARS: "Argentina",
  CLP: "Chile",
  COP: "Colombia",
  EGP: "Egypt",
  ILS: "Israel",
  QAR: "Qatar",
  BHD: "Bahrain",
  OMR: "Oman",
  PKR: "Pakistan",
  BDT: "Bangladesh",
  LKR: "Sri Lanka",
  NPR: "Nepal",
};
