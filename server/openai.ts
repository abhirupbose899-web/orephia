import OpenAI from "openai";

// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access without requiring your own OpenAI API key.
// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

export async function getStyleRecommendations(preferences: any) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a luxury fashion stylist for Orephia, a high-end women's fashion brand. Provide personalized styling recommendations based on user preferences. Be sophisticated, concise, and helpful."
        },
        {
          role: "user",
          content: `Based on these preferences: ${JSON.stringify(preferences)}, provide 3 styling recommendations in JSON format with 'recommendation', 'reasoning', and 'products' fields.`
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from AI");
    }

    return JSON.parse(response);
  } catch (error) {
    console.error("OpenAI error:", error);
    return {
      recommendations: [
        {
          recommendation: "Classic Elegance",
          reasoning: "Timeless pieces that never go out of style",
          products: ["Silk Evening Gown", "Cashmere Wrap Coat", "Diamond Stud Earrings"]
        }
      ]
    };
  }
}

export async function getStyleJourneyRecommendations(questionnaireAnswers: any, availableProducts: any[]) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are an elite personal stylist for Orephia, a luxury women's fashion boutique. Your expertise lies in understanding individual style preferences, body types, lifestyles, and creating curated wardrobe recommendations. 
          
You provide sophisticated, personalized styling advice that considers:
- Color theory and how it complements different skin tones
- Silhouettes that flatter different body types
- Appropriate styling for various professional and social occasions
- Investment pieces vs. trendy items
- Building a cohesive, versatile wardrobe

Your tone is warm, knowledgeable, and encouraging. You make luxury fashion accessible while maintaining sophistication.`
        },
        {
          role: "user",
          content: `Based on this comprehensive style questionnaire, provide personalized fashion recommendations:

QUESTIONNAIRE ANSWERS:
${JSON.stringify(questionnaireAnswers, null, 2)}

AVAILABLE PRODUCTS IN OUR CATALOG:
${JSON.stringify(availableProducts.slice(0, 20).map(p => ({
  id: p.id,
  title: p.title,
  category: p.category,
  colors: p.colors,
  price: p.price,
  designer: p.designer
})), null, 2)}

Please provide recommendations in this EXACT JSON format:
{
  "colorPalette": ["color1", "color2", "color3", "color4", "color5"],
  "silhouettes": ["silhouette1", "silhouette2", "silhouette3"],
  "styleTips": ["tip1", "tip2", "tip3", "tip4", "tip5"],
  "catalogPicks": [
    {
      "productId": "actual_product_id_from_catalog",
      "title": "product_title",
      "reason": "why this product works for them"
    }
  ],
  "confidenceNotes": "brief note about recommendation confidence"
}

Guidelines:
- Select 5 specific colors from the palette that work best with their preferences
- Recommend 3 silhouettes that suit their body comfort and occasion needs
- Provide 5 actionable style tips
- Choose 5-8 products from the available catalog that match their style, budget, and needs
- Ensure catalog picks use actual product IDs from the provided list
- Make recommendations cohesive and practical for their lifestyle`
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from AI");
    }

    return JSON.parse(response);
  } catch (error) {
    console.error("OpenAI Style Journey error:", error);
    return {
      colorPalette: ["Soft Blush", "Cream", "Sage Green", "Navy", "Burgundy"],
      silhouettes: ["A-line dresses", "Tailored blazers", "Wide-leg trousers"],
      styleTips: [
        "Invest in quality basics that form the foundation of your wardrobe",
        "Mix textures to add visual interest to monochromatic outfits",
        "Choose pieces that transition seamlessly from day to evening",
        "Accessorize thoughtfully with statement pieces for special occasions",
        "Prioritize fit over trends for a polished, confident look"
      ],
      catalogPicks: availableProducts.slice(0, 5).map(p => ({
        productId: p.id,
        title: p.title,
        reason: "This piece complements your style preferences beautifully"
      })),
      confidenceNotes: "Recommendations based on classic styling principles"
    };
  }
}
