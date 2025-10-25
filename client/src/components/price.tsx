import { useConvertedPrice } from "@/hooks/use-currency";
import { cn } from "@/lib/utils";

interface PriceProps {
  amount: number | string;
  className?: string;
}

export function Price({ amount, className }: PriceProps) {
  const convertedPrice = useConvertedPrice(amount);

  return <span className={cn("font-medium", className)}>{convertedPrice}</span>;
}
