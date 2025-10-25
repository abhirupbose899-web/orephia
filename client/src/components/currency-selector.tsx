import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrency } from "@/hooks/use-currency";
import { CURRENCY_SYMBOLS } from "@/lib/currency";

const popularCurrencies = ["USD", "EUR", "GBP", "INR", "AUD", "CAD", "JPY", "SGD", "AED"];

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();

  return (
    <Select value={currency} onValueChange={setCurrency}>
      <SelectTrigger
        className="w-[120px] h-9 gap-2"
        data-testid="select-currency"
      >
        <Globe className="h-4 w-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {popularCurrencies.map((curr) => (
          <SelectItem key={curr} value={curr}>
            {CURRENCY_SYMBOLS[curr] || curr} {curr}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
