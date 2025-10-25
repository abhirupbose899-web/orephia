import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-primary/5 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20" data-testid="badge-disclaimer">
            Legal Information
          </Badge>
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">Disclaimer</h1>
          <p className="text-lg text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardContent className="p-8 md:p-12">
              <h2 className="font-serif text-2xl font-bold mb-4">General Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                The information provided by Orephia ("we," "us," or "our") on our website and through our services
                is for general informational purposes only. All information is provided in good faith, however we make
                no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity,
                reliability, availability, or completeness of any information on the website or our services.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8 md:p-12">
              <h2 className="font-serif text-2xl font-bold mb-4">Product Information</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  We strive to provide accurate product descriptions, images, and specifications. However:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                  <li>Colors may vary slightly due to different monitor settings and lighting conditions</li>
                  <li>Product availability is subject to change without notice</li>
                  <li>We do not guarantee that product descriptions are error-free or complete</li>
                  <li>Actual product packaging and materials may contain different information than shown on our website</li>
                  <li>We reserve the right to correct any errors or omissions in product information</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8 md:p-12">
              <h2 className="font-serif text-2xl font-bold mb-4">AI-Powered Recommendations</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our AI-powered styling recommendations are provided as suggestions based on your preferences and
                browsing behavior. Please note:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                <li>Recommendations are algorithmic suggestions and not professional styling advice</li>
                <li>Results may vary based on individual preferences and body types</li>
                <li>We do not guarantee that recommended items will meet your expectations</li>
                <li>AI recommendations are continuously improved but may not always be accurate</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8 md:p-12">
              <h2 className="font-serif text-2xl font-bold mb-4">Pricing and Availability</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                While we make every effort to ensure pricing accuracy:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                <li>Prices are subject to change without notice</li>
                <li>We reserve the right to modify or discontinue products at any time</li>
                <li>In case of pricing errors, we reserve the right to cancel orders</li>
                <li>Currency conversions are provided for convenience and may not reflect real-time exchange rates</li>
                <li>Additional customs duties or taxes may apply for international orders</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8 md:p-12">
              <h2 className="font-serif text-2xl font-bold mb-4">External Links</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our website may contain links to external websites that are not provided or maintained by us.
                We do not guarantee the accuracy, relevance, timeliness, or completeness of any information on
                these external websites. We are not responsible for the content, privacy policies, or practices
                of any third-party sites.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8 md:p-12">
              <h2 className="font-serif text-2xl font-bold mb-4">Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Under no circumstance shall we have any liability to you for any loss or damage of any kind incurred
                as a result of the use of the website or reliance on any information provided on the website. Your
                use of the website and your reliance on any information on the website is solely at your own risk.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                This includes but is not limited to:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground mt-4 space-y-2">
                <li>Direct, indirect, or consequential damages</li>
                <li>Loss of data or profits</li>
                <li>Service interruptions or technical issues</li>
                <li>Product defects or unsuitability</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8 md:p-12">
              <h2 className="font-serif text-2xl font-bold mb-4">Professional Disclaimer</h2>
              <p className="text-muted-foreground leading-relaxed">
                The information provided through our styling services and recommendations does not constitute
                professional fashion or styling advice. We recommend consulting with a professional stylist for
                personalized advice tailored to your specific needs.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8 md:p-12">
              <h2 className="font-serif text-2xl font-bold mb-4">Changes to This Disclaimer</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to make changes to this disclaimer at any time. We will notify users of any
                material changes by posting the new disclaimer on this page with an updated revision date.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8 md:p-12">
              <h2 className="font-serif text-2xl font-bold mb-4">Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you have any questions about this disclaimer, please contact us:
              </p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Email: legal@orephia.com</p>
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
