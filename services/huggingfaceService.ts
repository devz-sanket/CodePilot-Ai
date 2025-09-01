import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HF_TOKEN || "");

export async function generateImage(prompt: string) {
  try {
    const image = await client.textToImage({
      model: "black-forest-labs/FLUX.1-dev",
      inputs: prompt,
    });
    return image; // This is a Blob (image data)
  } catch (err) {
    console.error("Hugging Face error:", err);
    throw err;
  }
}
