import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY not set in .env");
    process.exit(1);
  }

  console.log("Testing Gemini API...");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent("Say 'Gemini API is working!' in one sentence.");
  console.log("Response:", result.response.text());
  console.log("\nGemini API key is valid and working.");
}

testGemini().catch((err) => {
  console.error("Gemini test failed:", err.message);
  process.exit(1);
});
