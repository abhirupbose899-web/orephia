import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Category, InsertCategory } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, FolderTree } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CategoriesPage() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["/api/admin/categories"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertCategory) => {
      return await apiRequest("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Success",
        description: "Category added successfully",
      });
      setIsAddDialogOpen(false);
      setMainCategory("");
      setSubCategory("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete category");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      setDeleteId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    },
  });

  const handleAddCategory = () => {
    if (!mainCategory.trim()) {
      toast({
        title: "Error",
        description: "Main category is required",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      mainCategory: mainCategory.trim(),
      subCategory: subCategory.trim() || null,
    });
  };

  // Group categories by main category
  const groupedCategories = categories.reduce((acc, cat) => {
    if (!acc[cat.mainCategory]) {
      acc[cat.mainCategory] = [];
    }
    if (cat.subCategory) {
      acc[cat.mainCategory].push(cat);
    }
    return acc;
  }, {} as Record<string, Category[]>);

  // Get unique main categories
  const mainCategories = Array.from(new Set(categories.map(c => c.mainCategory)));

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-semibold mb-2">Category Management</h1>
          <p className="text-muted-foreground">Manage product categories and subcategories</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-category">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="mainCategory">Main Category *</Label>
                <Input
                  id="mainCategory"
                  placeholder="e.g., Apparels, Shoes, Bags"
                  value={mainCategory}
                  onChange={(e) => setMainCategory(e.target.value)}
                  data-testid="input-main-category"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subCategory">Subcategory (Optional)</Label>
                <Input
                  id="subCategory"
                  placeholder="e.g., Dresses, Sneakers, Handbags"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  data-testid="input-sub-category"
                />
              </div>
              <Button
                onClick={handleAddCategory}
                disabled={createMutation.isPending}
                className="w-full"
                data-testid="button-save-category"
              >
                {createMutation.isPending ? "Adding..." : "Add Category"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted rounded animate-pulse w-1/3" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                  <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : mainCategories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderTree className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No categories yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get started by adding your first category
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-category">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {mainCategories.map((mainCat) => (
            <Card key={mainCat}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderTree className="h-5 w-5" />
                  {mainCat}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {groupedCategories[mainCat]?.length > 0 ? (
                    groupedCategories[mainCat].map((cat) => (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between p-3 rounded-md bg-muted/50 hover-elevate"
                      >
                        <span className="text-sm font-medium" data-testid={`text-subcategory-${cat.subCategory}`}>
                          {cat.subCategory}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(cat.id)}
                          data-testid={`button-delete-${cat.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No subcategories
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
