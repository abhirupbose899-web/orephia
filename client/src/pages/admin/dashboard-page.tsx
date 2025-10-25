import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, AlertTriangle, DollarSign, TrendingUp } from "lucide-react";

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-semibold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Loading statistics...</p>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Total Revenue",
      value: `$${parseFloat(stats?.totalRevenue || "0").toFixed(2)}`,
      icon: DollarSign,
      description: "Total revenue from completed orders",
      color: "text-green-600",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      description: "All orders placed",
      color: "text-blue-600",
    },
    {
      title: "Pending Orders",
      value: stats?.pendingOrders || 0,
      icon: TrendingUp,
      description: "Orders awaiting processing",
      color: "text-orange-600",
    },
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      description: "Products in catalog",
      color: "text-purple-600",
    },
    {
      title: "Low Stock Items",
      value: stats?.lowStockProducts || 0,
      icon: AlertTriangle,
      description: "Products with stock < 10",
      color: "text-red-600",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-semibold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your store performance</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} data-testid={`card-stat-${stat.title.toLowerCase().replace(/ /g, '-')}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid={`text-stat-value-${stat.title.toLowerCase().replace(/ /g, '-')}`}>
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
