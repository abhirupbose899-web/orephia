import { Link, useLocation } from "wouter";
import { Search, Heart, ShoppingBag, User, Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { CurrencySelector } from "@/components/currency-selector";
import logoImage from "@assets/orephia logo_1761335884349.png";

export function Header() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "HOME", href: "/" },
    { label: "SHOP", href: "/shop" },
    { label: "COLLECTIONS", href: "/collections" },
    { label: "WISHLIST", href: "/wishlist" },
    { label: "REWARDS", href: "/loyalty" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b">
      <div className="max-w-7xl mx-auto">
        <div className="h-20 px-4 md:px-8 flex items-center justify-between gap-4">
          {/* Left: Mobile Menu + Logo */}
          <div className="flex items-center gap-2">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:max-w-sm">
                <div className="flex flex-col space-y-4 mt-8">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <button
                        onClick={() => setMobileMenuOpen(false)}
                        className={`text-lg py-4 block px-4 rounded-lg text-left w-full font-medium transition-all ${
                          location === link.href
                            ? "bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-semibold"
                            : "text-foreground hover-elevate active-elevate-2"
                        }`}
                        data-testid={`link-${link.label.toLowerCase()}-mobile`}
                      >
                        {link.label}
                      </button>
                    </Link>
                  ))}
                  {user && (
                    <Link href="/profile">
                      <button
                        onClick={() => setMobileMenuOpen(false)}
                        className={`text-lg py-4 block px-4 rounded-lg text-left w-full font-medium transition-all ${
                          location === "/profile"
                            ? "bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-semibold"
                            : "text-foreground hover-elevate active-elevate-2"
                        }`}
                        data-testid="link-profile-mobile"
                      >
                        PROFILE
                      </button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/">
              <div className="flex items-center cursor-pointer group" data-testid="link-home">
                <div className="relative">
                  <img src={logoImage} alt="Orephia" className="h-20 w-20 object-contain transition-transform group-hover:scale-105" />
                  <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <button
                  className={`text-sm font-medium tracking-wider transition-all relative group ${
                    location === link.href 
                      ? "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-semibold" 
                      : "text-muted-foreground hover:bg-gradient-to-r hover:from-primary hover:to-accent hover:bg-clip-text hover:text-transparent"
                  }`}
                  data-testid={`link-${link.label.toLowerCase()}`}
                >
                  {link.label}
                  {location === link.href && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full"></span>
                  )}
                </button>
              </Link>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <CurrencySelector />
            <Button variant="ghost" size="icon" className="hover:text-primary transition-colors" data-testid="button-search">
              <Search className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:text-primary transition-colors"
              onClick={() => window.location.href = '/wishlist'}
              data-testid="button-wishlist"
            >
              <Heart className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover:text-primary transition-colors" 
              onClick={() => window.location.href = '/cart'}
              data-testid="button-cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge
                  variant="default"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gradient-to-r from-primary to-accent border-0"
                  data-testid="text-cart-count"
                >
                  {cartCount}
                </Badge>
              )}
            </Button>
            {user ? (
              <Link href="/profile">
                <button
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover-elevate active-elevate-2 group"
                  data-testid="button-profile"
                >
                  <span className="hidden md:block text-sm font-medium group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-accent group-hover:bg-clip-text group-hover:text-transparent transition-all">
                    Hi, {(user.fullName || user.username).split(' ')[0]}
                  </span>
                  <User className="h-5 w-5 group-hover:text-primary transition-colors" />
                </button>
              </Link>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:text-primary transition-colors"
                onClick={() => window.location.href = '/auth'}
                data-testid="button-profile"
              >
                <User className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
