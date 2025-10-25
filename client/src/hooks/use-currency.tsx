import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchExchangeRates, formatPrice, CURRENCY_SYMBOLS } from "@/lib/currency";

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  convertPrice: (priceInINR: number) => Promise<number>;
  formatPrice: (amount: number) => string;
  exchangeRates: Record<string, number> | undefined;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<string>("USD");

  // Fetch exchange rates
  const { data: exchangeRates, isLoading } = useQuery({
    queryKey: ["exchangeRates"],
    queryFn: fetchExchangeRates,
    staleTime: 3600000, // 1 hour
    gcTime: 3600000,
  });

  // Load currency from localStorage or user context
  useEffect(() => {
    const savedCurrency = localStorage.getItem("currency");
    if (savedCurrency) {
      setCurrencyState(savedCurrency);
    }
  }, []);

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
    localStorage.setItem("currency", newCurrency);
  };

  const convertPrice = async (priceInINR: number): Promise<number> => {
    if (currency === "INR") {
      return priceInINR;
    }

    const rates = exchangeRates || (await fetchExchangeRates());
    const rate = rates[currency] || 1;
    return priceInINR * rate;
  };

  const formatPriceValue = (amount: number): string => {
    return formatPrice(amount, currency);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        convertPrice,
        formatPrice: formatPriceValue,
        exchangeRates,
        isLoading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}

// Hook to convert and format a price
export function useConvertedPrice(priceInINR: number | string) {
  const { currency, exchangeRates, formatPrice } = useCurrency();
  const price = typeof priceInINR === "string" ? parseFloat(priceInINR) : priceInINR;

  const [convertedPrice, setConvertedPrice] = useState<string>("");

  useEffect(() => {
    if (currency === "INR") {
      setConvertedPrice(formatPrice(price));
      return;
    }

    if (exchangeRates && exchangeRates[currency]) {
      const converted = price * exchangeRates[currency];
      setConvertedPrice(formatPrice(converted));
    }
  }, [price, currency, exchangeRates, formatPrice]);

  return convertedPrice || formatPrice(price);
}
