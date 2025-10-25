import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product } from "@shared/schema";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";

export default function AdminProductsPage() {
  const { toast } = useToast();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete product", variant: "destructive" });
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/products", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
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
      mainCategory: formData.mainCategory,
      subCategory: formData.subCategory || null,
      designer: formData.designer || null,
      images: formData.images ? formData.images.split(",").map((s: string) => s.trim()) : [],
      sizes: formData.sizes ? formData.sizes.split(",").map((s: string) => s.trim()) : [],
      colors: formData.colors ? formData.colors.split(",").map((s: string) => s.trim()) : [],
      tags: formData.tags ? formData.tags.split(",").map((s: string) => s.trim()) : [],
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

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-semibold mb-2">Products</h1>
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-4xl font-semibold mb-2">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button onClick={handleCreate} data-testid="button-add-product">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

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
            {products.map((product) => (
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
                  {product.stock < 10 ? (
                    <Badge variant="destructive" data-testid={`badge-status-${product.id}`}>Low Stock</Badge>
                  ) : (
                    <Badge variant="secondary" data-testid={`badge-status-${product.id}`}>In Stock</Badge>
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
                <Label htmlFor="mainCategory">Main Category</Label>
                <Input {...form.register("mainCategory")} id="mainCategory" placeholder="e.g., Apparels, Shoes, Bags" data-testid="input-mainCategory" required />
              </div>
              <div>
                <Label htmlFor="subCategory">Sub Category</Label>
                <Input {...form.register("subCategory")} id="subCategory" placeholder="e.g., Dresses, Jackets" data-testid="input-subCategory" />
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
