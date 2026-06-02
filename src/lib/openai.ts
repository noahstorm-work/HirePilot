import OpenAI from "openai"

let _client: OpenAI | null = null

export function getOpenAI(): OpenAI {
  if (!_client) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set")
    }
    _client = new OpenAI({
      apiKey,
      baseURL: "https://api.groq.com/openai/v1",
    })
  }
  return _client
}

export const AI_MODEL = "llama-3.3-70b-versatile"
