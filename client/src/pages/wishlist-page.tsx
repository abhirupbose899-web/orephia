import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Heart } from "lucide-react";

function WishlistSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="mb-12">
          <div className="h-10 w-64 bg-muted rounded-lg animate-pulse mb-2" />
          <div className="h-5 w-32 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-[3/4] bg-gradient-to-br from-muted/50 to-muted animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                <div className="h-8 bg-muted rounded animate-pulse" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function WishlistPage() {
  const { data: wishlist = [], isLoading: wishlistLoading } = useQuery<{ productId: string }[]>({
    queryKey: ["/api/wishlist"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: products = [], isLoading: productsLoading, isFetching } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 1000 * 60 * 10, // 10 minutes - products don't change often
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });

  const wishlistProducts = useMemo(() => {
    if (!wishlist.length || !products.length) return [];
    const wishlistIds = new Set(wishlist.map(item => item.productId));
    return products.filter(product => wishlistIds.has(product.id));
  }, [wishlist, products]);

  // Only show skeleton on initial load, not on background refetch
  const isInitialLoading = wishlistLoading || (productsLoading && !products.length);

  if (isInitialLoading) {
    return <WishlistSkeleton />;
  }

  if (wishlistProducts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="font-serif text-3xl font-semibold mb-4">Your wishlist is empty</h1>
          <p className="text-muted-foreground mb-8">
            Save your favorite pieces to keep track of what you love
          </p>
          <Link href="/shop">
            <Button size="lg" data-testid="button-shop">Explore Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="mb-12">
          <h1 className="font-serif text-4xl font-semibold mb-2">My Wishlist</h1>
          <p className="text-muted-foreground" data-testid="text-wishlist-count">
            {wishlistProducts.length} {wishlistProducts.length === 1 ? "item" : "items"} saved
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {wishlistProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
