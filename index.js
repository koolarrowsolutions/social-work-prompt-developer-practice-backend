const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

function generateFollowUps(basePrompt) {
  return [
    `What are some follow-up questions for: ${basePrompt}?`,
    `How could I go deeper on: ${basePrompt}?`,
    `What else should I consider regarding: ${basePrompt}?`,
  ];
}

app.post("/api/gpt", async (req, res) => {
  const { useCase, followUp } = req.body;
  const userPrompt = useCase || followUp;

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant for social workers. Provide practical, professional, strengths-based guidance for fieldwork.",
        },
        { role: "user", content: userPrompt },
      ],
    });

    const answer = completion.data.choices[0].message.content;
    const options = generateFollowUps(userPrompt);
    res.json({ answer, options });
  } catch (error) {
    console.error("GPT Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Something went wrong with the GPT API" });
  }
});

app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
