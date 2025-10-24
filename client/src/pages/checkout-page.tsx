import { useState, useEffect } from "react";
import { useCart } from "@/hooks/use-cart";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product, InsertAddress } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Loader2, CheckCircle } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: addresses = [] } = useQuery<any[]>({
    queryKey: ["/api/addresses"],
  });

  const [shippingAddress, setShippingAddress] = useState<InsertAddress>({
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
    phone: "",
  });

  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  const createOrderMutation = useMutation({
    mutationFn: async (paymentDetails?: { paymentId: string; razorpayOrderId: string }) => {
      const items = cart.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) throw new Error("Product not found");
        const price = typeof product.price === "string" ? parseFloat(product.price) : product.price;
        const images = Array.isArray(product.images) ? product.images : [];
        return {
          productId: item.productId,
          productTitle: product.title,
          productImage: images[0] || "",
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          price,
        };
      });

      const addressToUse = selectedAddressId
        ? addresses.find((a) => a.id === selectedAddressId)
        : shippingAddress;

      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const shipping = subtotal > 100 ? 0 : 10;
      const tax = subtotal * 0.08;
      const total = subtotal + shipping + tax;

      const orderPayload: any = {
        items,
        shippingAddress: addressToUse,
        subtotal: subtotal.toFixed(2),
        shipping: shipping.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        status: paymentDetails ? "confirmed" : "pending",
      };

      if (paymentDetails) {
        orderPayload.paymentId = paymentDetails.paymentId;
        orderPayload.razorpayOrderId = paymentDetails.razorpayOrderId;
      }

      const res = await apiRequest("POST", "/api/orders", orderPayload);
      return await res.json();
    },
    onSuccess: () => {
      clearCart();
      setOrderPlaced(true);
      setProcessingPayment(false);
      toast({
        title: "Order placed successfully!",
        description: "You will receive a confirmation email shortly.",
      });
    },
    onError: (error: Error) => {
      setProcessingPayment(false);
      toast({
        title: "Order failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePayment = async () => {
    try {
      setProcessingPayment(true);

      const addressToUse = selectedAddressId
        ? addresses.find((a) => a.id === selectedAddressId)
        : shippingAddress;

      if (!addressToUse?.fullName || !addressToUse?.addressLine1 || !addressToUse?.city) {
        toast({
          title: "Invalid Address",
          description: "Please provide a complete shipping address",
          variant: "destructive",
        });
        setProcessingPayment(false);
        return;
      }

      const items = cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      }));

      const res = await apiRequest("POST", "/api/razorpay/create-order", {
        items,
        addressId: selectedAddressId,
      });

      const data = await res.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "Orephia",
        description: "Luxury Fashion Purchase",
        order_id: data.orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await apiRequest("POST", "/api/razorpay/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              await createOrderMutation.mutateAsync({
                paymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
              });
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (error: any) {
            toast({
              title: "Payment verification failed",
              description: error.message,
              variant: "destructive",
            });
            setProcessingPayment(false);
          }
        },
        prefill: {
          name: addressToUse.fullName,
          contact: addressToUse.phone,
        },
        theme: {
          color: "#000000",
        },
        modal: {
          ondismiss: function() {
            setProcessingPayment(false);
            toast({
              title: "Payment Cancelled",
              description: "You cancelled the payment process",
              variant: "destructive",
            });
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to initiate payment",
        variant: "destructive",
      });
      setProcessingPayment(false);
    }
  };

  const cartItemsWithDetails = cart.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return { ...item, product };
  });

  const subtotal = cartItemsWithDetails.reduce((sum, item) => {
    if (!item.product) return sum;
    const price = typeof item.product.price === "string" 
      ? parseFloat(item.product.price) 
      : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (cart.length === 0 && !orderPlaced) {
    setLocation("/cart");
    return null;
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <CheckCircle className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="font-serif text-3xl font-semibold mb-4">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for your purchase. We've sent a confirmation email with your order details.
          </p>
          <div className="space-y-4">
            <Button size="lg" className="w-full" onClick={() => setLocation("/profile")}>
              View Orders
            </Button>
            <Button size="lg" variant="outline" className="w-full" onClick={() => setLocation("/shop")}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
        <h1 className="font-serif text-4xl font-semibold mb-8">Checkout</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12 gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step >= s ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {s}
              </div>
              {s < 3 && <div className={`w-16 h-0.5 ${step > s ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 && (
              <Card className="p-6">
                <h2 className="font-semibold text-lg mb-6">Shipping Address</h2>
                
                {addresses.length > 0 && (
                  <div className="mb-6">
                    <Label className="mb-3 block">Saved Addresses</Label>
                    <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                      {addresses.map((addr: any) => (
                        <div key={addr.id} className="flex items-start space-x-2 p-3 border rounded-lg">
                          <RadioGroupItem value={addr.id} id={addr.id} />
                          <Label htmlFor={addr.id} className="flex-1 cursor-pointer">
                            <p className="font-medium">{addr.fullName}</p>
                            <p className="text-sm text-muted-foreground">
                              {addr.addressLine1}, {addr.city}, {addr.state} {addr.postalCode}
                            </p>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    <div className="my-4 text-center text-sm text-muted-foreground">or enter new address</div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                      data-testid="input-fullname"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                      data-testid="input-phone"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address1">Address Line 1</Label>
                    <Input
                      id="address1"
                      value={shippingAddress.addressLine1}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
                      data-testid="input-address1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address2">Address Line 2</Label>
                    <Input
                      id="address2"
                      value={shippingAddress.addressLine2 || ""}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine2: e.target.value })}
                      data-testid="input-address2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        data-testid="input-city"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                        data-testid="input-state"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={shippingAddress.postalCode}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                        data-testid="input-postalcode"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={shippingAddress.country}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                        data-testid="input-country"
                      />
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-6" onClick={() => setStep(2)} data-testid="button-continue-to-payment">
                  Continue to Payment
                </Button>
              </Card>
            )}

            {step === 2 && (
              <Card className="p-6">
                <h2 className="font-semibold text-lg mb-6">Payment Method</h2>
                <div className="space-y-4 mb-6">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-8 bg-primary/10 rounded flex items-center justify-center">
                        <span className="text-xs font-bold">RP</span>
                      </div>
                      <div>
                        <p className="font-medium">Razorpay Payment Gateway</p>
                        <p className="text-xs text-muted-foreground">Secure payment processing</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      You will be redirected to Razorpay to complete your payment securely. We accept credit/debit cards, UPI, net banking, and wallets.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1" disabled={processingPayment}>
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)} className="flex-1" disabled={processingPayment} data-testid="button-continue-to-review">
                    Continue to Review
                  </Button>
                </div>
              </Card>
            )}

            {step === 3 && (
              <Card className="p-6">
                <h2 className="font-semibold text-lg mb-6">Review Order</h2>
                <div className="space-y-4 mb-6">
                  <div>
                    <h3 className="font-medium mb-2">Shipping Address</h3>
                    <div className="text-sm text-muted-foreground">
                      <p>{shippingAddress.fullName}</p>
                      <p>{shippingAddress.addressLine1}</p>
                      {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
                      <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
                      <p>{shippingAddress.country}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1" disabled={processingPayment}>
                    Back
                  </Button>
                  <Button
                    onClick={handlePayment}
                    disabled={processingPayment || createOrderMutation.isPending}
                    className="flex-1"
                    data-testid="button-place-order"
                  >
                    {processingPayment || createOrderMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Proceed to Payment"
                    )}
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="font-semibold text-lg mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span data-testid="text-checkout-total">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {cartItemsWithDetails.slice(0, 3).map((item, idx) => {
                  if (!item.product) return null;
                  const images = Array.isArray(item.product.images) ? item.product.images : [];
                  return (
                    <div key={idx} className="flex gap-2 text-sm">
                      <img src={images[0]} alt={item.product.title} className="w-12 h-12 object-cover rounded" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{item.product.title}</p>
                        <p className="text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  );
                })}
                {cart.length > 3 && (
                  <p className="text-sm text-muted-foreground">+{cart.length - 3} more items</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
