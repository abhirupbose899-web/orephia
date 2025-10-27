import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product, Category } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, Package, Search, Sparkles, Filter, RefreshCw } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";

export default function AdminProductsPage() {
  const { toast } = useToast();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all");

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0, // Admin products should always show fresh data
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/admin/categories"],
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0, // Admin categories should always show fresh data
  });

  // Get unique main categories
  const mainCategories = useMemo(() => {
    return Array.from(new Set(categories.map(c => c.mainCategory)));
  }, [categories]);

  // Get filtered subcategories based on selected main category
  const getSubCategories = (mainCategory: string) => {
    return categories
      .filter(c => c.mainCategory === mainCategory && c.subCategory)
      .map(c => c.subCategory!);
  };

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      price: "",
      stock: 0,
      mainCategory: "",
      subCategory: "",
      designer: "",
      images: "",
      sizes: "",
      colors: "",
      tags: "",
      newArrival: false,
    },
  });

  const updateStockMutation = useMutation({
    mutationFn: async ({ id, stock }: { id: string; stock: number }) => {
      return await apiRequest("PATCH", `/api/admin/products/${id}/stock`, { stock });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      await queryClient.refetchQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Stock updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update stock", variant: "destructive" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/products/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      await queryClient.refetchQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Product deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete product", variant: "destructive" });
    },
  });

  const syncShopifyMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/shopify/sync", {});
      return await res.json();
    },
    onSuccess: async (data: any) => {
      await queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      await queryClient.refetchQueries({ queryKey: ["/api/admin/stats"] });
      toast({ 
        title: "Shopify sync completed", 
        description: `Synced: ${data.results.synced}, Updated: ${data.results.updated}` 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Shopify sync failed", 
        description: error.message || "Failed to sync products from Shopify",
        variant: "destructive" 
      });
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/products", data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      await queryClient.refetchQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Product created successfully" });
      setDialogOpen(false);
      setIsCreating(false);
    },
    onError: () => {
      toast({ title: "Failed to create product", variant: "destructive" });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async (data: { id: string; updates: any }) => {
      return await apiRequest("PATCH", `/api/admin/products/${data.id}`, data.updates);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      await queryClient.refetchQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Product updated successfully" });
      setDialogOpen(false);
      setEditingProduct(null);
    },
    onError: () => {
      toast({ title: "Failed to update product", variant: "destructive" });
    },
  });

  const handleStockChange = (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    updateStockMutation.mutate({ id: product.id, stock: newStock });
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingProduct(null);
    form.reset({
      title: "",
      description: "",
      price: "",
      stock: 0,
      mainCategory: "",
      subCategory: "",
      designer: "",
      images: "",
      sizes: "",
      colors: "",
      tags: "",
      newArrival: false,
    });
    setDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setIsCreating(false);
    setEditingProduct(product);
    form.reset({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock,
      mainCategory: product.mainCategory || "",
      subCategory: product.subCategory || "",
      designer: product.designer || "",
      images: product.images?.join(", ") || "",
      sizes: product.sizes?.join(", ") || "",
      colors: product.colors?.join(", ") || "",
      tags: product.tags?.join(", ") || "",
      newArrival: product.newArrival || false,
    });
    setDialogOpen(true);
  };

  const handleSave = (formData: any) => {
    const productData = {
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: formData.stock,
      category: formData.mainCategory || 'Uncategorized', // Required field
      mainCategory: formData.mainCategory,
      subCategory: formData.subCategory || null,
      designer: formData.designer || null,
      images: formData.images ? formData.images.split(",").map((s: string) => s.trim()).filter((s: string) => s) : [],
      sizes: formData.sizes ? formData.sizes.split(",").map((s: string) => s.trim()).filter((s: string) => s) : [],
      colors: formData.colors ? formData.colors.split(",").map((s: string) => s.trim()).filter((s: string) => s) : [],
      tags: formData.tags ? formData.tags.split(",").map((s: string) => s.trim()).filter((s: string) => s) : [],
      newArrival: formData.newArrival || false,
    };

    if (isCreating) {
      createProductMutation.mutate(productData);
    } else if (editingProduct) {
      updateProductMutation.mutate({
        id: editingProduct.id,
        updates: productData,
      });
    }
  };

  // Filter products based on search and stock filter
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = !searchQuery || 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.designer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.mainCategory?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStock = 
        stockFilter === "all" ||
        (stockFilter === "low" && product.stock > 0 && product.stock < 10) ||
        (stockFilter === "out" && product.stock === 0);
      
      return matchesSearch && matchesStock;
    });
  }, [products, searchQuery, stockFilter]);

  const lowStockCount = products.filter(p => p.stock > 0 && p.stock < 10).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-4xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Products
              </h1>
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-4xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Products
              </h1>
              <p className="text-muted-foreground">Manage your product catalog</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => syncShopifyMutation.mutate()} 
              disabled={syncShopifyMutation.isPending}
              variant="outline"
              data-testid="button-sync-shopify"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncShopifyMutation.isPending ? 'animate-spin' : ''}`} />
              {syncShopifyMutation.isPending ? 'Syncing...' : 'Sync from Shopify'}
            </Button>
            <Button onClick={handleCreate} data-testid="button-add-product" className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{products.length}</p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-amber-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{lowStockCount}</p>
                </div>
                <Badge variant="destructive">{lowStockCount} items</Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-red-500/20 bg-gradient-to-br from-red-500/5 to-rose-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{outOfStockCount}</p>
                </div>
                <Badge variant="destructive">{outOfStockCount} items</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name, designer, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-products"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={stockFilter === "all" ? "default" : "outline"}
              onClick={() => setStockFilter("all")}
              data-testid="button-filter-all"
            >
              All
            </Button>
            <Button
              variant={stockFilter === "low" ? "default" : "outline"}
              onClick={() => setStockFilter("low")}
              data-testid="button-filter-low"
            >
              <Filter className="h-4 w-4 mr-2" />
              Low Stock
            </Button>
            <Button
              variant={stockFilter === "out" ? "default" : "outline"}
              onClick={() => setStockFilter("out")}
              data-testid="button-filter-out"
            >
              Out of Stock
            </Button>
          </div>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || stockFilter !== "all" 
                ? "Try adjusting your search or filters" 
                : "Get started by adding your first product"}
            </p>
            {!searchQuery && stockFilter === "all" && (
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {product.images && product.images[0] ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.title}
                        className="h-12 w-12 object-cover rounded"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{product.title}</p>
                      <p className="text-sm text-muted-foreground">{product.designer}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm">{product.mainCategory}</span>
                    {product.subCategory && (
                      <span className="text-xs text-muted-foreground">{product.subCategory}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>${parseFloat(product.price.toString()).toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStockChange(product, -1)}
                      data-testid={`button-decrease-stock-${product.id}`}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center" data-testid={`text-stock-${product.id}`}>
                      {product.stock}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStockChange(product, 1)}
                      data-testid={`button-increase-stock-${product.id}`}
                    >
                      +
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  {product.stock === 0 ? (
                    <Badge variant="destructive" data-testid={`badge-status-${product.id}`}>Out of Stock</Badge>
                  ) : product.stock < 10 ? (
                    <Badge variant="destructive" className="bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20" data-testid={`badge-status-${product.id}`}>Low Stock</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20" data-testid={`badge-status-${product.id}`}>In Stock</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(product)}
                      data-testid={`button-edit-${product.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this product?")) {
                          deleteProductMutation.mutate(product.id);
                        }
                      }}
                      data-testid={`button-delete-${product.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreating ? "Add New Product" : "Edit Product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input {...form.register("title")} id="title" data-testid="input-title" required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea {...form.register("description")} id="description" data-testid="input-description" required />
            </div>
            <div>
              <Label htmlFor="designer">Designer/Brand</Label>
              <Input {...form.register("designer")} id="designer" data-testid="input-designer" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (USD)</Label>
                <Input {...form.register("price")} id="price" type="number" step="0.01" data-testid="input-price" required />
              </div>
              <div>
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input {...form.register("stock", { valueAsNumber: true })} id="stock" type="number" data-testid="input-stock" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mainCategory">Main Category *</Label>
                <Select 
                  value={form.watch("mainCategory")} 
                  onValueChange={(value) => {
                    form.setValue("mainCategory", value);
                    // Reset subcategory when main category changes
                    form.setValue("subCategory", "");
                  }}
                >
                  <SelectTrigger data-testid="select-main-category">
                    <SelectValue placeholder="Select main category" />
                  </SelectTrigger>
                  <SelectContent>
                    {mainCategories.map((cat) => (
                      <SelectItem key={cat} value={cat} data-testid={`option-main-${cat}`}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subCategory">Sub Category</Label>
                <Select 
                  value={form.watch("subCategory")} 
                  onValueChange={(value) => form.setValue("subCategory", value)}
                  disabled={!form.watch("mainCategory")}
                >
                  <SelectTrigger data-testid="select-sub-category">
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {getSubCategories(form.watch("mainCategory")).map((subCat) => (
                      <SelectItem key={subCat} value={subCat} data-testid={`option-sub-${subCat}`}>
                        {subCat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="images">Image URLs (comma-separated)</Label>
              <Textarea {...form.register("images")} id="images" placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg" data-testid="input-images" rows={2} />
            </div>
            <div>
              <Label htmlFor="sizes">Available Sizes (comma-separated)</Label>
              <Input {...form.register("sizes")} id="sizes" placeholder="XS, S, M, L, XL" data-testid="input-sizes" />
            </div>
            <div>
              <Label htmlFor="colors">Available Colors (comma-separated)</Label>
              <Input {...form.register("colors")} id="colors" placeholder="Black, White, Navy" data-testid="input-colors" />
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input {...form.register("tags")} id="tags" placeholder="casual, formal, summer" data-testid="input-tags" />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="newArrival"
                checked={form.watch("newArrival")}
                onCheckedChange={(checked) => form.setValue("newArrival", checked as boolean)}
                data-testid="checkbox-new-arrival"
              />
              <Label htmlFor="newArrival" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Mark as New Arrival
              </Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel">
                Cancel
              </Button>
              <Button type="submit" disabled={createProductMutation.isPending || updateProductMutation.isPending} data-testid="button-save">
                {createProductMutation.isPending || updateProductMutation.isPending ? "Saving..." : isCreating ? "Create Product" : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
