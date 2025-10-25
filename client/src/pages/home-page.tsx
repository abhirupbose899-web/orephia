import { useQuery } from "@tanstack/react-query";
import { Product, HomepageContent } from "@shared/schema";
import { ProductCard } from "@/components/product-card";
import { CategoryCard } from "@/components/category-card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Sparkles, TrendingUp, Clock, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: homepageContent } = useQuery<HomepageContent>({
    queryKey: ["/api/homepage"],
  });

  const newArrivals = products.slice(0, 8);
  
  const featuredProducts = homepageContent?.featuredProductIds && homepageContent.featuredProductIds.length > 0
    ? products.filter(p => homepageContent.featuredProductIds?.includes(p.id))
    : products.filter((p) => p.featured).slice(0, 4);
  
  const heroTitle = homepageContent?.heroTitle || "Where Elegance\nMeets Emotion";
  const heroSubtitle = homepageContent?.heroSubtitle || "Discover curated luxury fashion with personalized AI styling recommendations";
  const heroImage = homepageContent?.heroImage || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&h=1080&fit=crop";

  const categories = [
    { name: "Dresses", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=600&fit=crop", href: "/shop?category=dresses" },
    { name: "Accessories", image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&h=600&fit=crop", href: "/shop?category=accessories" },
    { name: "Shoes", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&h=600&fit=crop", href: "/shop?category=shoes" },
    { name: "Bags", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&h=600&fit=crop", href: "/shop?category=bags" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20" 
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        <div className="relative max-w-3xl mx-auto text-center px-4 z-10">
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold mb-6 leading-tight whitespace-pre-line" data-testid="text-hero-title">
            {heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop">
              <Button size="lg" className="text-base" data-testid="button-shop-now">
                Shop New Arrivals
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-base backdrop-blur-sm" data-testid="button-ai-stylist">
              <Sparkles className="mr-2 h-5 w-5" />
              Try AI Stylist
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Carousel */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-5xl font-semibold mb-4">Shop by Category</h2>
            <p className="text-muted-foreground">Explore our curated collections</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.name} {...category} />
            ))}
          </div>
        </div>
      </section>

      {/* AI Style Recommender */}
      <section className="py-20 px-4 md:px-8 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="mb-6">
                <Sparkles className="h-12 w-12 mx-auto text-primary" />
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4">
                Get Your Personal Style Guide
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Our AI-powered style assistant analyzes your preferences to recommend pieces that perfectly match your unique taste
              </p>
              <Button size="lg" data-testid="button-start-styling">
                Start Styling
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-serif text-4xl md:text-5xl font-semibold mb-2">New Arrivals</h2>
              <p className="text-muted-foreground">Fresh from the runway</p>
            </div>
            <Link href="/shop">
              <Button variant="outline" data-testid="button-view-all">
                View All
              </Button>
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-[3/4] bg-muted rounded-lg animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 md:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <TrendingUp className="h-10 w-10 mx-auto mb-4 text-primary" />
              <h3 className="font-medium mb-2">Trending Collections</h3>
              <p className="text-sm text-muted-foreground">Stay ahead with the latest fashion trends</p>
            </div>
            <div className="text-center">
              <Award className="h-10 w-10 mx-auto mb-4 text-primary" />
              <h3 className="font-medium mb-2">Premium Quality</h3>
              <p className="text-sm text-muted-foreground">Authentic designer pieces, guaranteed</p>
            </div>
            <div className="text-center">
              <Sparkles className="h-10 w-10 mx-auto mb-4 text-primary" />
              <h3 className="font-medium mb-2">AI Styling</h3>
              <p className="text-sm text-muted-foreground">Personalized recommendations just for you</p>
            </div>
            <div className="text-center">
              <Clock className="h-10 w-10 mx-auto mb-4 text-primary" />
              <h3 className="font-medium mb-2">Fast Delivery</h3>
              <p className="text-sm text-muted-foreground">Worldwide shipping, on time</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
