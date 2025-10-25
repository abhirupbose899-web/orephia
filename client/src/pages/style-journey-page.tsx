import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Sparkles, Palette, Briefcase, Calendar, Heart, DollarSign, ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ProductCard } from "@/components/product-card";
import { StyleQuestionnaireAnswers, AIStyleInsights, Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

const STEPS = [
  { number: 1, title: "Style Palette", icon: Palette, description: "Your color & pattern preferences" },
  { number: 2, title: "Work Persona", icon: Briefcase, description: "Professional styling needs" },
  { number: 3, title: "Occasions", icon: Calendar, description: "Where you'll wear your outfits" },
  { number: 4, title: "Body Comfort", icon: Heart, description: "What makes you feel confident" },
  { number: 5, title: "Investment Level", icon: DollarSign, description: "Your budget & priorities" },
];

const COLORS = ["Black", "White", "Navy", "Beige", "Burgundy", "Rose Gold", "Emerald", "Blush Pink", "Cream", "Charcoal", "Wine Red", "Sage Green"];
const PATTERNS = ["Solid", "Stripes", "Floral", "Polka Dots", "Animal Print", "Geometric"];
const WORK_ENVIRONMENTS = ["Corporate", "Creative", "Casual", "Remote", "Mixed"];
const DRESS_CODES = ["Business Formal", "Business Casual", "Smart Casual", "Casual", "No Dress Code"];
const PREFERRED_FITS = ["Tailored/Fitted", "Relaxed/Loose", "Balanced/Classic", "Oversized/Flowy"];
const LENGTHS = ["Mini/Short", "Knee-length", "Midi", "Maxi/Floor-length"];
const BUDGET_RANGES = ["under 5000 INR", "mid-range 5000-15000 INR", "luxury 15000+ INR"];
const PRIORITY_ITEMS = ["Dresses", "Workwear", "Casual Basics", "Evening Wear", "Shoes", "Bags", "Accessories"];

export default function StyleJourneyPage() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [answers, setAnswers] = useState<Partial<StyleQuestionnaireAnswers>>({
    stylePalette: { preferredColors: [], avoidColors: [], patterns: [] },
    workPersona: { workEnvironment: "", dressCode: "" },
    occasions: {
      dailyWear: false,
      workEvents: false,
      casualOutings: false,
      formalEvents: false,
      parties: false,
      travel: false,
    },
    bodyComfort: { preferredFit: "", comfortableLengths: [] },
    investmentLevel: { budgetRange: "", priorityItems: [] },
  });

  const [results, setResults] = useState<{ aiInsights: AIStyleInsights } | null>(null);

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const styleJourneyMutation = useMutation({
    mutationFn: async (questionnaireAnswers: StyleQuestionnaireAnswers) => {
      const response = await apiRequest<{ success: boolean; aiInsights: AIStyleInsights }>(
        "POST",
        "/api/ai/style-journey",
        { questionnaireAnswers }
      );
      return response;
    },
    onSuccess: (data) => {
      setResults({ aiInsights: data.aiInsights });
      setCurrentStep(6);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveProfileMutation = useMutation({
    mutationFn: async () => {
      if (!results) return;
      await apiRequest("POST", "/api/style-profiles", {
        questionnaireAnswers: answers,
        aiInsights: results.aiInsights,
        preferredProductIds: results.aiInsights.catalogPicks?.map(p => p.productId) || [],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/style-profiles/me"] });
      toast({
        title: "Success!",
        description: "Your style preferences have been saved to your profile.",
      });
    },
  });

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as Step);
    } else if (currentStep === 5) {
      // Submit to AI
      styleJourneyMutation.mutate(answers as StyleQuestionnaireAnswers);
    }
  };

  const handleBack = () => {
    if (currentStep > 1 && currentStep <= 5) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return answers.stylePalette!.preferredColors.length > 0;
      case 2:
        return answers.workPersona!.workEnvironment && answers.workPersona!.dressCode;
      case 3:
        return Object.values(answers.occasions!).some(v => v === true);
      case 4:
        return answers.bodyComfort!.preferredFit && answers.bodyComfort!.comfortableLengths.length > 0;
      case 5:
        return answers.investmentLevel!.budgetRange && answers.investmentLevel!.priorityItems.length > 0;
      default:
        return false;
    }
  };

  const recommendedProducts = results?.aiInsights?.catalogPicks
    ? products.filter(p => results.aiInsights.catalogPicks?.some(pick => pick.productId === p.id))
    : [];

  const progressPercent = ((currentStep - 1) / 5) * 100;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to start your style journey</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/auth")} className="w-full" data-testid="button-login">
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-primary/5 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20" data-testid="badge-journey">
            <Sparkles className="mr-2 h-3 w-3" />
            AI-Powered Style Journey
          </Badge>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Discover Your Perfect Style</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Answer a few questions to receive personalized fashion recommendations curated just for you
          </p>
        </div>

        {/* Progress Bar */}
        {currentStep <= 5 && (
          <div className="mb-8">
            <div className="flex justify-between mb-4">
              {STEPS.map((step) => {
                const Icon = step.icon;
                const isActive = currentStep === step.number;
                const isComplete = currentStep > step.number;

                return (
                  <div key={step.number} className="flex-1 flex flex-col items-center">
                    <div
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${
                        isComplete
                          ? "bg-primary text-white"
                          : isActive
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                      data-testid={`step-indicator-${step.number}`}
                    >
                      {isComplete ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <span className="text-xs font-medium text-center hidden md:block">{step.title}</span>
                  </div>
                );
              })}
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}

        {/* Step Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            {currentStep === 1 && (
              <div>
                <h2 className="font-serif text-2xl font-bold mb-2">Your Color & Pattern Palette</h2>
                <p className="text-muted-foreground mb-6">Select colors you love and patterns that resonate with you</p>

                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold mb-3 block">Preferred Colors (select at least 1)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {COLORS.map((color) => (
                        <div key={color} className="flex items-center space-x-2">
                          <Checkbox
                            id={`color-${color}`}
                            checked={answers.stylePalette!.preferredColors.includes(color)}
                            onCheckedChange={(checked) => {
                              setAnswers({
                                ...answers,
                                stylePalette: {
                                  ...answers.stylePalette!,
                                  preferredColors: checked
                                    ? [...answers.stylePalette!.preferredColors, color]
                                    : answers.stylePalette!.preferredColors.filter((c) => c !== color),
                                },
                              });
                            }}
                            data-testid={`checkbox-color-${color.toLowerCase().replace(/\s/g, '-')}`}
                          />
                          <Label htmlFor={`color-${color}`} className="cursor-pointer">
                            {color}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-semibold mb-3 block">Colors to Avoid (optional)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {COLORS.map((color) => (
                        <div key={color} className="flex items-center space-x-2">
                          <Checkbox
                            id={`avoid-${color}`}
                            checked={answers.stylePalette!.avoidColors.includes(color)}
                            onCheckedChange={(checked) => {
                              setAnswers({
                                ...answers,
                                stylePalette: {
                                  ...answers.stylePalette!,
                                  avoidColors: checked
                                    ? [...answers.stylePalette!.avoidColors, color]
                                    : answers.stylePalette!.avoidColors.filter((c) => c !== color),
                                },
                              });
                            }}
                            data-testid={`checkbox-avoid-${color.toLowerCase().replace(/\s/g, '-')}`}
                          />
                          <Label htmlFor={`avoid-${color}`} className="cursor-pointer">
                            {color}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-semibold mb-3 block">Preferred Patterns (optional)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {PATTERNS.map((pattern) => (
                        <div key={pattern} className="flex items-center space-x-2">
                          <Checkbox
                            id={`pattern-${pattern}`}
                            checked={answers.stylePalette!.patterns.includes(pattern)}
                            onCheckedChange={(checked) => {
                              setAnswers({
                                ...answers,
                                stylePalette: {
                                  ...answers.stylePalette!,
                                  patterns: checked
                                    ? [...answers.stylePalette!.patterns, pattern]
                                    : answers.stylePalette!.patterns.filter((p) => p !== pattern),
                                },
                              });
                            }}
                            data-testid={`checkbox-pattern-${pattern.toLowerCase().replace(/\s/g, '-')}`}
                          />
                          <Label htmlFor={`pattern-${pattern}`} className="cursor-pointer">
                            {pattern}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h2 className="font-serif text-2xl font-bold mb-2">Your Work Persona</h2>
                <p className="text-muted-foreground mb-6">Tell us about your professional environment</p>

                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold mb-3 block">Work Environment</Label>
                    <RadioGroup
                      value={answers.workPersona!.workEnvironment}
                      onValueChange={(value) =>
                        setAnswers({
                          ...answers,
                          workPersona: { ...answers.workPersona!, workEnvironment: value },
                        })
                      }
                    >
                      {WORK_ENVIRONMENTS.map((env) => (
                        <div key={env} className="flex items-center space-x-2">
                          <RadioGroupItem value={env} id={`env-${env}`} data-testid={`radio-work-${env.toLowerCase().replace(/\s/g, '-')}`} />
                          <Label htmlFor={`env-${env}`} className="cursor-pointer">
                            {env}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-base font-semibold mb-3 block">Dress Code</Label>
                    <RadioGroup
                      value={answers.workPersona!.dressCode}
                      onValueChange={(value) =>
                        setAnswers({
                          ...answers,
                          workPersona: { ...answers.workPersona!, dressCode: value },
                        })
                      }
                    >
                      {DRESS_CODES.map((code) => (
                        <div key={code} className="flex items-center space-x-2">
                          <RadioGroupItem value={code} id={`code-${code}`} data-testid={`radio-dresscode-${code.toLowerCase().replace(/\s/g, '-')}`} />
                          <Label htmlFor={`code-${code}`} className="cursor-pointer">
                            {code}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h2 className="font-serif text-2xl font-bold mb-2">Your Occasions</h2>
                <p className="text-muted-foreground mb-6">Where will you wear your outfits? (select all that apply)</p>

                <div className="space-y-4">
                  {[
                    { key: "dailyWear", label: "Daily Wear / Everyday Outfits" },
                    { key: "workEvents", label: "Work Meetings & Professional Events" },
                    { key: "casualOutings", label: "Casual Outings & Weekend Activities" },
                    { key: "formalEvents", label: "Formal Events & Galas" },
                    { key: "parties", label: "Parties & Social Gatherings" },
                    { key: "travel", label: "Travel & Vacation" },
                  ].map((occasion) => (
                    <div key={occasion.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={occasion.key}
                        checked={answers.occasions![occasion.key as keyof typeof answers.occasions]}
                        onCheckedChange={(checked) => {
                          setAnswers({
                            ...answers,
                            occasions: {
                              ...answers.occasions!,
                              [occasion.key]: checked as boolean,
                            },
                          });
                        }}
                        data-testid={`checkbox-occasion-${occasion.key}`}
                      />
                      <Label htmlFor={occasion.key} className="cursor-pointer">
                        {occasion.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <h2 className="font-serif text-2xl font-bold mb-2">Body Comfort & Fit</h2>
                <p className="text-muted-foreground mb-6">What makes you feel most confident and comfortable?</p>

                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold mb-3 block">Preferred Fit</Label>
                    <RadioGroup
                      value={answers.bodyComfort!.preferredFit}
                      onValueChange={(value) =>
                        setAnswers({
                          ...answers,
                          bodyComfort: { ...answers.bodyComfort!, preferredFit: value },
                        })
                      }
                    >
                      {PREFERRED_FITS.map((fit) => (
                        <div key={fit} className="flex items-center space-x-2">
                          <RadioGroupItem value={fit} id={`fit-${fit}`} data-testid={`radio-fit-${fit.toLowerCase().replace(/\s|\//g, '-')}`} />
                          <Label htmlFor={`fit-${fit}`} className="cursor-pointer">
                            {fit}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-base font-semibold mb-3 block">Comfortable Lengths (select at least 1)</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {LENGTHS.map((length) => (
                        <div key={length} className="flex items-center space-x-2">
                          <Checkbox
                            id={`length-${length}`}
                            checked={answers.bodyComfort!.comfortableLengths.includes(length)}
                            onCheckedChange={(checked) => {
                              setAnswers({
                                ...answers,
                                bodyComfort: {
                                  ...answers.bodyComfort!,
                                  comfortableLengths: checked
                                    ? [...answers.bodyComfort!.comfortableLengths, length]
                                    : answers.bodyComfort!.comfortableLengths.filter((l) => l !== length),
                                },
                              });
                            }}
                            data-testid={`checkbox-length-${length.toLowerCase().replace(/\s|\//g, '-')}`}
                          />
                          <Label htmlFor={`length-${length}`} className="cursor-pointer">
                            {length}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div>
                <h2 className="font-serif text-2xl font-bold mb-2">Investment Level</h2>
                <p className="text-muted-foreground mb-6">What's your budget and what pieces matter most to you?</p>

                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold mb-3 block">Budget Range</Label>
                    <RadioGroup
                      value={answers.investmentLevel!.budgetRange}
                      onValueChange={(value) =>
                        setAnswers({
                          ...answers,
                          investmentLevel: { ...answers.investmentLevel!, budgetRange: value },
                        })
                      }
                    >
                      {BUDGET_RANGES.map((budget) => (
                        <div key={budget} className="flex items-center space-x-2">
                          <RadioGroupItem value={budget} id={`budget-${budget}`} data-testid={`radio-budget-${budget.split(' ')[0]}`} />
                          <Label htmlFor={`budget-${budget}`} className="cursor-pointer">
                            {budget}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-base font-semibold mb-3 block">Priority Items (select at least 1)</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {PRIORITY_ITEMS.map((item) => (
                        <div key={item} className="flex items-center space-x-2">
                          <Checkbox
                            id={`priority-${item}`}
                            checked={answers.investmentLevel!.priorityItems.includes(item)}
                            onCheckedChange={(checked) => {
                              setAnswers({
                                ...answers,
                                investmentLevel: {
                                  ...answers.investmentLevel!,
                                  priorityItems: checked
                                    ? [...answers.investmentLevel!.priorityItems, item]
                                    : answers.investmentLevel!.priorityItems.filter((i) => i !== item),
                                },
                              });
                            }}
                            data-testid={`checkbox-priority-${item.toLowerCase().replace(/\s/g, '-')}`}
                          />
                          <Label htmlFor={`priority-${item}`} className="cursor-pointer">
                            {item}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 6 && results && (
              <div>
                <h2 className="font-serif text-3xl font-bold mb-4 text-center">Your Personalized Style Guide</h2>
                <p className="text-center text-muted-foreground mb-8">
                  Based on your preferences, here's what we recommend for you
                </p>

                <div className="space-y-8">
                  {/* Color Palette */}
                  <div>
                    <h3 className="font-serif text-xl font-semibold mb-3 flex items-center gap-2">
                      <Palette className="h-5 w-5 text-primary" />
                      Your Perfect Color Palette
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {results.aiInsights.colorPalette.map((color, idx) => (
                        <Badge key={idx} variant="outline" className="text-sm" data-testid={`badge-color-${idx}`}>
                          {color}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Silhouettes */}
                  <div>
                    <h3 className="font-serif text-xl font-semibold mb-3 flex items-center gap-2">
                      <Heart className="h-5 w-5 text-primary" />
                      Flattering Silhouettes
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {results.aiInsights.silhouettes.map((silhouette, idx) => (
                        <Badge key={idx} variant="outline" className="text-sm" data-testid={`badge-silhouette-${idx}`}>
                          {silhouette}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Style Tips */}
                  <div>
                    <h3 className="font-serif text-xl font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Style Tips Just For You
                    </h3>
                    <ul className="space-y-2">
                      {results.aiInsights.styleTips.map((tip, idx) => (
                        <li key={idx} className="flex gap-2 text-sm" data-testid={`tip-${idx}`}>
                          <span className="text-primary">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Product Recommendations */}
                  <div>
                    <h3 className="font-serif text-xl font-semibold mb-4">Curated Picks From Our Collection</h3>
                    {recommendedProducts.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recommendedProducts.map((product) => {
                          const pick = results.aiInsights.catalogPicks?.find(p => p.productId === product.id);
                          return (
                            <div key={product.id}>
                              <ProductCard product={product} />
                              {pick && (
                                <p className="text-xs text-muted-foreground mt-2 italic" data-testid={`product-reason-${product.id}`}>
                                  Why: {pick.reason}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        No products match your criteria yet. Check back soon!
                      </p>
                    )}
                  </div>

                  {/* Save Profile Button */}
                  <div className="flex gap-4 justify-center pt-8">
                    <Button
                      onClick={() => saveProfileMutation.mutate()}
                      disabled={saveProfileMutation.isPending}
                      size="lg"
                      data-testid="button-save-profile"
                    >
                      {saveProfileMutation.isPending ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...</>
                      ) : (
                        <><Check className="mr-2 h-5 w-5" /> Save Preferences</>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => navigate("/shop")}
                      data-testid="button-shop-now"
                    >
                      Shop Now
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        {currentStep <= 5 && (
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              data-testid="button-back"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed() || styleJourneyMutation.isPending}
              data-testid="button-next"
            >
              {styleJourneyMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : currentStep === 5 ? (
                <>
                  Get My Recommendations
                  <Sparkles className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
