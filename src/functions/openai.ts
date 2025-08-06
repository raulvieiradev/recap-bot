import OpenAI from "openai";
import { env } from "#settings";

export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemMessage?: string;
}

export async function generateSummary(
  text: string,
  options: ChatCompletionOptions = {}
): Promise<string> {
  const {
    model = "gpt-4.1-nano",
    temperature = 0.9,
    maxTokens = 500,
    systemMessage = "You are an assistant specialized in creating concise and informative summaries. Always respond in the same language as the input text.",
  } = options;

  try {
    const response = await openai.chat.completions.create({
      model,
      temperature,
      max_tokens: maxTokens,
      messages: [
        {
          role: "system",
          content: systemMessage,
        },
        {
          role: "user",
          content: `Please create a summary of the following text. Respond in the same language as the input text:\n\n${text}`,
        },
      ],
    });

    return (
      response.choices[0]?.message?.content?.trim() ||
      "Could not generate summary."
    );
  } catch (error) {
    console.error("Error generating summary with OpenAI:", error);
    throw new Error(
      "Failed to generate summary. Please check your API key and try again."
    );
  }
}

export async function generateRecap(
  messages: string[],
  options: ChatCompletionOptions = {}
): Promise<string> {
  const {
    model = "gpt-4.1-nano",
    temperature = 0.9,
    maxTokens = 800,
    systemMessage = "You are an assistant that creates organized recaps of Discord conversations. Highlight key points, decisions made, and topics discussed in a clear and structured way. Always respond in the same language as the input conversation.",
  } = options;

  const conversationText = messages.join("\n");

  try {
    const response = await openai.chat.completions.create({
      model,
      temperature,
      max_tokens: maxTokens,
      messages: [
        {
          role: "system",
          content: systemMessage,
        },
        {
          role: "user",
          content: `Create a recap of the following Discord conversation. Respond in the same language as the conversation:\n\n${conversationText}`,
        },
      ],
    });

    return (
      response.choices[0]?.message?.content?.trim() ||
      "Could not generate recap."
    );
  } catch (error) {
    console.error("Error generating recap with OpenAI:", error);
    throw new Error(
      "Failed to generate recap. Please check your API key and try again."
    );
  }
}

export async function analyzeSentiment(
  text: string,
  options: ChatCompletionOptions = {}
): Promise<{
  sentiment: "positivo" | "negativo" | "neutro";
  confidence: string;
  explanation: string;
}> {
  const {
    model = "gpt-4.1-nano",
    temperature = 0.9,
    maxTokens = 200,
    systemMessage = "You are a sentiment analyzer. Analyze the text and return the sentiment (positive, negative, or neutral), confidence level, and a brief explanation. Always respond in the same language as the input text.",
  } = options;

  try {
    const response = await openai.chat.completions.create({
      model,
      temperature,
      max_tokens: maxTokens,
      messages: [
        {
          role: "system",
          content: systemMessage,
        },
        {
          role: "user",
          content: `Analyze the sentiment of the following text and respond in JSON format. Use "positivo", "negativo", or "neutro" for sentiment, and respond in the same language as the input text:
                    {"sentiment": "positivo|negativo|neutro", "confidence": "baixa|média|alta", "explanation": "brief explanation"}
                    
                    Text: ${text}`,
        },
      ],
    });

    const result = response.choices[0]?.message?.content?.trim();
    if (!result) {
      throw new Error("Empty response from API");
    }

    try {
      return JSON.parse(result);
    } catch {
      return {
        sentiment: "neutro" as const,
        confidence: "baixa",
        explanation: result,
      };
    }
  } catch (error) {
    console.error("Error analyzing sentiment with OpenAI:", error);
    throw new Error(
      "Failed to analyze sentiment. Please check your API key and try again."
    );
  }
}

export async function extractKeywords(
  text: string,
  maxKeywords: number = 10,
  options: ChatCompletionOptions = {}
): Promise<string[]> {
  const {
    model = "gpt-4.1-nano",
    temperature = 0.9,
    maxTokens = 150,
    systemMessage = "You are a keyword extractor. Extract the most important words and phrases from the provided text. Return keywords in the same language as the input text.",
  } = options;

  try {
    const response = await openai.chat.completions.create({
      model,
      temperature,
      max_tokens: maxTokens,
      messages: [
        {
          role: "system",
          content: systemMessage,
        },
        {
          role: "user",
          content: `Extract up to ${maxKeywords} most important keywords from the following text. Return only the keywords separated by commas, in the same language as the input text:
                    
                    ${text}`,
        },
      ],
    });

    const result = response.choices[0]?.message?.content?.trim();
    if (!result) {
      return [];
    }

    return result
      .split(",")
      .map((keyword) => keyword.trim())
      .filter((keyword) => keyword.length > 0)
      .slice(0, maxKeywords);
  } catch (error) {
    console.error("Error extracting keywords with OpenAI:", error);
    throw new Error(
      "Failed to extract keywords. Please check your API key and try again."
    );
  }
}

