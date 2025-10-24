import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Order } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Package, Heart, MapPin, LogOut } from "lucide-react";

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: addresses = [] } = useQuery<any[]>({
    queryKey: ["/api/addresses"],
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
