
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const handleApiKeyError = async (error: any) => {
  if (error?.message?.includes("Requested entity was not found")) {
    // @ts-ignore
    if (window.aistudio && window.aistudio.openSelectKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
    }
  }
};

export const generateMarketingCopy = async (params: {
  storeName: string;
  businessType: string;
  event: string;
  tone: string;
  lang: 'ar' | 'en';
  primaryColor: string;
  secondaryColor: string;
}) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Write a professional marketing caption for social media.
    Store Name: ${params.storeName}
    Business Category: ${params.businessType}
    Event/Occasion: ${params.event}
    Tone: ${params.tone}
    Brand Identity: Dominant colors are ${params.primaryColor} and ${params.secondaryColor}.
    Language: ${params.lang === 'ar' ? 'Arabic' : 'English'}
    Include hashtags and a clear call to action. Return only the text.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    await handleApiKeyError(error);
    throw error;
  }
};

export const generateMarketingImage = async (params: {
  prompt: string;
  primaryColor: string;
  secondaryColor1: string;
  secondaryColor2: string;
}) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const enhancedPrompt = `${params.prompt}. 
    CRITICAL VISUAL REQUIREMENT: Use a consistent color palette based on the brand's visual identity:
    - Primary color: ${params.primaryColor}
    - Secondary accents: ${params.secondaryColor1} and ${params.secondaryColor2}.
    The overall lighting, background elements, and textures should reflect this color scheme for brand consistency.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: enhancedPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    let imageUrl = '';
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }
    return imageUrl;
  } catch (error) {
    await handleApiKeyError(error);
    throw error;
  }
};

export const generateMarketingVideo = async (params: {
  prompt: string;
  primaryColor: string;
  secondaryColor: string;
}) => {
  try {
    // @ts-ignore
    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const enhancedPrompt = `${params.prompt}. 
    The video cinematography should be color-graded to match the brand identity using ${params.primaryColor} and ${params.secondaryColor} as the core color theme.`;

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: enhancedPrompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '9:16'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (downloadLink) {
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    }
    return '';
  } catch (error) {
    await handleApiKeyError(error);
    throw error;
  }
};
