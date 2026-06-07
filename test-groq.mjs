import OpenAI from "openai";
import { readFileSync } from "fs";

const lines = readFileSync(".env.local", "utf-8").split("\n");
const env = {};
for (const line of lines) {
  const [k, ...v] = line.split("=");
  if (k) env[k.trim()] = v.join("=").trim();
}

const client = new OpenAI({ apiKey: env.OPENAI_API_KEY, baseURL: "https://api.groq.com/openai/v1" });
try {
  const r = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: 'Return JSON: {"hello": "world"}' }],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });
  console.log("SUCCESS:", r.choices[0].message.content);
} catch (e) {
  console.error("GROQ ERROR:", e.status, e.message);
  console.error("DETAILS:", JSON.stringify(e.error || e.cause || {}));
}
