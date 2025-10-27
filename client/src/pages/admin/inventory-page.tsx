import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Package,
  Search,
  AlertTriangle,
  TrendingDown,
  Sparkles,
  Edit,
  RotateCcw,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminInventoryPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [newStock, setNewStock] = useState(0);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const updateStockMutation = useMutation({
    mutationFn: async ({ id, stock }: { id: string; stock: number }) => {
      return await apiRequest("PATCH", `/api/admin/products/${id}/stock`, {
        stock,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      await queryClient.refetchQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Stock updated successfully" });
      setStockDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to update stock", variant: "destructive" });
    },
  });

  const handleStockEdit = (product: Product) => {
    setSelectedProduct(product);
    setNewStock(product.stock);
    setStockDialogOpen(true);
  };

  const handleStockSave = () => {
    if (selectedProduct) {
      updateStockMutation.mutate({ id: selectedProduct.id, stock: newStock });
    }
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesSearch =
          !searchQuery ||
          product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.designer?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
      })
      .sort((a, b) => a.stock - b.stock); // Sort by stock ascending (lowest first)
  }, [products, searchQuery]);

  const criticalStock = products.filter((p) => p.stock === 0);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock < 5);
  const mediumStock = products.filter((p) => p.stock >= 5 && p.stock < 20);
  const totalValue = products.reduce(
    (sum, p) => sum + parseFloat(p.price.toString()) * p.stock,
    0
  );

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return {
        label: "Out of Stock",
        variant: "destructive" as const,
        className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
      };
    } else if (stock < 5) {
      return {
        label: "Critical",
        variant: "destructive" as const,
        className: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
      };
    } else if (stock < 20) {
      return {
        label: "Low",
        variant: "secondary" as const,
        className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
      };
    }
    return {
      label: "Good",
      variant: "secondary" as const,
      className: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    };
  };

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
                Inventory Management
              </h1>
              <p className="text-muted-foreground">Loading inventory...</p>
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
                Inventory Management
              </h1>
              <p className="text-muted-foreground">
                Track and manage product stock levels
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-2 border-red-500/20 bg-gradient-to-br from-red-500/5 to-rose-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Out of Stock
                  </p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {criticalStock.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Immediate action required
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-amber-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Critical Stock
                  </p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {lowStock.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Below 5 units
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-amber-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Low Stock
                  </p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {mediumStock.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    5-19 units
                  </p>
                </div>
                <Package className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Inventory Value
                  </p>
                  <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {products.length} total products
                  </p>
                </div>
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products by name or designer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-inventory"
          />
        </div>
      </div>

      {/* Inventory Table */}
      {filteredProducts.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search query
            </p>
          </div>
        </Card>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Stock Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const status = getStockStatus(product.stock);
                const stockValue =
                  parseFloat(product.price.toString()) * product.stock;

                return (
                  <TableRow
                    key={product.id}
                    data-testid={`row-inventory-${product.id}`}
                    className={product.stock === 0 ? "bg-red-500/5" : product.stock < 5 ? "bg-orange-500/5" : ""}
                  >
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
                          {product.designer && (
                            <p className="text-sm text-muted-foreground">
                              {product.designer}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">{product.mainCategory}</span>
                        {product.subCategory && (
                          <span className="text-xs text-muted-foreground">
                            {product.subCategory}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${parseFloat(product.price.toString()).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-lg font-bold ${
                          product.stock === 0
                            ? "text-red-600 dark:text-red-400"
                            : product.stock < 5
                            ? "text-orange-600 dark:text-orange-400"
                            : ""
                        }`}
                        data-testid={`text-stock-${product.id}`}
                      >
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${stockValue.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={status.variant}
                        className={status.className}
                        data-testid={`badge-status-${product.id}`}
                      >
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStockEdit(product)}
                        data-testid={`button-edit-stock-${product.id}`}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Update Stock
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Stock Update Dialog */}
      <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock Level</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Product</p>
                <p className="font-medium">{selectedProduct.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Current Stock: {selectedProduct.stock}
                </p>
                <Label htmlFor="new-stock">New Stock Level</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setNewStock(Math.max(0, newStock - 10))}
                    data-testid="button-decrease-10"
                  >
                    -10
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setNewStock(Math.max(0, newStock - 1))}
                    data-testid="button-decrease-1"
                  >
                    -1
                  </Button>
                  <Input
                    id="new-stock"
                    type="number"
                    min="0"
                    value={newStock}
                    onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                    className="text-center"
                    data-testid="input-new-stock"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setNewStock(newStock + 1)}
                    data-testid="button-increase-1"
                  >
                    +1
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setNewStock(newStock + 10)}
                    data-testid="button-increase-10"
                  >
                    +10
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setNewStock(selectedProduct.stock)}
                  className="mt-2"
                  data-testid="button-reset-stock"
                >
                  <RotateCcw className="h-3 w-3 mr-2" />
                  Reset to Current
                </Button>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStockDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleStockSave}
                  disabled={updateStockMutation.isPending}
                  data-testid="button-save-stock"
                  className="bg-gradient-to-r from-primary to-accent"
                >
                  {updateStockMutation.isPending ? "Updating..." : "Update Stock"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
