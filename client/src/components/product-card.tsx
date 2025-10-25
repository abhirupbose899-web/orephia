import { Product } from "@shared/schema";
import { Heart } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/price";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [imageLoaded, setImageLoaded] = useState(false);

  const { data: wishlist = [] } = useQuery<{ productId: string }[]>({
    queryKey: ["/api/wishlist"],
    enabled: !!user,
  });

  const isInWishlist = wishlist.some((item) => item.productId === product.id);

  const toggleWishlistMutation = useMutation({
    mutationFn: async () => {
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
        description: isInWishlist
          ? `${product.title} removed from your wishlist`
          : `${product.title} added to your wishlist`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Please log in to use the wishlist",
        variant: "destructive",
      });
    },
  });

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlistMutation.mutate();
  };

  const images = Array.isArray(product.images) ? product.images : [];
  const mainImage = images[0] || "/placeholder-product.jpg";
  const price = typeof product.price === "string" ? parseFloat(product.price) : product.price;

  return (
    <Link href={`/product/${product.id}`}>
      <div className="group block cursor-pointer" data-testid={`card-product-${product.id}`}>
        <div className="relative overflow-hidden rounded-lg bg-muted aspect-[3/4]">
          <img
            src={mainImage}
            alt={product.title}
            className={`w-full h-full object-cover transition-all duration-300 ease-in-out group-hover:scale-105 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
            data-testid={`img-product-${product.id}`}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={handleWishlistClick}
            data-testid={`button-wishlist-${product.id}`}
          >
            <Heart
              className={`h-4 w-4 transition-all duration-200 ${
                isInWishlist ? "fill-primary text-primary" : ""
              }`}
            />
          </Button>
        </div>
        <div className="mt-4 space-y-1">
          <h3
            className="font-medium text-base line-clamp-2"
            data-testid={`text-product-name-${product.id}`}
          >
            {product.title}
          </h3>
          {product.designer && (
            <p className="text-sm text-muted-foreground">{product.designer}</p>
          )}
          <div data-testid={`text-product-price-${product.id}`}>
            <Price amount={price} className="text-base" />
          </div>
        </div>
      </div>
    </Link>
  );
}
