import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoyaltyTransaction } from "@shared/schema";
import { Gift, TrendingUp, Award, Clock, Check, Minus } from "lucide-react";
import { format } from "date-fns";

export default function LoyaltyPage() {
  const { data: loyaltyBalance } = useQuery<{ points: number }>({
    queryKey: ["/api/loyalty/balance"],
  });

  const { data: loyaltyTransactions = [] } = useQuery<LoyaltyTransaction[]>({
    queryKey: ["/api/loyalty/transactions"],
  });

  const totalEarned = loyaltyTransactions
    .filter(t => t.type === "earned")
    .reduce((sum, t) => sum + t.points, 0);

  const totalRedeemed = loyaltyTransactions
    .filter(t => t.type === "redeemed")
    .reduce((sum, t) => sum + Math.abs(t.points), 0);

  const currentPoints = loyaltyBalance?.points || 0;
  const redemptionValue = (currentPoints / 100).toFixed(2);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-primary/5 to-white">
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20" data-testid="badge-loyalty">
            <Gift className="mr-2 h-3 w-3" />
            Loyalty Rewards
          </Badge>
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">Your Loyalty Points</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Earn points with every purchase and redeem them for exclusive discounts
          </p>
        </div>

        {/* Points Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-2 border-primary/20">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Current Balance</h3>
              <p className="text-4xl font-bold text-primary mb-2" data-testid="text-points-balance">
                {currentPoints}
              </p>
              <p className="text-sm text-muted-foreground">points</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Redemption Value</h3>
              <p className="text-4xl font-bold text-foreground mb-2" data-testid="text-redemption-value">
                ₹{redemptionValue}
              </p>
              <p className="text-sm text-muted-foreground">discount available</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Earned</h3>
              <p className="text-4xl font-bold text-foreground mb-2" data-testid="text-total-earned">
                {totalEarned}
              </p>
              <p className="text-sm text-muted-foreground">lifetime points</p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="font-serif text-3xl">How Loyalty Points Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Earning Points
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Shop & Earn</p>
                      <p className="text-sm text-muted-foreground">
                        Earn 1 point for every ₹10 spent on your final order total (after discounts)
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Automatic Credit</p>
                      <p className="text-sm text-muted-foreground">
                        Points are automatically added to your account after successful payment
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">No Expiration</p>
                      <p className="text-sm text-muted-foreground">
                        Your points never expire - use them whenever you want
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Gift className="h-5 w-5 text-accent" />
                  Redeeming Points
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Simple Conversion</p>
                      <p className="text-sm text-muted-foreground">
                        100 points = ₹1 discount on your order
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Easy Redemption</p>
                      <p className="text-sm text-muted-foreground">
                        Apply points during checkout - choose how many you want to use
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Instant Savings</p>
                      <p className="text-sm text-muted-foreground">
                        Points discount is applied immediately to your order total
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-6 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Example Calculation
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                If you spend ₹5,000 on an order (after any coupon discounts):
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  You earn: 5,000 ÷ 10 = <strong className="text-foreground">500 loyalty points</strong>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Redemption value: 500 ÷ 100 = <strong className="text-foreground">₹5 discount</strong> on future orders
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-3xl flex items-center gap-2">
              <Clock className="h-7 w-7" />
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loyaltyTransactions.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium text-muted-foreground mb-2">No transactions yet</p>
                <p className="text-sm text-muted-foreground">
                  Start shopping to earn loyalty points with every purchase
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {loyaltyTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover-elevate"
                    data-testid={`transaction-${transaction.id}`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          transaction.type === "earned"
                            ? "bg-primary/10 text-primary"
                            : "bg-accent/10 text-accent"
                        }`}
                      >
                        {transaction.type === "earned" ? (
                          <TrendingUp className="h-6 w-6" />
                        ) : (
                          <Minus className="h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(new Date(transaction.createdAt!), "MMM dd, yyyy 'at' h:mm a")}
                        </p>
                        {transaction.orderId && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Order ID: {transaction.orderId.slice(0, 8)}...
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          transaction.type === "earned" ? "text-primary" : "text-accent"
                        }`}
                      >
                        {transaction.type === "earned" ? "+" : ""}
                        {transaction.points}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {transaction.type === "earned" ? "earned" : "redeemed"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Summary */}
        {loyaltyTransactions.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Points Earned</p>
                    <p className="text-3xl font-bold text-primary">{totalEarned}</p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Points Redeemed</p>
                    <p className="text-3xl font-bold text-accent">{totalRedeemed}</p>
                  </div>
                  <Gift className="h-12 w-12 text-accent opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
