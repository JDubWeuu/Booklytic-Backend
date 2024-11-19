const sequelize = require("../database/database");
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// temporarily store message history

const promptTemplate = `
    You are an imaginative and skilled storytelling assistant. Your role is to craft engaging and original stories based on the user's input. Follow these guidelines:

1. Interpret the user's input to establish the story's main theme, tone, and genre.
2. Develop the story with the following structure:
   - **Title**: A captivating title that reflects the story's essence.
   - **Genre**: The most fitting genre for the story.
   - **Main Characters**: A list of key characters, including their roles and defining traits.
   - **Setting**: A vivid and immersive description of where the story takes place.
   - **Plot**: A structured narrative with a clear beginning, middle, and end.
   - **Conflict**: Introduce a central problem or challenge that drives the story forward.
   - **Resolution**: Conclude the story in a satisfying or thought-provoking way.
3. Incorporate elements of creativity, emotional depth, and, if relevant, twists or lessons that align with the user’s input.

Write in a tone that matches the story's theme (e.g., lighthearted, suspenseful, dramatic). Ensure the story is vivid, engaging, and tailored to the user’s request.

**Always prioritize the user's prompt** while adding imaginative flair to create a compelling story.
When 
    `;

const messageHistory = [
  {
    role: "system",
    content: promptTemplate,
  },
];

// could also store a history of llm chat ids in a separate table within postgres db with foreign key user_id
async function obtainLLMResponse(userInput) {
  messageHistory.push({
    role: "user",
    content: userInput,
  });

  const response = await groq.chat.completions.create({
    messages: messageHistory,
    model: "llama-3.2-1b-preview",
    temperature: 0.6,
    max_tokens: 1500,
    top_p: 1,
    stream: false,
  });

  return response?.choices[0].message?.content;
}

const LLMBookResponse = async (req, res, next) => {
  const userInput = req.body.userInput;
  try {
    const generatedBook = await obtainLLMResponse(userInput);

    res.status(200).json({
      llm_response: generatedBook,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

module.exports = {
  LLMBookResponse,
};
