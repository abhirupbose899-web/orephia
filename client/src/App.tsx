import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { CartProvider } from "@/hooks/use-cart";
import { CurrencyProvider } from "@/hooks/use-currency";
import { ProtectedRoute } from "./lib/protected-route";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ScrollToTop } from "@/components/scroll-to-top";
import { AdminLayout } from "@/components/admin-layout";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ShopPage from "@/pages/shop-page";
import ProductDetailPage from "@/pages/product-detail-page";
import CartPage from "@/pages/cart-page";
import WishlistPage from "@/pages/wishlist-page";
import CheckoutPage from "@/pages/checkout-page";
import ProfilePage from "@/pages/profile-page";
import CollectionsPage from "@/pages/collections-page";
import StyleJourneyPage from "@/pages/style-journey-page";
import AboutPage from "@/pages/about-page";
import ContactPage from "@/pages/contact-page";
import PrivacyPage from "@/pages/privacy-page";
import DisclaimerPage from "@/pages/disclaimer-page";
import LoyaltyPage from "@/pages/loyalty-page";
import AdminDashboardPage from "@/pages/admin/dashboard-page";
import AdminHomepagePage from "@/pages/admin/homepage-page";
import AdminProductsPage from "@/pages/admin/products-page";
import AdminCategoriesPage from "@/pages/admin/categories-page";
import AdminOrdersPage from "@/pages/admin/orders-page";
import AdminCouponsPage from "@/pages/admin/coupons-page";
import ForgotPasswordPage from "@/pages/forgot-password-page";
import ResetPasswordPage from "@/pages/reset-password-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/shop" component={ShopPage} />
      <Route path="/product/:id" component={ProductDetailPage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/collections" component={CollectionsPage} />
      <ProtectedRoute path="/style-journey" component={StyleJourneyPage} />
      <ProtectedRoute path="/wishlist" component={WishlistPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/disclaimer" component={DisclaimerPage} />
      <ProtectedRoute path="/loyalty" component={LoyaltyPage} />
      <ProtectedRoute path="/checkout" component={CheckoutPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <Route path="/admin">
        {() => (<>
          <AdminLayout>
            <AdminDashboardPage />
          </AdminLayout>
        </>)}
      </Route>
      <Route path="/admin/homepage">
        {() => (<>
          <AdminLayout>
            <AdminHomepagePage />
          </AdminLayout>
        </>)}
      </Route>
      <Route path="/admin/products">
        {() => (<>
          <AdminLayout>
            <AdminProductsPage />
          </AdminLayout>
        </>)}
      </Route>
      <Route path="/admin/categories">
        {() => (<>
          <AdminLayout>
            <AdminCategoriesPage />
          </AdminLayout>
        </>)}
      </Route>
      <Route path="/admin/orders">
        {() => (<>
          <AdminLayout>
            <AdminOrdersPage />
          </AdminLayout>
        </>)}
      </Route>
      <Route path="/admin/coupons">
        {() => (<>
          <AdminLayout>
            <AdminCouponsPage />
          </AdminLayout>
        </>)}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CurrencyProvider>
          <CartProvider>
            <TooltipProvider>
              <ScrollToTop />
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  <Router />
                </main>
                <Footer />
              </div>
              <Toaster />
            </TooltipProvider>
          </CartProvider>
        </CurrencyProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
