import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-primary/5 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20" data-testid="badge-privacy">
            Privacy & Security
          </Badge>
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-lg text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardContent className="p-8 md:p-12">
              <h2 className="font-serif text-2xl font-bold mb-4">Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                At Orephia, we are committed to protecting your privacy and ensuring the security of your personal information.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our
                website and use our services.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8 md:p-12">
              <h2 className="font-serif text-2xl font-bold mb-4">Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Personal Information</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We collect information you provide directly to us, including:
                  </p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                    <li>Name, email address, and contact information</li>
                    <li>Billing and shipping addresses</li>
                    <li>Payment information (processed securely through our payment partners)</li>
                    <li>Account credentials and profile information</li>
                    <li>Purchase history and preferences</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Automatically Collected Information</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We automatically collect certain information when you visit our website:
                  </p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                    <li>Device and browser information</li>
                    <li>IP address and location data</li>
                    <li>Browsing behavior and preferences</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8 md:p-12">
              <h2 className="font-serif text-2xl font-bold mb-4">How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use the information we collect for various purposes, including:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                <li>Processing and fulfilling your orders</li>
                <li>Providing customer support and responding to inquiries</li>
                <li>Personalizing your shopping experience with AI-powered recommendations</li>
                <li>Sending order confirmations and shipping notifications</li>
                <li>Communicating promotional offers and updates (with your consent)</li>
                <li>Improving our website, products, and services</li>
                <li>Detecting and preventing fraud and security threats</li>
                <li>Complying with legal obligations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8 md:p-12">
              <h2 className="font-serif text-2xl font-bold mb-4">Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard security measures to protect your personal information, including:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground mt-4 space-y-2">
                <li>Secure Socket Layer (SSL) encryption for data transmission</li>
                <li>Secure payment processing through trusted payment partners</li>
                <li>Regular security audits and monitoring</li>
                <li>Restricted access to personal information</li>
                <li>Employee training on data protection practices</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8 md:p-12">
              <h2 className="font-serif text-2xl font-bold mb-4">Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You have certain rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                <li>Access and review your personal information</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your personal information</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent for data processing</li>
                <li>Request a copy of your data in a portable format</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8 md:p-12">
              <h2 className="font-serif text-2xl font-bold mb-4">Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic,
                and personalize content. You can control cookie preferences through your browser settings, but disabling
                cookies may affect certain features of our website.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8 md:p-12">
              <h2 className="font-serif text-2xl font-bold mb-4">Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions or concerns about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>Email: privacy@orephia.com</p>
                <p>Phone: +1 (555) 123-4567</p>
                <p>Address: 123 Fashion Street, New York, NY 10001</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
