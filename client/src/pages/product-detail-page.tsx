import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Heart, ShoppingBag, Minus, Plus, Sparkles } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";

export default function ProductDetailPage() {
  const [, params] = useRoute("/product/:id");
  const productId = params?.id;
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", productId],
    enabled: !!productId,
  });

  const { data: wishlist = [] } = useQuery<{ productId: string }[]>({
    queryKey: ["/api/wishlist"],
    enabled: !!user,
  });

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);

  const isInWishlist = product && wishlist.some((item) => item.productId === product.id);

  const aiRecommendationsMutation = useMutation({
    mutationFn: async () => {
      if (!product) throw new Error("No product");
      const res = await apiRequest("POST", "/api/ai/style-recommendations", {
        productTitle: product.title,
        category: product.category,
        designer: product.designer,
        colors: product.colors,
      });
      return await res.json();
    },
  });

  const toggleWishlistMutation = useMutation({
    mutationFn: async () => {
      if (!product) return;
      if (isInWishlist) {
        await apiRequest("DELETE", `/api/wishlist/${product.id}`);
      } else {
        await apiRequest("POST", "/api/wishlist", { productId: product.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: isInWishlist ? "Removed from wishlist" : "Added to wishlist",
      });
    },
  });

  const handleAddToCart = () => {
    if (!product) return;
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast({
        title: "Please select a size",
        variant: "destructive",
      });
      return;
    }
    addToCart({
      productId: product.id,
      quantity,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
    });
    toast({
      title: "Added to cart",
      description: `${product.title} has been added to your cart`,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Product not found</h1>
          <Link href="/shop">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = Array.isArray(product.images) ? product.images : [];
  const price = typeof product.price === "string" ? parseFloat(product.price) : product.price;
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const colors = Array.isArray(product.colors) ? product.colors : [];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              <img
                src={images[selectedImage] || "/placeholder-product.jpg"}
                alt={product.title}
                className="w-full h-full object-cover"
                data-testid="img-product-main"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? "border-primary" : "border-transparent"
                    }`}
                    data-testid={`button-thumbnail-${idx}`}
                  >
                    <img src={img} alt={`${product.title} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6 lg:sticky lg:top-24 h-fit">
            {product.designer && (
              <p className="text-sm text-muted-foreground uppercase tracking-wider">{product.designer}</p>
            )}
            <h1 className="font-serif text-4xl font-semibold" data-testid="text-product-title">
              {product.title}
            </h1>
            <p className="text-3xl font-medium" data-testid="text-product-price">
              ${price.toFixed(2)}
            </p>

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            {/* Size Selector */}
            {sizes.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Size</label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      className="rounded-full"
                      onClick={() => setSelectedSize(size)}
                      data-testid={`button-size-${size}`}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {colors.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Color</label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <Button
                      key={color}
                      variant={selectedColor === color ? "default" : "outline"}
                      onClick={() => setSelectedColor(color)}
                      data-testid={`button-color-${color}`}
                    >
                      {color}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Quantity</label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  data-testid="button-quantity-decrease"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-lg font-medium w-12 text-center" data-testid="text-quantity">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity((q) => q + 1)}
                  data-testid="button-quantity-increase"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                className="flex-1"
                size="lg"
                onClick={handleAddToCart}
                data-testid="button-add-to-cart"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => toggleWishlistMutation.mutate()}
                data-testid="button-wishlist"
              >
                <Heart className={`h-5 w-5 ${isInWishlist ? "fill-primary text-primary" : ""}`} />
              </Button>
            </div>

            {/* AI Pairing Suggestions */}
            <div className="border rounded-lg p-4 bg-primary/5">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium mb-1">AI Styling Recommendations</h3>
                  {!showAIRecommendations ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Get personalized styling recommendations powered by AI
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowAIRecommendations(true);
                          aiRecommendationsMutation.mutate();
                        }}
                        disabled={aiRecommendationsMutation.isPending}
                        data-testid="button-ai-recommendations"
                      >
                        {aiRecommendationsMutation.isPending ? "Generating..." : "Get Styling Tips"}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {aiRecommendationsMutation.isPending && (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                          <p className="text-sm text-muted-foreground">Generating recommendations...</p>
                        </div>
                      )}
                      {aiRecommendationsMutation.isError && (
                        <p className="text-sm text-destructive">
                          Failed to generate recommendations. Please try again.
                        </p>
                      )}
                      {aiRecommendationsMutation.isSuccess && aiRecommendationsMutation.data && (
                        <div className="space-y-2">
                          {aiRecommendationsMutation.data.recommendations?.map((rec: any, idx: number) => (
                            <div key={idx} className="text-sm">
                              <p className="font-medium">{rec.recommendation}</p>
                              <p className="text-muted-foreground">{rec.reasoning}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Accordion Details */}
            <Accordion type="multiple" className="w-full">
              {product.fabricDetails && (
                <AccordionItem value="fabric">
                  <AccordionTrigger>Fabric Details</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">{product.fabricDetails}</p>
                  </AccordionContent>
                </AccordionItem>
              )}
              <AccordionItem value="size-chart">
                <AccordionTrigger>Size Chart</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">Standard sizing. Consult our size guide for measurements.</p>
                </AccordionContent>
              </AccordionItem>
              {product.careInstructions && (
                <AccordionItem value="care">
                  <AccordionTrigger>Care Instructions</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">{product.careInstructions}</p>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}
