import { Link, useLocation } from "wouter";
import { Search, Heart, ShoppingBag, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
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
                        className="text-lg py-4 block text-foreground hover-elevate active-elevate-2 px-4 rounded-lg text-left w-full"
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
                        className="text-lg py-4 block text-foreground hover-elevate active-elevate-2 px-4 rounded-lg text-left w-full"
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
              <div className="flex items-center gap-3 cursor-pointer" data-testid="link-home">
                <img src={logoImage} alt="Orephia" className="h-12 w-12 object-contain" />
                <span className="font-serif text-2xl font-semibold hidden sm:block">Orephia</span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <button
                  className={`text-sm font-medium tracking-wider transition-colors ${
                    location === link.href ? "text-foreground" : "text-muted-foreground"
                  } hover:text-foreground`}
                  data-testid={`link-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </button>
              </Link>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" data-testid="button-search">
              <Search className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => window.location.href = '/wishlist'}
              data-testid="button-wishlist"
            >
              <Heart className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative" 
              onClick={() => window.location.href = '/cart'}
              data-testid="button-cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge
                  variant="default"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  data-testid="text-cart-count"
                >
                  {cartCount}
                </Badge>
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => window.location.href = (user ? '/profile' : '/auth')}
              data-testid="button-profile"
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
