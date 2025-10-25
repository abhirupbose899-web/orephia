import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingCart, AlertTriangle, DollarSign, TrendingUp, Sparkles } from "lucide-react";

interface AdminStats {
  totalRevenue: string;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  lowStockProducts: number;
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0, // Admin dashboard should always show fresh data
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-4xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-muted-foreground">Loading statistics...</p>
            </div>
          </div>
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
      gradient: "from-green-500/10 to-emerald-500/10",
      iconColor: "text-green-600 dark:text-green-400",
      borderColor: "border-green-500/20",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      description: "All orders placed",
      gradient: "from-primary/10 to-accent/10",
      iconColor: "text-primary",
      borderColor: "border-primary/20",
    },
    {
      title: "Pending Orders",
      value: stats?.pendingOrders || 0,
      icon: TrendingUp,
      description: "Orders awaiting processing",
      gradient: "from-orange-500/10 to-amber-500/10",
      iconColor: "text-orange-600 dark:text-orange-400",
      borderColor: "border-orange-500/20",
    },
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      description: "Products in catalog",
      gradient: "from-purple-500/10 to-pink-500/10",
      iconColor: "text-purple-600 dark:text-purple-400",
      borderColor: "border-purple-500/20",
    },
    {
      title: "Low Stock Items",
      value: stats?.lowStockProducts || 0,
      icon: AlertTriangle,
      description: "Products with stock < 10",
      gradient: "from-red-500/10 to-rose-500/10",
      iconColor: "text-red-600 dark:text-red-400",
      borderColor: "border-red-500/20",
      badge: stats?.lowStockProducts && stats.lowStockProducts > 0 ? "Action Needed" : null,
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-4xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-muted-foreground">Overview of your store performance</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-gradient-to-r from-primary/10 to-accent/10 text-primary border-primary/20">
            <Sparkles className="h-3 w-3 mr-1" />
            Admin Panel
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.title} 
              data-testid={`card-stat-${stat.title.toLowerCase().replace(/ /g, '-')}`}
              className={`border-2 ${stat.borderColor} bg-gradient-to-br ${stat.gradient} hover-elevate transition-all`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                  <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold" data-testid={`text-stat-value-${stat.title.toLowerCase().replace(/ /g, '-')}`}>
                    {stat.value}
                  </div>
                  {stat.badge && (
                    <Badge variant="destructive" className="text-xs">
                      {stat.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
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
