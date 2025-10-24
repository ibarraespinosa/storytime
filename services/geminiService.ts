
import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const scriptParserModel = 'gemini-2.5-flash';
const imageGeneratorModel = 'imagen-4.0-generate-001';
const chatModel = 'gemini-2.5-flash';

/**
 * Parses a script into a list of scene descriptions for storyboarding.
 * @param script The full script text.
 * @returns A promise that resolves to an array of objects, each with a 'description'.
 */
export async function parseScriptIntoScenes(script: string): Promise<{ description: string }[]> {
  const prompt = `
    Analyze the following script and break it down into distinct scenes or shots that can be visualized for a storyboard. 
    For each scene, create a concise, descriptive prompt (under 250 characters) that an AI image generator can use. 
    Focus on key actions, characters, setting, and mood.
    Return the result as a JSON array of objects, where each object has a "description" key.

    Example output format:
    [
        {"description": "A lone astronaut stands on a red, dusty Martian landscape, looking at two moons in the sky."},
        {"description": "Close up on the astronaut's helmet, reflecting a distant Earth."},
        {"description": "The astronaut plants a flag into the Martian soil, a small dust cloud rising."}
    ]

    Script to analyze:
    ---
    ${script}
    ---
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: scriptParserModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              description: {
                type: Type.STRING,
                description: 'A concise visual description of the scene for an image generator.',
              },
            },
            required: ['description'],
          },
        },
      },
    });

    const jsonString = response.text;
    const result = JSON.parse(jsonString);
    if (!Array.isArray(result)) {
        throw new Error("API did not return a valid array of scenes.");
    }
    return result;
  } catch (error) {
    console.error("Error parsing script with Gemini:", error);
    throw new Error("Failed to parse script. The AI model could not process the request.");
  }
}

/**
 * Generates an image for a single scene description.
 * @param description The prompt for the image generator.
 * @returns A promise that resolves to a base64 encoded JPEG image string.
 */
export async function generateImageForScene(description: string): Promise<string> {
  const enhancedPrompt = `cinematic storyboard panel, high detail, dramatic lighting, ${description}`;

  try {
    const response = await ai.models.generateImages({
      model: imageGeneratorModel,
      prompt: enhancedPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
      },
    });

    const base64ImageBytes: string | undefined = response.generatedImages[0]?.image.imageBytes;
    if (!base64ImageBytes) {
      throw new Error("API did not return image data.");
    }
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  } catch (error) {
    console.error("Error generating image with Imagen:", error);
    throw new Error("Failed to generate image. The AI model could not process the request.");
  }
}

/**
 * Sends a message to the chatbot and gets a response.
 * Manages the chat instance.
 * @param chatInstance The current chat instance, or null to create a new one.
 * @param message The user's message.
 * @returns A promise that resolves to an object containing the response text and the updated chat instance.
 */
export async function sendMessageToChat(chatInstance: Chat | null, message: string): Promise<{ response: string; updatedChat: Chat }> {
    let chat = chatInstance;
    if (!chat) {
        chat = ai.chats.create({
            model: chatModel,
            config: {
                systemInstruction: 'You are a helpful assistant for screenwriters and film directors. Provide concise, creative, and constructive feedback or ideas. You can answer questions about script formatting, character development, plot, and visual storytelling.',
            },
        });
    }

    try {
        const result = await chat.sendMessage({ message });
        return { response: result.text, updatedChat: chat };
    } catch (error) {
        console.error("Error sending message to chat:", error);
        throw new Error("Failed to get a response from the chatbot.");
    }
}
