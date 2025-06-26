const { TeamsActivityHandler, MessageFactory, CardFactory } = require('botbuilder');
const { BotUtils } = require('./botUtils');

class TeamsBot extends TeamsActivityHandler {
    constructor(aiFoundryService, speechService) {
        super();
        this.aiFoundryService = aiFoundryService;
        this.speechService = speechService;

        // Log configuration warnings
        const warnings = BotUtils.validateEnvironmentConfig();
        warnings.forEach(warning => console.warn('⚠️ ', warning));

        this.onMessage(async (context, next) => {
            const rawMessage = context.activity.text;
            const userMessage = BotUtils.sanitizeInput(rawMessage);
            
            try {
                BotUtils.logActivity(context, 'message_received', { message: userMessage });
                
                // Show typing indicator for better UX
                await BotUtils.sendTypingIndicator(context);
                
                // Check for help request
                if (BotUtils.isHelpRequest(userMessage)) {
                    const helpCard = BotUtils.createHelpCard();
                    await context.sendActivity(helpCard);
                    return await next();
                }
                
                // Check if message contains audio/voice request
                if (BotUtils.isVoiceCommand(userMessage)) {
                    await this.handleVoiceRequest(context, userMessage);
                } else {
                    // Regular text processing through AI Foundry
                    const aiResponse = await this.aiFoundryService.getResponse(userMessage);
                    const formattedResponse = BotUtils.formatAIResponse(aiResponse);
                    await context.sendActivity(MessageFactory.text(formattedResponse));
                }
                
                BotUtils.logActivity(context, 'message_processed');
            } catch (error) {
                console.error('Error processing message:', error);
                BotUtils.logActivity(context, 'message_error', { error: error.message });
                
                const errorCard = BotUtils.createErrorCard(error);
                await context.sendActivity(errorCard);
            }

            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    BotUtils.logActivity(context, 'member_added', { 
                        memberId: membersAdded[cnt].id,
                        memberName: membersAdded[cnt].name 
                    });
                    
                    const welcomeCard = BotUtils.createWelcomeCard();
                    await context.sendActivity(welcomeCard);
                }
            }
            await next();
        });
    }

    async handleVoiceRequest(context, message) {
        try {
            const voiceCommand = BotUtils.extractVoiceCommand(message);
            
            if (!voiceCommand) {
                await context.sendActivity(MessageFactory.text('I couldn\'t understand your voice command. Please use the format: "voice: your message" or "speak: your text"'));
                return;
            }
            
            BotUtils.logActivity(context, 'voice_command', { 
                type: voiceCommand.type, 
                text: voiceCommand.text 
            });
            
            if (voiceCommand.type === 'speak' || voiceCommand.type === 'speech') {
                // Text-to-speech request
                await this.handleTextToSpeech(context, voiceCommand.text);
                
            } else if (voiceCommand.type === 'voice' || voiceCommand.type === 'say') {
                // Voice input simulation (in real scenario, this would process actual audio)
                await this.handleVoiceInput(context, voiceCommand.text);
            }
        } catch (error) {
            console.error('Error handling voice request:', error);
            BotUtils.logActivity(context, 'voice_error', { error: error.message });
            
            const errorMessage = 'Sorry, I encountered an error processing your voice request. Please try again or use text commands.';
            await context.sendActivity(MessageFactory.text(errorMessage));
        }
    }

    async handleTextToSpeech(context, textToSpeak) {
        try {
            await context.sendActivity(MessageFactory.text(`🔊 **Speaking:** "${textToSpeak}"`));
            
            const audioData = await this.speechService.textToSpeech(textToSpeak);
            
            if (audioData) {
                // In a real implementation, you'd send audio data to Teams
                // For now, we'll acknowledge the successful conversion
                await context.sendActivity(MessageFactory.text('✅ Text converted to speech successfully! (Audio playback requires additional Teams app configuration)'));
                BotUtils.logActivity(context, 'text_to_speech_success', { textLength: textToSpeak.length });
            } else {
                await context.sendActivity(MessageFactory.text('ℹ️ Speech synthesis is not configured. Please configure Azure Speech Services to enable this feature.'));
            }
            
        } catch (error) {
            console.error('Error in text-to-speech:', error);
            await context.sendActivity(MessageFactory.text('Sorry, I couldn\'t convert that text to speech. Please try again.'));
        }
    }

    async handleVoiceInput(context, voiceText) {
        try {
            await context.sendActivity(MessageFactory.text(`🎤 **Voice Input Received:** "${voiceText}"`));
            
            // Process through AI Foundry
            const aiResponse = await this.aiFoundryService.getResponse(voiceText);
            const formattedResponse = BotUtils.formatAIResponse(aiResponse);
            
            await context.sendActivity(MessageFactory.text(`🤖 **AI Response:** ${formattedResponse}`));
            
            BotUtils.logActivity(context, 'voice_input_processed', { 
                inputText: voiceText,
                responseLength: formattedResponse.length 
            });
            
        } catch (error) {
            console.error('Error processing voice input:', error);
            await context.sendActivity(MessageFactory.text('Sorry, I couldn\'t process your voice input. Please try again.'));
        }
    }
}

module.exports.TeamsBot = TeamsBot;