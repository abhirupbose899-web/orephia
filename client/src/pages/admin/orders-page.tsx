import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Order } from "@shared/schema";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Sparkles, Package, Truck, CheckCircle2, XCircle, Eye, MapPin, User as UserIcon, Phone, Mail } from "lucide-react";

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);

  const { data: allOrders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0, // Admin orders should always show fresh data
  });

  // Filter orders client-side based on status filter
  const orders = statusFilter === "all" 
    ? allOrders 
    : allOrders.filter(order => order.orderStatus === statusFilter);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest("PATCH", `/api/admin/orders/${id}/status`, { orderStatus: status });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      await queryClient.refetchQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Order status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update order status", variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { variant: "default" | "secondary" | "destructive"; className: string; icon: any }> = {
      processing: { 
        variant: "default", 
        className: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
        icon: Package
      },
      shipped: { 
        variant: "secondary", 
        className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
        icon: Truck
      },
      delivered: { 
        variant: "secondary", 
        className: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
        icon: CheckCircle2
      },
      cancelled: { 
        variant: "destructive",
        className: "",
        icon: XCircle
      },
    };
    const config = configs[status] || configs.processing;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getPaymentBadge = (status: string) => {
    return status === "paid" ? (
      <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Paid
      </Badge>
    ) : (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const processingOrders = orders.filter(o => o.orderStatus === "processing").length;
  const shippedOrders = orders.filter(o => o.orderStatus === "shipped").length;
  const deliveredOrders = orders.filter(o => o.orderStatus === "delivered").length;

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
              <ShoppingCart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-4xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Orders
              </h1>
              <p className="text-muted-foreground">Loading orders...</p>
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
              <ShoppingCart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-4xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Orders
              </h1>
              <p className="text-muted-foreground">Manage customer orders</p>
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48" data-testid="select-status-filter">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{orders.length}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-amber-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Processing</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{processingOrders}</p>
                </div>
                <Package className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-cyan-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Shipped</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{shippedOrders}</p>
                </div>
                <Truck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{deliveredOrders}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                <TableCell className="font-mono text-sm">
                  {order.id.substring(0, 8)}
                </TableCell>
                <TableCell>
                  {format(new Date(order.createdAt || Date.now()), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{order.shippingAddress.fullName}</p>
                    <p className="text-sm text-muted-foreground">{order.shippingAddress.phone}</p>
                  </div>
                </TableCell>
                <TableCell>{order.items.length} items</TableCell>
                <TableCell className="font-medium">
                  ${parseFloat(order.total.toString()).toFixed(2)}
                </TableCell>
                <TableCell>{getPaymentBadge(order.paymentStatus)}</TableCell>
                <TableCell>{getStatusBadge(order.orderStatus)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedOrder(order);
                        setOrderDetailOpen(true);
                      }}
                      data-testid={`button-view-${order.id}`}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Select
                      value={order.orderStatus}
                      onValueChange={(value) =>
                        updateStatusMutation.mutate({ id: order.id, status: value })
                      }
                    >
                      <SelectTrigger className="w-36" data-testid={`select-status-${order.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No orders found
        </div>
      )}

      {/* Order Detail Modal */}
      <Dialog open={orderDetailOpen} onOpenChange={setOrderDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Header */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-mono font-medium">{selectedOrder.id}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Placed on {format(new Date(selectedOrder.createdAt || Date.now()), "MMMM dd, yyyy 'at' hh:mm a")}
                  </p>
                </div>
                <div className="flex gap-2">
                  {getPaymentBadge(selectedOrder.paymentStatus)}
                  {getStatusBadge(selectedOrder.orderStatus)}
                </div>
              </div>

              <Separator />

              {/* Customer Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedOrder.shippingAddress.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      {selectedOrder.shippingAddress.phone}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Shipping Address */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Shipping Address
                </h3>
                <div className="space-y-1">
                  <p>{selectedOrder.shippingAddress.address}</p>
                  <p>
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
                  </p>
                  <p>{selectedOrder.shippingAddress.country}</p>
                </div>
              </div>

              <Separator />

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Order Items
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-lg border">
                      <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>Qty: {item.quantity}</span>
                          {item.size && <span>Size: {item.size}</span>}
                          {item.color && <span>Color: {item.color}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${parseFloat(item.price.toString()).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">each</p>
                      </div>
                      <div className="text-right font-medium">
                        ${(parseFloat(item.price.toString()) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Order Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span className="font-medium">
                    ${(parseFloat(selectedOrder.total.toString()) + parseFloat((selectedOrder.discount || 0).toString())).toFixed(2)}
                  </span>
                </div>
                {selectedOrder.discount && parseFloat(selectedOrder.discount.toString()) > 0 && (
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                    <span>
                      Discount {selectedOrder.couponCode && `(${selectedOrder.couponCode})`}
                    </span>
                    <span>-${parseFloat(selectedOrder.discount.toString()).toFixed(2)}</span>
                  </div>
                )}
                {selectedOrder.pointsRedeemed && selectedOrder.pointsRedeemed > 0 && (
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                    <span>Points Redeemed ({selectedOrder.pointsRedeemed} pts)</span>
                    <span>-${(selectedOrder.pointsRedeemed / 100).toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${parseFloat(selectedOrder.total.toString()).toFixed(2)}</span>
                </div>
                {selectedOrder.pointsEarned && selectedOrder.pointsEarned > 0 && (
                  <div className="flex justify-between text-sm text-primary">
                    <span>Loyalty Points Earned</span>
                    <span className="font-medium">+{selectedOrder.pointsEarned} pts</span>
                  </div>
                )}
              </div>

              {/* Payment Information */}
              {selectedOrder.paymentId && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Payment ID</p>
                  <p className="font-mono text-sm">{selectedOrder.paymentId}</p>
                </div>
              )}

              {/* Update Status */}
              <div className="pt-4 border-t">
                <label className="text-sm font-medium mb-2 block">Update Order Status</label>
                <Select
                  value={selectedOrder.orderStatus}
                  onValueChange={(value) => {
                    updateStatusMutation.mutate({ id: selectedOrder.id, status: value });
                    setOrderDetailOpen(false);
                  }}
                >
                  <SelectTrigger data-testid="select-modal-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
