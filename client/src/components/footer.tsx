import { Link } from "wouter";
import { Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-accent/5 via-primary/5 to-accent/5 border-t">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-serif text-2xl font-bold text-primary">Orephia</h3>
            <p className="text-sm text-muted-foreground">
              Luxury women's fashion curated with elegance and sophistication
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/shop">
                  <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-footer-shop">
                    Shop
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/collections">
                  <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-footer-collections">
                    Collections
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/style-journey">
                  <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-footer-style">
                    Style Journey
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Information</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about">
                  <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-footer-about">
                    About Us
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-footer-contact">
                    Contact Us
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-footer-privacy">
                    Privacy Policy
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/disclaimer">
                  <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-footer-disclaimer">
                    Disclaimer
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>support@orephia.com</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>123 Fashion Street, New York, NY 10001</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Orephia. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy">
                <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                  Privacy
                </span>
              </Link>
              <Link href="/disclaimer">
                <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                  Disclaimer
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
