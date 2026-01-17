
export const onRequestPost: PagesFunction<{ GEMINI_API_KEY: string }> = async (context) => {
  try {
    const { messageText } = await context.request.json<{ messageText: string }>();

    if (!messageText) {
      return new Response(JSON.stringify({ error: "messageText is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = context.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY is not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

    const prompt = `Analyze this customer message from LINE OA and provide a sentiment, short summary, and a professional suggested reply in Traditional Chinese: "${messageText}"`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              sentiment: { type: "STRING", description: "positive, neutral, or negative" },
              summary: { type: "STRING" },
              suggestedReply: { type: "STRING" }
            },
            required: ["sentiment", "summary", "suggestedReply"]
          }
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return new Response(JSON.stringify({ error: "Gemini API failed", details: errorData }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    return new Response(resultText, {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error", message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
