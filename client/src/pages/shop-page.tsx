import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SlidersHorizontal, Search, X, ChevronDown } from "lucide-react";

export default function ShopPage() {
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedMainCategories, setSelectedMainCategories] = useState<string[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedDesigners, setSelectedDesigners] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "Apparels": true,
    "Shoes": true,
    "Bags": true,
    "Accessories": true,
  });

  // Extract unique values for filters
  const mainCategories = Array.from(new Set(products.map((p) => p.mainCategory).filter(Boolean))) as string[];
  
  // Get subcategories for each main category
  const getSubCategoriesForMain = (mainCat: string) => {
    return Array.from(
      new Set(products.filter((p) => p.mainCategory === mainCat && p.subCategory).map((p) => p.subCategory))
    ) as string[];
  };
  
  const designers = Array.from(new Set(products.map((p) => p.designer).filter(Boolean))) as string[];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  const toggleCategoryExpanded = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const price = typeof product.price === "string" ? parseFloat(product.price) : product.price;
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
    
    const matchesMainCategory = selectedMainCategories.length === 0 || 
      (product.mainCategory && selectedMainCategories.includes(product.mainCategory));
    
    const matchesSubCategory = selectedSubCategories.length === 0 || 
      (product.subCategory && selectedSubCategories.includes(product.subCategory));
    
    const matchesDesigner = selectedDesigners.length === 0 || 
      (product.designer && selectedDesigners.includes(product.designer));
    
    const matchesSize = selectedSizes.length === 0 || 
      (product.sizes && product.sizes.some((s: string) => selectedSizes.includes(s)));

    return matchesSearch && matchesPrice && matchesMainCategory && matchesSubCategory && matchesDesigner && matchesSize;
  });

  const toggleFilter = (value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => 
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setPriceRange([0, 1000]);
    setSelectedMainCategories([]);
    setSelectedSubCategories([]);
    setSelectedSizes([]);
    setSelectedDesigners([]);
  };

  const hasActiveFilters = searchQuery || 
    (priceRange[0] !== 0 || priceRange[1] !== 1000) ||
    selectedMainCategories.length > 0 ||
    selectedSubCategories.length > 0 ||
    selectedSizes.length > 0 ||
    selectedDesigners.length > 0;

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4">Price Range</h3>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          min={0}
          max={1000}
          step={10}
          className="mb-2"
          data-testid="slider-price"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Category</h3>
        <div className="space-y-3">
          {mainCategories.map((mainCat) => {
            const subCategories = getSubCategoriesForMain(mainCat);
            const hasSubCategories = subCategories.length > 0;
            const isExpanded = expandedCategories[mainCat] ?? true;

            return (
              <div key={mainCat} className="space-y-1">
                {hasSubCategories ? (
                  <Collapsible open={isExpanded} onOpenChange={() => toggleCategoryExpanded(mainCat)}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center flex-1 min-w-0">
                        <Checkbox
                          id={`main-${mainCat}`}
                          checked={selectedMainCategories.includes(mainCat)}
                          onCheckedChange={() => toggleFilter(mainCat, setSelectedMainCategories)}
                          data-testid={`checkbox-main-category-${mainCat}`}
                        />
                        <Label htmlFor={`main-${mainCat}`} className="ml-2 text-sm cursor-pointer flex-1">
                          {mainCat}
                        </Label>
                      </div>
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 shrink-0" 
                          data-testid={`button-toggle-${mainCat.toLowerCase()}`}
                        >
                          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent className="pt-1">
                      <div className="ml-6 space-y-2 border-l-2 border-muted pl-3">
                        {subCategories.map((subCat) => (
                          <div key={subCat} className="flex items-center">
                            <Checkbox
                              id={`sub-${subCat}`}
                              checked={selectedSubCategories.includes(subCat)}
                              onCheckedChange={() => toggleFilter(subCat, setSelectedSubCategories)}
                              data-testid={`checkbox-sub-category-${subCat}`}
                            />
                            <Label htmlFor={`sub-${subCat}`} className="ml-2 text-sm cursor-pointer text-muted-foreground">
                              {subCat}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <div className="flex items-center">
                    <Checkbox
                      id={`main-${mainCat}`}
                      checked={selectedMainCategories.includes(mainCat)}
                      onCheckedChange={() => toggleFilter(mainCat, setSelectedMainCategories)}
                      data-testid={`checkbox-main-category-${mainCat}`}
                    />
                    <Label htmlFor={`main-${mainCat}`} className="ml-2 text-sm cursor-pointer">
                      {mainCat}
                    </Label>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Size</h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <Button
              key={size}
              variant={selectedSizes.includes(size) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleFilter(size, setSelectedSizes)}
              data-testid={`button-size-${size}`}
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      {designers.length > 0 && (
        <div>
          <h3 className="font-semibold mb-4">Designer</h3>
          <div className="space-y-2">
            {designers.map((designer) => (
              <div key={designer} className="flex items-center">
                <Checkbox
                  id={`des-${designer}`}
                  checked={selectedDesigners.includes(designer)}
                  onCheckedChange={() => toggleFilter(designer, setSelectedDesigners)}
                  data-testid={`checkbox-designer-${designer}`}
                />
                <Label htmlFor={`des-${designer}`} className="ml-2 text-sm cursor-pointer">
                  {designer}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold mb-4">Shop All</h1>
          <p className="text-muted-foreground">Discover our complete collection</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" data-testid="button-filters-mobile">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterPanel />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Desktop Filters */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <h2 className="font-semibold text-lg mb-6">Filters</h2>
              <FilterPanel />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">Active Filters:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: {searchQuery}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => setSearchQuery("")}
                      data-testid="button-remove-search"
                    />
                  </Badge>
                )}
                {(priceRange[0] !== 0 || priceRange[1] !== 1000) && (
                  <Badge variant="secondary" className="gap-1">
                    ${priceRange[0]} - ${priceRange[1]}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => setPriceRange([0, 1000])}
                      data-testid="button-remove-price"
                    />
                  </Badge>
                )}
                {selectedMainCategories.map((cat) => (
                  <Badge key={cat} variant="secondary" className="gap-1">
                    {cat}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => toggleFilter(cat, setSelectedMainCategories)}
                      data-testid={`button-remove-main-category-${cat}`}
                    />
                  </Badge>
                ))}
                {selectedSubCategories.map((cat) => (
                  <Badge key={cat} variant="secondary" className="gap-1">
                    {cat}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => toggleFilter(cat, setSelectedSubCategories)}
                      data-testid={`button-remove-sub-category-${cat}`}
                    />
                  </Badge>
                ))}
                {selectedSizes.map((size) => (
                  <Badge key={size} variant="secondary" className="gap-1">
                    Size {size}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => toggleFilter(size, setSelectedSizes)}
                      data-testid={`button-remove-size-${size}`}
                    />
                  </Badge>
                ))}
                {selectedDesigners.map((designer) => (
                  <Badge key={designer} variant="secondary" className="gap-1">
                    {designer}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => toggleFilter(designer, setSelectedDesigners)}
                      data-testid={`button-remove-designer-${designer}`}
                    />
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  data-testid="button-clear-all-filters"
                >
                  Clear All
                </Button>
              </div>
            )}

            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground" data-testid="text-results-count">
                {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <div className="aspect-[3/4] bg-muted rounded-lg animate-pulse" />
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground">No products found matching your filters</p>
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="mt-4"
                  data-testid="button-clear-filters"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
