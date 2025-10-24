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
