import { useState, useEffect, useMemo } from "react";
import { useCart } from "@/hooks/use-cart";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/price";
import { Minus, Plus, X, Tag, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

function CartSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="h-10 w-48 bg-muted rounded-lg animate-pulse mb-12" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-muted rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-muted rounded w-2/3 animate-pulse" />
                    <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
                    <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="h-6 w-32 bg-muted rounded animate-pulse mb-6" />
              <div className="space-y-4">
                <div className="h-10 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-12 bg-muted rounded animate-pulse mt-6" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const { toast } = useToast();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const validateCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      const items = cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
      
      const res = await apiRequest("POST", "/api/coupons/validate", {
        code,
        items,
      });
      return await res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setAppliedCoupon(data.coupon);
        setCouponCode("");
        toast({
          title: "Coupon Applied!",
          description: data.message,
        });
      } else {
        toast({
          title: "Invalid Coupon",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to apply coupon",
        variant: "destructive",
      });
    },
  });

  const cartItemsWithDetails = useMemo(() => {
    if (!products.length) return [];
    const productMap = new Map(products.map(p => [p.id, p]));
    return cart.map((item) => ({
      ...item,
      product: productMap.get(item.productId)
    }));
  }, [cart, products]);

  const { subtotal, discount, shipping, total } = useMemo(() => {
    const sub = cartItemsWithDetails.reduce((sum, item) => {
      if (!item.product) return sum;
      const price = typeof item.product.price === "string" 
        ? parseFloat(item.product.price) 
        : item.product.price;
      return sum + price * item.quantity;
    }, 0);

    const disc = appliedCoupon ? parseFloat(appliedCoupon.discountAmount) : 0;
    const ship = sub > 100 ? 0 : 10;
    const tot = sub - disc + ship;

    return { subtotal: sub, discount: disc, shipping: ship, total: tot };
  }, [cartItemsWithDetails, appliedCoupon]);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a coupon code",
        variant: "destructive",
      });
      return;
    }
    validateCouponMutation.mutate(couponCode.trim());
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem("appliedCoupon");
    toast({
      title: "Coupon Removed",
      description: "The coupon has been removed from your cart",
    });
  };

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem("appliedCoupon", JSON.stringify(appliedCoupon));
    }
  }, [appliedCoupon]);

  useEffect(() => {
    const savedCoupon = localStorage.getItem("appliedCoupon");
    if (savedCoupon) {
      try {
        setAppliedCoupon(JSON.parse(savedCoupon));
      } catch (e) {
        localStorage.removeItem("appliedCoupon");
      }
    }
  }, []);

  // Only show skeleton on initial load when we have no cached data
  const isInitialLoading = productsLoading && !products.length && cart.length > 0;
  
  if (isInitialLoading) {
    return <CartSkeleton />;
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h1 className="font-serif text-3xl font-semibold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">
            Discover our luxury collections and find pieces that speak to you
          </p>
          <Link href="/shop">
            <Button size="lg" data-testid="button-shop">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <h1 className="font-serif text-4xl font-semibold mb-12">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItemsWithDetails.map((item, idx) => {
              if (!item.product) return null;
              const price = typeof item.product.price === "string" 
                ? parseFloat(item.product.price) 
                : item.product.price;
              const images = Array.isArray(item.product.images) ? item.product.images : [];

              return (
                <Card key={`${item.productId}-${item.size}-${item.color}-${idx}`} className="p-4">
                  <div className="flex gap-4">
                    <Link href={`/product/${item.product.id}`}>
                      <img
                        src={images[0] || "/placeholder-product.jpg"}
                        alt={item.product.title}
                        className="w-24 h-24 object-cover rounded-lg"
                        loading="lazy"
                        data-testid={`img-cart-item-${idx}`}
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-4 mb-2">
                        <div>
                          <Link href={`/product/${item.product.id}`}>
                            <h3 className="font-medium line-clamp-1" data-testid={`text-cart-item-title-${idx}`}>
                              {item.product.title}
                            </h3>
                          </Link>
                          {item.size && (
                            <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                          )}
                          {item.color && (
                            <p className="text-sm text-muted-foreground">Color: {item.color}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.productId, item.size, item.color)}
                          data-testid={`button-remove-${idx}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.size, item.color)}
                            data-testid={`button-decrease-${idx}`}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm w-8 text-center" data-testid={`text-quantity-${idx}`}>
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.size, item.color)}
                            data-testid={`button-increase-${idx}`}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="font-medium" data-testid={`text-item-total-${idx}`}>
                          <Price amount={price * item.quantity} />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="font-semibold text-lg mb-6">Order Summary</h2>
              
              {/* Coupon Input */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    disabled={!!appliedCoupon || validateCouponMutation.isPending}
                    data-testid="input-coupon"
                  />
                  <Button
                    variant="outline"
                    onClick={handleApplyCoupon}
                    disabled={!!appliedCoupon || validateCouponMutation.isPending}
                    data-testid="button-apply-coupon"
                  >
                    {validateCouponMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Apply"
                    )}
                  </Button>
                </div>
                {appliedCoupon && (
                  <div className="mt-2">
                    <Badge variant="secondary" className="gap-1">
                      <Tag className="h-3 w-3" />
                      {appliedCoupon.code}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={handleRemoveCoupon}
                        data-testid="button-remove-coupon"
                      />
                    </Badge>
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span data-testid="text-subtotal"><Price amount={subtotal} /></span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span data-testid="text-discount">-<Price amount={discount} /></span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span data-testid="text-shipping">
                    {shipping === 0 ? "Free" : <Price amount={shipping} />}
                  </span>
                </div>
                {subtotal < 100 && (
                  <p className="text-xs text-muted-foreground">
                    Free shipping on orders over <Price amount={100} />
                  </p>
                )}
                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span data-testid="text-total"><Price amount={total} /></span>
                  </div>
                </div>
              </div>
              <Link href="/checkout">
                <Button size="lg" className="w-full" data-testid="button-checkout">
                  Proceed to Checkout
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
