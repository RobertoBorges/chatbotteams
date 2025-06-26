const { MessageFactory, ActivityTypes } = require('botbuilder');

class BotUtils {
    static createHelpCard() {
        const helpText = `# 🤖 AI Foundry Teams Bot Help

**Text Commands:**
- Simply type any message to chat with AI
- Ask questions, have conversations, or request information

**Voice Commands:**
- \`voice: your message\` - Process voice input
- \`speak: text to speak\` - Convert text to speech  
- \`speech: your command\` - Alternative voice trigger

**Examples:**
- "Hello, how can you help me?"
- "voice: What's the weather like?"
- "speak: Welcome to our meeting!"

**Features:**
- 🧠 AI-powered responses via AI Foundry
- 🎙️ Voice input processing
- 🔊 Text-to-speech output
- 💬 Works in personal, group, and team chats

Need help? Just ask me anything!`;

        return MessageFactory.text(helpText);
    }

    static createWelcomeCard() {
        const welcomeText = `# Welcome to AI Foundry Teams Bot! 🎉

I'm your AI-powered assistant with voice capabilities.

**What I can do:**
- 💬 Have intelligent conversations
- 🎙️ Process voice commands
- 🔊 Speak responses aloud
- 🤖 Connect to AI Foundry services

**Quick Start:**
- Type any message to begin chatting
- Use "voice:" prefix for voice commands
- Use "speak:" prefix for text-to-speech
- Type "help" for more information

Ready to chat? Try saying: *"Tell me about AI Foundry!"*`;

        return MessageFactory.text(welcomeText);
    }

    static createErrorCard(error) {
        const errorText = `⚠️ **Something went wrong**

I encountered an error while processing your request. 

**What you can try:**
- Rephrase your message and try again
- Check if your command format is correct
- For voice commands, use: \`voice: your message\`
- For speech output, use: \`speak: your text\`

**Still having issues?**
Type "help" for usage instructions or contact support.

*Error: ${error.message || 'Unknown error'}*`;

        return MessageFactory.text(errorText);
    }

    static isHelpRequest(text) {
        const helpKeywords = ['help', 'usage', 'commands', 'what can you do', 'how to use'];
        const lowerText = text.toLowerCase();
        return helpKeywords.some(keyword => lowerText.includes(keyword));
    }

    static isVoiceCommand(text) {
        const voiceKeywords = ['voice:', 'speak:', 'speech:', 'say:'];
        const lowerText = text.toLowerCase();
        return voiceKeywords.some(keyword => lowerText.includes(keyword));
    }

    static extractVoiceCommand(text) {
        const lowerText = text.toLowerCase();
        const voiceKeywords = ['voice:', 'speak:', 'speech:', 'say:'];
        
        for (const keyword of voiceKeywords) {
            const index = lowerText.indexOf(keyword);
            if (index !== -1) {
                return {
                    type: keyword.replace(':', ''),
                    text: text.substring(index + keyword.length).trim()
                };
            }
        }
        
        return null;
    }

    static sanitizeInput(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }
        
        // Remove excessive whitespace
        text = text.trim().replace(/\s+/g, ' ');
        
        // Basic security: remove potential script tags or dangerous content
        text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        text = text.replace(/<[^>]*>/g, '');
        
        // Limit length to prevent abuse
        if (text.length > 1000) {
            text = text.substring(0, 1000) + '...';
        }
        
        return text;
    }

    static formatAIResponse(response) {
        if (!response || typeof response !== 'string') {
            return 'I apologize, but I received an invalid response. Please try again.';
        }
        
        // Clean up common AI response artifacts
        response = response.trim();
        
        // Remove any JSON artifacts if present
        if (response.startsWith('{') && response.endsWith('}')) {
            try {
                const parsed = JSON.parse(response);
                response = parsed.content || parsed.message || parsed.text || response;
            } catch (e) {
                // If not valid JSON, keep original
            }
        }
        
        return response;
    }

    static logActivity(context, action, details = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            conversationId: context.activity.conversation?.id,
            userId: context.activity.from?.id,
            userName: context.activity.from?.name,
            action: action,
            ...details
        };
        
        console.log('Bot Activity:', JSON.stringify(logEntry, null, 2));
    }

    static async sendTypingIndicator(context) {
        try {
            const typingActivity = {
                type: ActivityTypes.Typing
            };
            await context.sendActivity(typingActivity);
        } catch (error) {
            console.error('Error sending typing indicator:', error);
        }
    }

    static createQuickReplies() {
        return [
            {
                title: "Help",
                value: "help"
            },
            {
                title: "Voice Demo",
                value: "voice: Hello, this is a voice command"
            },
            {
                title: "Speech Demo", 
                value: "speak: Hello, I am your AI assistant"
            },
            {
                title: "About AI Foundry",
                value: "Tell me about AI Foundry"
            }
        ];
    }

    static getRandomResponse(responses) {
        if (!Array.isArray(responses) || responses.length === 0) {
            return "I'm here to help! What would you like to know?";
        }
        return responses[Math.floor(Math.random() * responses.length)];
    }

    static validateEnvironmentConfig() {
        const warnings = [];
        
        if (!process.env.AI_FOUNDRY_API_KEY) {
            warnings.push('AI_FOUNDRY_API_KEY is not configured - AI responses will use fallback mode');
        }
        
        if (!process.env.AZURE_SPEECH_KEY) {
            warnings.push('AZURE_SPEECH_KEY is not configured - Speech features will be disabled');
        }
        
        if (!process.env.MicrosoftAppId) {
            warnings.push('MicrosoftAppId is not configured - Bot may not work in Teams');
        }
        
        return warnings;
    }
}

module.exports.BotUtils = BotUtils;