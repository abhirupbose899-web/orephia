import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Coupon } from "@shared/schema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil } from "lucide-react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";

export default function AdminCouponsPage() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const { data: coupons = [], isLoading } = useQuery<Coupon[]>({
    queryKey: ["/api/admin/coupons"],
  });

  const form = useForm({
    defaultValues: {
      code: "",
      discountType: "percentage",
      discountValue: "",
      minPurchase: "",
      maxDiscount: "",
      usageLimit: "",
      expiresAt: "",
    },
  });

  const createCouponMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      toast({ title: "Coupon created successfully" });
      setDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to create coupon", variant: "destructive" });
    },
  });

  const updateCouponMutation = useMutation({
    mutationFn: async (data: { id: string; updates: any }) => {
      return await apiRequest(`/api/admin/coupons/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data.updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      toast({ title: "Coupon updated successfully" });
      setDialogOpen(false);
      setEditingCoupon(null);
    },
    onError: () => {
      toast({ title: "Failed to update coupon", variant: "destructive" });
    },
  });

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    form.reset({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minPurchase: coupon.minPurchase?.toString() || "",
      maxDiscount: coupon.maxDiscount?.toString() || "",
      usageLimit: coupon.usageLimit?.toString() || "",
      expiresAt: coupon.expiresAt ? format(new Date(coupon.expiresAt), "yyyy-MM-dd") : "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = (formData: any) => {
    const data = {
      code: formData.code.toUpperCase(),
      discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue),
      minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : null,
      maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
      isActive: true,
    };

    if (editingCoupon) {
      updateCouponMutation.mutate({ id: editingCoupon.id, updates: data });
    } else {
      createCouponMutation.mutate(data);
    }
  };

  const toggleStatus = (coupon: Coupon) => {
    updateCouponMutation.mutate({
      id: coupon.id,
      updates: { isActive: !coupon.isActive },
    });
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-semibold mb-2">Coupons</h1>
          <p className="text-muted-foreground">Loading coupons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-4xl font-semibold mb-2">Coupons</h1>
          <p className="text-muted-foreground">Manage discount coupons</p>
        </div>
        <Button onClick={() => { setEditingCoupon(null); form.reset(); setDialogOpen(true); }} data-testid="button-create-coupon">
          <Plus className="h-4 w-4 mr-2" />
          Create Coupon
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Used</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon.id} data-testid={`row-coupon-${coupon.id}`}>
                <TableCell className="font-mono font-semibold">{coupon.code}</TableCell>
                <TableCell className="capitalize">{coupon.discountType}</TableCell>
                <TableCell>
                  {coupon.discountType === "percentage"
                    ? `${coupon.discountValue}%`
                    : `$${parseFloat(coupon.discountValue.toString()).toFixed(2)}`}
                  {coupon.maxDiscount && (
                    <span className="text-sm text-muted-foreground ml-1">
                      (max ${parseFloat(coupon.maxDiscount.toString()).toFixed(2)})
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {coupon.usedCount}/{coupon.usageLimit || "∞"}
                </TableCell>
                <TableCell>
                  {coupon.expiresAt
                    ? format(new Date(coupon.expiresAt), "MMM dd, yyyy")
                    : "No expiry"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={coupon.isActive ? "secondary" : "destructive"}
                    className="cursor-pointer"
                    onClick={() => toggleStatus(coupon)}
                    data-testid={`badge-status-${coupon.id}`}
                  >
                    {coupon.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(coupon)}
                    data-testid={`button-edit-${coupon.id}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCoupon ? "Edit Coupon" : "Create Coupon"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="code">Coupon Code</Label>
              <Input
                {...form.register("code")}
                id="code"
                placeholder="SAVE20"
                className="uppercase"
                data-testid="input-code"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discountType">Discount Type</Label>
                <Select
                  value={form.watch("discountType")}
                  onValueChange={(value) => form.setValue("discountType", value)}
                >
                  <SelectTrigger data-testid="select-discountType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="discountValue">Discount Value</Label>
                <Input
                  {...form.register("discountValue")}
                  id="discountValue"
                  type="number"
                  step="0.01"
                  data-testid="input-discountValue"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minPurchase">Min Purchase ($)</Label>
                <Input
                  {...form.register("minPurchase")}
                  id="minPurchase"
                  type="number"
                  step="0.01"
                  placeholder="Optional"
                  data-testid="input-minPurchase"
                />
              </div>
              <div>
                <Label htmlFor="maxDiscount">Max Discount ($)</Label>
                <Input
                  {...form.register("maxDiscount")}
                  id="maxDiscount"
                  type="number"
                  step="0.01"
                  placeholder="Optional"
                  data-testid="input-maxDiscount"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="usageLimit">Usage Limit</Label>
                <Input
                  {...form.register("usageLimit")}
                  id="usageLimit"
                  type="number"
                  placeholder="Unlimited"
                  data-testid="input-usageLimit"
                />
              </div>
              <div>
                <Label htmlFor="expiresAt">Expiration Date</Label>
                <Input
                  {...form.register("expiresAt")}
                  id="expiresAt"
                  type="date"
                  data-testid="input-expiresAt"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createCouponMutation.isPending || updateCouponMutation.isPending}
                data-testid="button-save"
              >
                {editingCoupon ? "Update" : "Create"} Coupon
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
