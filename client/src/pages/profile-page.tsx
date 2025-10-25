import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Order, LoyaltyTransaction } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Package, Heart, MapPin, LogOut, Gift, TrendingUp, TrendingDown } from "lucide-react";

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: addresses = [] } = useQuery<any[]>({
    queryKey: ["/api/addresses"],
  });

  const { data: loyaltyBalance } = useQuery<{ points: number }>({
    queryKey: ["/api/loyalty/balance"],
  });

  const { data: loyaltyTransactions = [] } = useQuery<LoyaltyTransaction[]>({
    queryKey: ["/api/loyalty/transactions"],
  });

  const handleLogout = () => {
    logoutMutation.mutate();
    setLocation("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-semibold mb-2">My Account</h1>
          <p className="text-muted-foreground">Welcome back, {user.fullName || user.username}!</p>
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="orders" data-testid="tab-orders">
              <Package className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="rewards" data-testid="tab-rewards">
              <Gift className="h-4 w-4 mr-2" />
              Rewards
            </TabsTrigger>
            <TabsTrigger value="wishlist" data-testid="tab-wishlist-link">
              <Heart className="h-4 w-4 mr-2" />
              Wishlist
            </TabsTrigger>
            <TabsTrigger value="addresses" data-testid="tab-addresses">
              <MapPin className="h-4 w-4 mr-2" />
              Addresses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">No orders yet</h3>
                  <p className="text-sm text-muted-foreground mb-6">Start shopping to see your orders here</p>
                  <Button onClick={() => setLocation("/shop")}>Browse Products</Button>
                </CardContent>
              </Card>
            ) : (
              orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(order.createdAt || "").toLocaleDateString()}
                        </p>
                      </div>
                      <Badge>{order.orderStatus}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(order.items as any[]).slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex gap-3">
                          <img
                            src={item.productImage}
                            alt={item.productTitle}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.productTitle}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium">${item.price.toFixed(2)}</p>
                        </div>
                      ))}
                      {(order.items as any[]).length > 2 && (
                        <p className="text-sm text-muted-foreground">
                          +{(order.items as any[]).length - 2} more items
                        </p>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total</span>
                      <span className="font-semibold text-lg">
                        ${typeof order.total === "string" ? parseFloat(order.total).toFixed(2) : order.total}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="rewards" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  Your Loyalty Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Available Points</p>
                    <p className="text-4xl font-bold text-primary" data-testid="text-loyalty-balance">
                      {loyaltyBalance?.points || 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Earn 1 point for every ₹10 spent
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">Points Value</p>
                    <p className="text-2xl font-semibold">
                      ₹{((loyaltyBalance?.points || 0) / 100).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      100 points = ₹1 discount
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {loyaltyTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No transactions yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Start shopping to earn loyalty points
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {loyaltyTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between py-3 border-b last:border-0"
                        data-testid={`transaction-${transaction.id}`}
                      >
                        <div className="flex items-center gap-3">
                          {transaction.type === "earned" ? (
                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-full">
                              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                          ) : (
                            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-full">
                              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">{transaction.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(transaction.createdAt || "").toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-semibold ${
                              transaction.type === "earned"
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {transaction.type === "earned" ? "+" : "-"}
                            {transaction.points}
                          </p>
                          <p className="text-xs text-muted-foreground">points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wishlist">
            <Card>
              <CardContent className="text-center py-12">
                <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">View your wishlist</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  All your saved items are on the wishlist page
                </p>
                <Button onClick={() => setLocation("/wishlist")}>Go to Wishlist</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses" className="space-y-6">
            {addresses.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">No saved addresses</h3>
                  <p className="text-sm text-muted-foreground">
                    Your addresses will be saved during checkout
                  </p>
                </CardContent>
              </Card>
            ) : (
              addresses.map((address) => (
                <Card key={address.id}>
                  <CardContent className="pt-6">
                    <p className="font-medium mb-2">{address.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {address.addressLine1}
                      {address.addressLine2 && `, ${address.addressLine2}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                    <p className="text-sm text-muted-foreground">{address.country}</p>
                    <p className="text-sm text-muted-foreground mt-2">Phone: {address.phone}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        <Card className="mt-8">
          <CardContent className="py-6">
            <Button variant="destructive" onClick={handleLogout} data-testid="button-logout">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