export async function askQuestion(
  context: string,
  question: string,
  options: ChatCompletionOptions = {}
): Promise<string> {
  const {
    model = "gpt-4.1-nano",
    temperature = 0.9,
    maxTokens = 300,
    systemMessage = "You are an assistant that answers questions based exclusively on the provided context. If the information is not in the context, say you don't have that information. Always respond in the same language as the question.",
  } = options;

  try {
    const response = await openai.chat.completions.create({
      model,
      temperature,
      max_tokens: maxTokens,
      messages: [
        {
          role: "system",
          content: systemMessage,
        },
        {
          role: "user",
          content: `Context: ${context}
                    
                    Question: ${question}
                    
                    Please answer in the same language as the question.`,
        },
      ],
    });

    return (
      response.choices[0]?.message?.content?.trim() ||
      "Could not answer the question."
    );
  } catch (error) {
    console.error("Error answering question with OpenAI:", error);
    throw new Error(
      "Failed to answer question. Please check your API key and try again."
    );
  }
}

export async function translateText(
  text: string,
  targetLanguage: string,
  options: ChatCompletionOptions = {}
): Promise<string> {
  const {
    model = "gpt-3.5-turbo",
    temperature = 0.3,
    maxTokens = 1000,
    systemMessage = `You are a professional translator. Translate the given text to ${targetLanguage} while preserving the original meaning, tone, and context.`,
  } = options;

  try {
    const response = await openai.chat.completions.create({
      model,
      temperature,
      max_tokens: maxTokens,
      messages: [
        {
          role: "system",
          content: systemMessage,
        },
        {
          role: "user",
          content: `Please translate the following text to ${targetLanguage}:\n\n${text}`,
        },
      ],
    });

    return (
      response.choices[0]?.message?.content?.trim() || "Translation failed."
    );
  } catch (error) {
    console.error("Error translating text with OpenAI:", error);
    throw new Error(
      "Failed to translate text. Please check your API key and try again."
    );
  }
}

export async function explainConcept(
  concept: string,
  context?: string,
  options: ChatCompletionOptions = {}
): Promise<string> {
  const {
    model = "gpt-3.5-turbo",
    temperature = 0.7,
    maxTokens = 600,
    systemMessage = "You are a knowledgeable assistant that explains concepts clearly and concisely. Provide easy-to-understand explanations with examples when helpful. Always respond in the same language as the input concept.",
  } = options;

  const contextText = context
    ? `\n\nContext from conversation: ${context}`
    : "";

  try {
    const response = await openai.chat.completions.create({
      model,
      temperature,
      max_tokens: maxTokens,
      messages: [
        {
          role: "system",
          content: systemMessage,
        },
        {
          role: "user",
          content: `Please explain the following concept: "${concept}"${contextText}\n\nRespond in the same language as the concept.`,
        },
      ],
    });

    return (
      response.choices[0]?.message?.content?.trim() ||
      "Could not generate explanation."
    );
  } catch (error) {
    console.error("Error explaining concept with OpenAI:", error);
    throw new Error(
      "Failed to explain concept. Please check your API key and try again."
    );
  }
}

export async function generateIdeas(
  topic: string,
  context?: string,
  ideaCount: number = 5,
  options: ChatCompletionOptions = {}
): Promise<string[]> {
  const {
    model = "gpt-3.5-turbo",
    temperature = 0.8,
    maxTokens = 800,
    systemMessage = "You are a creative brainstorming assistant. Generate innovative and practical ideas related to the given topic. Always respond in the same language as the input topic.",
  } = options;

  const contextText = context
    ? `\n\nContext from recent discussions: ${context}`
    : "";

  try {
    const response = await openai.chat.completions.create({
      model,
      temperature,
      max_tokens: maxTokens,
      messages: [
        {
          role: "system",
          content: systemMessage,
        },
        {
          role: "user",
          content: `Generate ${ideaCount} creative ideas related to: "${topic}"${contextText}\n\nFormat as a numbered list and respond in the same language as the topic.`,
        },
      ],
    });

    const result = response.choices[0]?.message?.content?.trim();
    if (!result) return [];

    return result
      .split("\n")
      .filter((line) => line.trim().match(/^\d+\./))
      .map((line) => line.replace(/^\d+\.\s*/, "").trim())
      .slice(0, ideaCount);
  } catch (error) {
    console.error("Error generating ideas with OpenAI:", error);
    throw new Error(
      "Failed to generate ideas. Please check your API key and try again."
    );
  }
}

export async function analyzeMood(
  messages: string[],
  options: ChatCompletionOptions = {}
): Promise<{
  mood: string;
  emoji: string;
  description: string;
  energy: "low" | "medium" | "high";
}> {
  const {
    model = "gpt-3.5-turbo",
    temperature = 0.5,
    maxTokens = 300,
    systemMessage = "You are an expert at analyzing the mood and emotional tone of conversations. Analyze the overall mood and provide a summary. Always respond in the same language as the input conversation.",
  } = options;

  const conversationText = messages.join("\n");

  try {
    const response = await openai.chat.completions.create({
      model,
      temperature,
      max_tokens: maxTokens,
      messages: [
        {
          role: "system",
          content: systemMessage,
        },
        {
          role: "user",
          content: `Analyze the mood of this conversation and respond in JSON format in the same language as the conversation:
          {"mood": "descriptive mood", "emoji": "single emoji", "description": "brief description", "energy": "low/medium/high"}
          
          Conversation:
          ${conversationText}`,
        },
      ],
    });

    const result = response.choices[0]?.message?.content?.trim();
    if (!result) {
      throw new Error("Empty response from API");
    }

    try {
      return JSON.parse(result);
    } catch {
      return {
        mood: "neutral",
        emoji: "😐",
        description: result,
        energy: "medium" as const,
      };
    }
  } catch (error) {
    console.error("Error analyzing mood with OpenAI:", error);
    throw new Error(
      "Failed to analyze mood. Please check your API key and try again."
    );
  }
}
