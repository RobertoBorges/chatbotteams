const { TeamsActivityHandler, MessageFactory, CardFactory } = require('botbuilder');

class TeamsBot extends TeamsActivityHandler {
    constructor(aiFoundryService, speechService) {
        super();
        this.aiFoundryService = aiFoundryService;
        this.speechService = speechService;

        this.onMessage(async (context, next) => {
            const userMessage = context.activity.text;
            
            try {
                console.log('Processing message:', userMessage);
                
                // Check if message contains audio/voice request
                if (this.isVoiceRequest(userMessage)) {
                    await this.handleVoiceRequest(context, userMessage);
                } else {
                    // Regular text processing through AI Foundry
                    const aiResponse = await this.aiFoundryService.getResponse(userMessage);
                    await context.sendActivity(MessageFactory.text(aiResponse));
                }
            } catch (error) {
                console.error('Error processing message:', error);
                await context.sendActivity(MessageFactory.text('Sorry, I encountered an error processing your request. Please try again.'));
            }

            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            const welcomeText = `Welcome to the AI Foundry Teams Bot! 🤖

I can help you with:
• Text conversations powered by AI Foundry
• Voice input processing (say "voice:" followed by your message)
• Speech output (say "speak:" followed by text to hear it spoken)

Try saying: "Hello, tell me about AI Foundry" or "voice: what can you do?"`;

            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity(MessageFactory.text(welcomeText));
                }
            }
            await next();
        });
    }

    isVoiceRequest(message) {
        return message.toLowerCase().includes('voice:') || 
               message.toLowerCase().includes('speak:') ||
               message.toLowerCase().includes('speech:');
    }

    async handleVoiceRequest(context, message) {
        try {
            const lowerMessage = message.toLowerCase();
            
            if (lowerMessage.includes('speak:')) {
                // Text-to-speech request
                const textToSpeak = message.substring(message.toLowerCase().indexOf('speak:') + 6).trim();
                const audioData = await this.speechService.textToSpeech(textToSpeak);
                
                await context.sendActivity(MessageFactory.text(`🔊 Speaking: "${textToSpeak}"`));
                // Note: In a real implementation, you'd send audio data to Teams
                // For now, we'll just acknowledge the request
                await context.sendActivity(MessageFactory.text('Audio would be played here (audio attachments require additional Teams app configuration)'));
                
            } else if (lowerMessage.includes('voice:')) {
                // Voice input simulation (in real scenario, this would process actual audio)
                const voiceText = message.substring(message.toLowerCase().indexOf('voice:') + 6).trim();
                await context.sendActivity(MessageFactory.text(`🎤 Received voice input: "${voiceText}"`));
                
                // Process through AI Foundry
                const aiResponse = await this.aiFoundryService.getResponse(voiceText);
                await context.sendActivity(MessageFactory.text(`AI Response: ${aiResponse}`));
            }
        } catch (error) {
            console.error('Error handling voice request:', error);
            await context.sendActivity(MessageFactory.text('Sorry, I encountered an error processing your voice request.'));
        }
    }
}

module.exports.TeamsBot = TeamsBot;