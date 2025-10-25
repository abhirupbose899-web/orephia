import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Award, Users, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-primary/5 to-white">
      <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20" data-testid="badge-about">
            About Orephia
          </Badge>
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">Where Elegance Meets Emotion</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Discover the story behind our passion for luxury fashion and commitment to exceptional style
          </p>
        </div>

        <div className="space-y-12">
          <Card>
            <CardContent className="p-8 md:p-12">
              <h2 className="font-serif text-3xl font-bold mb-6">Our Story - Luxury Women's Fashion Redefined</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Founded with a vision to redefine luxury women's fashion, Orephia brings together the finest collections
                of premium designer clothing, exclusive accessories, and luxury handbags from renowned fashion houses around the world. 
                Our name embodies the essence of refined elegance and emotional connection to style, representing a new era in 
                luxury fashion e-commerce where sophistication meets personalization.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We believe that fashion is more than just clothing—it's an expression of identity, confidence,
                and individuality. Every piece in our curated collection is chosen with meticulous attention to
                quality, craftsmanship, and timeless appeal. From designer dresses and elegant evening wear to statement 
                accessories and luxury shoes, each item tells a story of exceptional artistry and uncompromising quality.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                As a leading online destination for luxury women's fashion, Orephia combines the convenience of modern 
                e-commerce with the personalized service of a high-end boutique. Our innovative AI-powered styling 
                recommendations help you discover pieces that perfectly complement your unique style, making luxury fashion 
                more accessible and personalized than ever before.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-3">Our Mission</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  To empower women through exceptional fashion that celebrates their unique beauty and style,
                  delivered with unparalleled service and care.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-3">Quality Promise</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We guarantee 100% authentic designer pieces, carefully inspected for quality and craftsmanship.
                  Your satisfaction is our priority.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-3">AI-Powered Personal Styling Assistant</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Experience cutting-edge personalized fashion recommendations powered by advanced artificial intelligence.
                  Our AI styling assistant analyzes your preferences, lifestyle, and body type to curate custom outfit 
                  suggestions from our exclusive designer collections, making professional styling accessible to everyone.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-3">Community</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Join our global community of fashion enthusiasts who share a passion for elegance,
                  quality, and timeless style.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-8 md:p-12">
              <h2 className="font-serif text-3xl font-bold mb-6">Why Choose Orephia for Your Luxury Fashion Needs</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Expertly Curated Designer Collections:</strong> Every luxury item is handpicked by our team of 
                    professional fashion stylists who understand the latest trends and timeless classics. Browse our carefully selected 
                    range of premium designer dresses, luxury accessories, and exclusive handbags.
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Worldwide Express Delivery:</strong> Fast, secure international shipping to over 100 countries 
                    with premium packaging, insurance, and real-time tracking. Your luxury fashion arrives in pristine condition, beautifully packaged.
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">24/7 Concierge Customer Service:</strong> Our dedicated luxury fashion consultants are available 
                    around the clock to assist with styling advice, size recommendations, and personalized shopping assistance.
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">100% Authentic Designer Pieces:</strong> We guarantee authenticity on all our luxury fashion items. 
                    Every designer dress, handbag, and accessory comes with certification and is carefully verified by our quality control team.
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Sustainable Luxury Fashion:</strong> Committed to ethical sourcing, responsible manufacturing, 
                    and supporting sustainable fashion practices. We partner only with brands that share our values of environmental responsibility.
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Exclusive Loyalty Rewards Program:</strong> Earn points on every purchase and redeem them for 
                    discounts on future luxury fashion orders. Join our VIP community for early access to new designer collections.
                  </p>
                </div>
              </div>
              <div className="mt-8 flex gap-4 flex-wrap">
                <Link href="/shop">
                  <Button size="lg">Shop Designer Collections</Button>
                </Link>
                <Link href="/style-journey">
                  <Button size="lg" variant="outline">Try AI Styling Assistant</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
