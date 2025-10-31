import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Explicitly define the model we want to use
export const geminiFlash = googleAI.model('gemini-1.5-flash');

export const ai = genkit({
  plugins: [googleAI()],
  // Remove the default model from here to avoid conflicts
});
