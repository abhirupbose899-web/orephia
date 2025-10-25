import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Heart, Sparkles } from "lucide-react";

function WishlistSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="mb-12">
          <div className="h-10 w-64 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg animate-pulse mb-2" />
          <div className="h-5 w-32 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden border-primary/10">
              <div className="aspect-[3/4] bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gradient-to-r from-muted to-primary/10 rounded animate-pulse" />
                <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                <div className="h-8 bg-primary/5 rounded animate-pulse" />
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
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const wishlistProducts = useMemo(() => {
    if (!wishlist.length || !products.length) return [];
    const wishlistIds = new Set(wishlist.map(item => item.productId));
    return products.filter(product => wishlistIds.has(product.id));
  }, [wishlist, products]);

  const isLoading = (wishlistLoading && !wishlist.length) || (productsLoading && !products.length);
  const showEmpty = !isLoading && wishlist.length === 0;
  const showContent = !isLoading && wishlistProducts.length > 0;

  return (
    <div className="min-h-screen">
      {isLoading && <WishlistSkeleton />}
      
      {showEmpty && (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 via-transparent to-accent/5">
          <div className="text-center max-w-md px-4">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-xl"></div>
              </div>
              <Heart className="h-20 w-20 mx-auto relative text-primary" />
            </div>
            <h1 className="font-serif text-4xl font-semibold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Your wishlist is empty</h1>
            <p className="text-muted-foreground mb-8 text-lg">
              Save your favorite pieces to keep track of what you love
            </p>
            <Link href="/shop">
              <Button size="lg" data-testid="button-shop" className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                <Sparkles className="h-4 w-4 mr-2" />
                Explore Products
              </Button>
            </Link>
          </div>
        </div>
      )}

      {showContent && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                <Heart className="h-6 w-6 text-primary fill-primary" />
              </div>
              <h1 className="font-serif text-4xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                My Wishlist
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-gradient-to-r from-primary/10 to-accent/10 text-primary border-primary/20" data-testid="text-wishlist-count">
                <Sparkles className="h-3 w-3 mr-1" />
                {wishlistProducts.length} {wishlistProducts.length === 1 ? "item" : "items"} saved
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {wishlistProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
