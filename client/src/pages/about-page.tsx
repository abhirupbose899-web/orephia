import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Award, Users, Sparkles } from "lucide-react";

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
              <h2 className="font-serif text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Founded with a vision to redefine luxury fashion, Orephia brings together the finest collections
                of women's fashion and accessories from around the world. Our name embodies the essence of refined
                elegance and emotional connection to style.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We believe that fashion is more than just clothing—it's an expression of identity, confidence,
                and individuality. Every piece in our curated collection is chosen with meticulous attention to
                quality, craftsmanship, and timeless appeal.
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
                <h3 className="font-serif text-xl font-bold mb-3">AI-Powered Styling</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Experience personalized fashion recommendations powered by advanced AI technology,
                  tailored to your unique style preferences and lifestyle.
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
              <h2 className="font-serif text-3xl font-bold mb-6">Why Choose Orephia</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Curated Collections:</strong> Every item is handpicked by our expert stylists
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Global Delivery:</strong> Fast, secure shipping worldwide with premium packaging
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Exceptional Service:</strong> 24/7 customer support dedicated to your satisfaction
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Sustainable Luxury:</strong> Committed to ethical sourcing and responsible fashion
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
