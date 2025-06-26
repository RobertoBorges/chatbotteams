const axios = require('axios');

class AIFoundryService {
    constructor() {
        this.baseUrl = process.env.AI_FOUNDRY_BASE_URL || 'https://api.ai-foundry.com';
        this.apiKey = process.env.AI_FOUNDRY_API_KEY;
        this.model = process.env.AI_FOUNDRY_MODEL || 'gpt-3.5-turbo';
    }

    async getResponse(userMessage) {
        try {
            if (!this.apiKey) {
                return "AI Foundry is not configured. Please set AI_FOUNDRY_API_KEY environment variable.";
            }

            const response = await axios.post(`${this.baseUrl}/v1/chat/completions`, {
                model: this.model,
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful AI assistant integrated with Microsoft Teams. Be concise and friendly in your responses."
                    },
                    {
                        role: "user",
                        content: userMessage
                    }
                ],
                max_tokens: 500,
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('Error calling AI Foundry:', error.response?.data || error.message);
            
            // Fallback response when AI Foundry is not available
            return this.getFallbackResponse(userMessage);
        }
    }

    getFallbackResponse(userMessage) {
        const fallbackResponses = {
            "hello": "Hello! I'm your AI Foundry Teams bot. How can I help you today?",
            "help": "I can help you with various tasks using AI Foundry endpoints. I support text conversations and voice interactions!",
            "what can you do": "I can process text messages, handle voice input, provide speech output, and connect to AI Foundry services for intelligent responses.",
            "voice": "I can process voice commands and convert text to speech. Try saying 'voice: your message' or 'speak: text to speak'",
            "default": "I'm an AI assistant powered by AI Foundry. I can help with questions, have conversations, and process voice commands. What would you like to know?"
        };

        const lowerMessage = userMessage.toLowerCase();
        
        for (const [key, response] of Object.entries(fallbackResponses)) {
            if (lowerMessage.includes(key)) {
                return response;
            }
        }
        
        return fallbackResponses.default;
    }

    async getStreamingResponse(userMessage, onChunk) {
        try {
            if (!this.apiKey) {
                onChunk("AI Foundry is not configured. Please set AI_FOUNDRY_API_KEY environment variable.");
                return;
            }

            const response = await axios.post(`${this.baseUrl}/v1/chat/completions`, {
                model: this.model,
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful AI assistant integrated with Microsoft Teams. Be concise and friendly in your responses."
                    },
                    {
                        role: "user",
                        content: userMessage
                    }
                ],
                max_tokens: 500,
                temperature: 0.7,
                stream: true
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                responseType: 'stream'
            });

            response.data.on('data', (chunk) => {
                const lines = chunk.toString().split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') return;
                        
                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices[0]?.delta?.content;
                            if (content) {
                                onChunk(content);
                            }
                        } catch (e) {
                            // Ignore parsing errors for streaming
                        }
                    }
                }
            });

        } catch (error) {
            console.error('Error calling AI Foundry streaming:', error.response?.data || error.message);
            onChunk(this.getFallbackResponse(userMessage));
        }
    }
}

module.exports.AIFoundryService = AIFoundryService;