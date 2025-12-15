import { GoogleGenAI, Modality } from "@google/genai";

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Chat with Gemini (Streaming)
 */
export const streamChatResponse = async (
  modelName: string,
  history: { role: string; parts: { text: string }[] }[],
  newMessage: string,
  onChunk: (text: string) => void
) => {
  try {
    const chat = ai.chats.create({
      model: modelName,
      history: history,
      config: {
        systemInstruction:
          "You are a helpful and knowledgeable academic assistant for students.",
      },
    });

    const result = await chat.sendMessageStream({ message: newMessage });

    for await (const chunk of result) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error("Chat Error:", error);
    throw error;
  }
};

/**
 * Analyze Image
 */
export const analyzeImage = async (
  base64Image: string,
  mimeType: string,
  prompt: string
) => {
  try {
    // Remove header if present (e.g., "data:image/png;base64,")
    const cleanBase64 = base64Image.split(",")[1];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64,
            },
          },
          {
            text: prompt || "Analyze this image in detail.",
          },
        ],
      },
    });
    return response.text;
  } catch (error) {
    console.error("Image Analysis Error:", error);
    throw error;
  }
};

/**
 * Generate Speech (TTS)
 */
export const generateSpeech = async (text: string): Promise<AudioBuffer> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio data received");
    }

    const outputAudioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)({
      sampleRate: 24000,
    });

    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      outputAudioContext,
      24000,
      1
    );

    return audioBuffer;
  } catch (error) {
    console.error("TTS Error:", error);
    throw error;
  }
};

// --- Audio Helper Functions (from Guidelines) ---

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
