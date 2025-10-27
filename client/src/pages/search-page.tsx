import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Search, Filter, X, Sparkles, ArrowRight, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product } from "@shared/schema";
import { Price } from "@/components/price";

export default function SearchPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("relevance");

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          (product.tags && product.tags.some((tag) => tag.toLowerCase().includes(query))) ||
          (product.mainCategory && product.mainCategory.toLowerCase().includes(query)) ||
          (product.subCategory && product.subCategory.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.mainCategory === selectedCategory
      );
    }

    // Price range filter
    if (priceRange !== "all") {
      switch (priceRange) {
        case "under-50":
          filtered = filtered.filter((p) => parseFloat(p.price) < 50);
          break;
        case "50-100":
          filtered = filtered.filter((p) => {
            const price = parseFloat(p.price);
            return price >= 50 && price <= 100;
          });
          break;
        case "100-200":
          filtered = filtered.filter((p) => {
            const price = parseFloat(p.price);
            return price > 100 && price <= 200;
          });
          break;
        case "over-200":
          filtered = filtered.filter((p) => parseFloat(p.price) > 200);
          break;
      }
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered = [...filtered].sort(
          (a, b) => parseFloat(a.price) - parseFloat(b.price)
        );
        break;
      case "price-high":
        filtered = [...filtered].sort(
          (a, b) => parseFloat(b.price) - parseFloat(a.price)
        );
        break;
      case "name":
        filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "newest":
        filtered = [...filtered].sort(
          (a, b) =>
            new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
        );
        break;
    }

    return filtered;
  }, [products, searchQuery, selectedCategory, priceRange, sortBy]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.mainCategory).filter((c): c is string => c !== null));
    return Array.from(cats);
  }, [products]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setPriceRange("all");
    setSortBy("relevance");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-b border-primary/20">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Discover Your Perfect Style</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Search Our Collection
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our curated selection of luxury fashion pieces
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mt-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for products, categories, or styles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-12 h-14 text-lg border-2 border-primary/20 focus:border-primary/40 rounded-xl bg-background/80 backdrop-blur-sm"
                data-testid="input-search"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 hover-elevate active-elevate-2 p-1 rounded-full"
                  data-testid="button-clear-search"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters & Sort Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 rounded-xl bg-card border border-primary/10">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          <div className="flex flex-wrap gap-3 flex-1">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px] border-primary/20" data-testid="select-category">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-[180px] border-primary/20" data-testid="select-price">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under-50">Under ₹50</SelectItem>
                <SelectItem value="50-100">₹50 - ₹100</SelectItem>
                <SelectItem value="100-200">₹100 - ₹200</SelectItem>
                <SelectItem value="over-200">Over ₹200</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] border-primary/20" data-testid="select-sort">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name: A-Z</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(searchQuery || selectedCategory !== "all" || priceRange !== "all" || sortBy !== "relevance") && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="border-primary/20"
              data-testid="button-clear-filters"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground">
            {filteredProducts.length === 0 ? (
              "No products found"
            ) : (
              <>
                Found <span className="font-semibold text-foreground">{filteredProducts.length}</span>{" "}
                {filteredProducts.length === 1 ? "product" : "products"}
              </>
            )}
          </p>
          {searchQuery && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Searching for:</span>
              <Badge variant="secondary" className="gap-2">
                {searchQuery}
                <button onClick={() => setSearchQuery("")}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mb-6">
              <Package className="h-10 w-10 text-primary" />
            </div>
            <h3 className="font-serif text-2xl font-semibold mb-2">No Products Found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters or search terms
            </p>
            <Button onClick={clearFilters} variant="outline" className="border-primary/20">
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`}>
                <Card className="group overflow-hidden border-2 border-primary/10 hover-elevate active-elevate-2 transition-all duration-300 h-full" data-testid={`card-product-${product.id}`}>
                  <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-16 w-16 text-muted-foreground/50" />
                      </div>
                    )}
                    {product.newArrival && (
                      <Badge className="absolute top-3 left-3 bg-gradient-to-r from-primary to-accent border-0">
                        New
                      </Badge>
                    )}
                    {product.featured && (
                      <Badge className="absolute top-3 right-3 bg-gradient-to-r from-accent to-primary border-0">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div className="space-y-1">
                      <h3 className="font-medium line-clamp-1 group-hover:text-primary transition-colors">
                        {product.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <Price
                        amount={parseFloat(product.price)}
                        className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                      />
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    {product.tags && product.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {product.tags.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
