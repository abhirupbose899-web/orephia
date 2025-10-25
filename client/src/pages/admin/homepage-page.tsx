import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product, HomepageContent } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Home, Image as ImageIcon, Star } from "lucide-react";

export default function AdminHomepagePage() {
  const { toast } = useToast();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const { data: homepageContent } = useQuery<HomepageContent>({
    queryKey: ["/api/homepage"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const form = useForm({
    defaultValues: {
      heroTitle: "",
      heroSubtitle: "",
      heroImage: "",
    },
  });

  useEffect(() => {
    if (homepageContent) {
      form.reset({
        heroTitle: homepageContent.heroTitle || "",
        heroSubtitle: homepageContent.heroSubtitle || "",
        heroImage: homepageContent.heroImage || "",
      });
      setSelectedProducts(homepageContent.featuredProductIds || []);
    }
  }, [homepageContent]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PATCH", "/api/admin/homepage", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/homepage"] });
      toast({ title: "Homepage updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update homepage", variant: "destructive" });
    },
  });

  const handleSubmit = (formData: any) => {
    updateMutation.mutate({
      heroTitle: formData.heroTitle || null,
      heroSubtitle: formData.heroSubtitle || null,
      heroImage: formData.heroImage || null,
      featuredProductIds: selectedProducts,
    });
  };

  const toggleProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Home className="h-8 w-8" />
          <h1 className="font-serif text-4xl font-semibold">Homepage Management</h1>
        </div>
        <p className="text-muted-foreground">Customize your homepage hero section and featured products</p>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Hero Section
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="heroTitle">Hero Title</Label>
              <Input
                {...form.register("heroTitle")}
                id="heroTitle"
                placeholder="e.g., Discover Timeless Elegance"
                data-testid="input-hero-title"
              />
            </div>
            <div>
              <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
              <Textarea
                {...form.register("heroSubtitle")}
                id="heroSubtitle"
                placeholder="e.g., Curated luxury fashion for the modern woman"
                rows={2}
                data-testid="input-hero-subtitle"
              />
            </div>
            <div>
              <Label htmlFor="heroImage">Hero Background Image URL</Label>
              <Input
                {...form.register("heroImage")}
                id="heroImage"
                placeholder="https://example.com/hero-image.jpg"
                data-testid="input-hero-image"
              />
              {form.watch("heroImage") && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                  <img
                    src={form.watch("heroImage")}
                    alt="Hero preview"
                    className="w-full h-48 object-cover rounded-md"
                    onError={(e) => {
                      e.currentTarget.src = "";
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Featured Products ({selectedProducts.length} selected)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Select products to feature on the homepage
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-start gap-3 p-3 border rounded-md hover-elevate"
                  data-testid={`product-item-${product.id}`}
                >
                  <Checkbox
                    checked={selectedProducts.includes(product.id)}
                    onCheckedChange={() => toggleProduct(product.id)}
                    data-testid={`checkbox-product-${product.id}`}
                  />
                  <div className="flex gap-3 flex-1">
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="h-16 w-16 object-cover rounded"
                      />
                    ) : (
                      <div className="h-16 w-16 bg-muted rounded flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.title}</p>
                      <p className="text-sm text-muted-foreground">{product.designer}</p>
                      <p className="text-sm font-semibold">${parseFloat(product.price.toString()).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            data-testid="button-save-homepage"
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
