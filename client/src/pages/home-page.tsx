import { useQuery } from "@tanstack/react-query";
import { Product, HomepageContent } from "@shared/schema";
import { ProductCard } from "@/components/product-card";
import { CategoryCard } from "@/components/category-card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Sparkles, TrendingUp, Clock, Award, Heart, ShoppingBag, Zap, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: homepageContent } = useQuery<HomepageContent>({
    queryKey: ["/api/homepage"],
  });

  const newArrivals = products.filter(p => p.newArrival).slice(0, 8);
  const displayNewArrivals = newArrivals.length > 0 ? newArrivals : products.slice(0, 8);
  
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
    <div className="min-h-screen bg-gradient-to-b from-white via-primary/5 to-white">
      {/* Luxurious Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-accent/40 via-primary/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        
        <div className="relative max-w-5xl mx-auto text-center px-4 z-10">
          <Badge className="mb-6 bg-white/90 backdrop-blur-sm text-primary border-primary/20 hover:bg-white" data-testid="badge-luxury">
            <Star className="mr-2 h-3 w-3 fill-primary" />
            Luxury Fashion Redefined
          </Badge>
          <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight whitespace-pre-line bg-gradient-to-br from-white via-[#F5E6E8] to-[#E8C4C8] bg-clip-text text-transparent drop-shadow-2xl [text-shadow:_0_2px_20px_rgba(255,255,255,0.5)]" data-testid="text-hero-title">
            {heroTitle}
          </h1>
          <p className="text-xl md:text-2xl text-white/95 mb-12 max-w-3xl mx-auto drop-shadow-lg font-light">
            {heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/shop">
              <Button size="lg" className="text-base bg-white text-primary border-2 border-white shadow-xl" data-testid="button-shop-now">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Explore Collection
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-base backdrop-blur-md bg-white/10 text-white border-2 border-white/50 shadow-xl" data-testid="button-ai-stylist">
              <Sparkles className="mr-2 h-5 w-5" />
              AI Style Assistant
            </Button>
          </div>
          
          {/* Decorative Elements */}
          <div className="mt-16 flex justify-center gap-12 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              <span>Premium Quality</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              <span>Fast Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              <span>Curated With Love</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-8 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Designer Pieces</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">50K+</div>
              <div className="text-sm text-muted-foreground">Happy Customers</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">Authentic Items</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Customer Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories with Visual Enhancement */}
      <section className="py-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20" data-testid="badge-categories">
              Shop By Category
            </Badge>
            <h2 className="font-serif text-5xl md:text-6xl font-bold mb-6 text-foreground">Discover Your Style</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our carefully curated collections of luxury fashion and accessories
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.name} {...category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Showcase */}
      {featuredProducts.length > 0 && (
        <section className="py-24 px-4 md:px-8 bg-gradient-to-br from-accent/5 via-primary/5 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-accent/10 text-accent border-accent/20" data-testid="badge-featured">
                <Star className="mr-2 h-3 w-3 fill-accent" />
                Editor's Choice
              </Badge>
              <h2 className="font-serif text-5xl md:text-6xl font-bold mb-6">Featured Favorites</h2>
              <p className="text-lg text-muted-foreground">
                Our most loved pieces, handpicked for you
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* AI Style Recommender - Enhanced */}
      <section className="py-24 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <Card className="overflow-hidden border-2 border-primary/20 shadow-2xl">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Left Side - Visual */}
                <div className="relative h-64 md:h-auto bg-gradient-to-br from-primary via-accent to-primary/80 flex items-center justify-center">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558769132-cb1aea1c3e6e?w=800&h=600&fit=crop')] bg-cover bg-center opacity-20" />
                  <div className="relative z-10 text-white">
                    <Sparkles className="h-24 w-24 mx-auto mb-4 drop-shadow-2xl" />
                    <div className="flex gap-2 justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-100" />
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-200" />
                    </div>
                  </div>
                </div>
                
                {/* Right Side - Content */}
                <div className="p-12 bg-white flex flex-col justify-center">
                  <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 w-fit" data-testid="badge-ai">
                    Powered by AI
                  </Badge>
                  <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-foreground">
                    Your Personal Style Guide
                  </h2>
                  <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                    Experience the future of fashion with our AI-powered styling assistant. Get personalized recommendations that perfectly match your unique taste and preferences.
                  </p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-3">
                      <div className="mt-1 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                      <span className="text-foreground">Personalized outfit suggestions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                      <span className="text-foreground">Style tips from fashion experts</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                      <span className="text-foreground">Trending looks curated for you</span>
                    </li>
                  </ul>
                  <Button size="lg" className="w-full md:w-auto" data-testid="button-start-styling">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Start Your Style Journey
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-24 px-4 md:px-8 bg-gradient-to-b from-white via-primary/5 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-16 gap-6">
            <div>
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20" data-testid="badge-new">
                <TrendingUp className="mr-2 h-3 w-3" />
                Just Landed
              </Badge>
              <h2 className="font-serif text-5xl md:text-6xl font-bold mb-4 text-foreground">New Arrivals</h2>
              <p className="text-lg text-muted-foreground">Fresh from the runway, exclusively for you</p>
            </div>
            <Link href="/shop">
              <Button variant="outline" size="lg" className="border-primary text-primary" data-testid="button-view-all">
                View All Arrivals
              </Button>
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg animate-pulse" />
                  <div className="h-4 bg-primary/10 rounded animate-pulse" />
                  <div className="h-4 bg-accent/10 rounded w-2/3 animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {displayNewArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section - Enhanced */}
      <section className="py-24 px-4 md:px-8 bg-gradient-to-br from-accent/5 via-white to-primary/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-5xl md:text-6xl font-bold mb-6">Why Choose Orephia</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience luxury shopping with unparalleled service and quality
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-8 border-2 hover:border-primary transition-colors">
              <CardContent className="p-0">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3">Trending Collections</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Stay ahead with the latest fashion trends, updated weekly
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-8 border-2 hover:border-primary transition-colors">
              <CardContent className="p-0">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3">Premium Quality</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Authentic designer pieces with quality guarantee
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-8 border-2 hover:border-primary transition-colors">
              <CardContent className="p-0">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3">AI Styling</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Personalized recommendations powered by advanced AI
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-8 border-2 hover:border-primary transition-colors">
              <CardContent className="p-0">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3">Fast Delivery</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Worldwide shipping with express delivery options
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Instagram-Style Gallery Teaser */}
      <section className="py-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20" data-testid="badge-social">
              #OrephiaStyle
            </Badge>
            <h2 className="font-serif text-5xl md:text-6xl font-bold mb-6">Join Our Community</h2>
            <p className="text-lg text-muted-foreground">
              Get inspired by our community of fashion lovers
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&h=400&fit=crop",
              "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=400&fit=crop",
              "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop",
              "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=400&h=400&fit=crop",
            ].map((img, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-lg group cursor-pointer">
                <div 
                  className="w-full h-full bg-cover bg-center transition-transform group-hover:scale-110 duration-500"
                  style={{ backgroundImage: `url(${img})` }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
