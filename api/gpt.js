import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // ✅ Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ✅ Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { useCase, followUp } = req.body;
  const userPrompt = useCase || followUp;

  if (!userPrompt) {
    return res.status(400).json({ error: "Missing prompt data" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant for social workers. Provide practical, strengths-based, and field-ready responses. Avoid overly generic advice.",
        },
        { role: "user", content: userPrompt },
      ],
    });

    const answer = completion.choices[0].message.content;

    const options = [
      `What are some follow-up questions for: ${userPrompt}?`,
      `How could I go deeper on: ${userPrompt}?`,
      `What else should I consider regarding: ${userPrompt}?`,
    ];

    res.status(200).json({ answer, options });
  } catch (error) {
    console.error("GPT API error:", error.response?.data || error.message);
    res.status(500).json({ error: "Something went wrong with the GPT API" });
  }
}
