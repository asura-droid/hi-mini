// src/lib/ai-service.ts
export interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

class AIService {
  private endpoint: string;

  constructor() {
    // ✅ Free, public, no key needed (as of 2025)
    this.endpoint = "https://api-inference.huggingface.co/models/microsoft/Phi-3-mini-4k-instruct";
  }

  private createDataSummary(data: any[], filename: string): string {
    if (!data || data.length === 0) {
      return `No data found in file: ${filename}`;
    }
    const sample = data.slice(0, 5);
    const columns = Object.keys(sample[0] || {});
    return `Filename: ${filename}\nRows: ${data.length}\nColumns: ${columns.join(", ")}\n\nSample:\n${JSON.stringify(sample, null, 2)}`;
  }

  async streamChatResponse(
    userMessage: string,
    dataContext: any[],
    filename: string,
    onChunk: (text: string) => void
  ): Promise<AIResponse> {
    try {
      const dataSummary = this.createDataSummary(dataContext, filename);

      // Format prompt for Phi-3 (it follows <instruction> format well)
      const prompt = `<|system|>You are DataMind AI, a helpful data analyst assistant.<|end|>
<|user|>Dataset info:
${dataSummary}

User request: ${userMessage}<|end|>
<|assistant|>`;

      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 300,
            temperature: 0.7,
            return_full_text: false // Only return the assistant's reply
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      // Phi-3 returns { generated_text: "..." }
      const outputText = result?.generated_text?.trim() || JSON.stringify(result);

      onChunk(outputText);
      return { success: true, data: outputText };
    } catch (err: any) {
      console.error("Free AI error:", err);
      return { success: false, error: err.message || "Failed to get response" };
    }
  }
}

export const aiService = new AIService();