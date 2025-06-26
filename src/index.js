const restify = require('restify');
const { BotFrameworkAdapter, MessageFactory } = require('botbuilder');
const { TeamsBot } = require('./teamsBot');
const { AIFoundryService } = require('../services/aiFoundryService');
const { SpeechService } = require('../services/speechService');
require('dotenv').config();

// Create HTTP server
const server = restify.createServer();
server.use(restify.plugins.bodyParser());

// Create adapter
const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Catch-all for errors
adapter.onTurnError = async (context, error) => {
    const errorMessageText = 'This bot encountered an error or bug.';
    await context.sendActivity(MessageFactory.text(errorMessageText, errorMessageText));
    console.error(`\n [onTurnError]: ${error}`);
};

// Initialize services
const aiFoundryService = new AIFoundryService();
const speechService = new SpeechService();

// Create the main dialog
const bot = new TeamsBot(aiFoundryService, speechService);

// Listen for incoming requests
server.post('/api/messages', async (req, res) => {
    await adapter.process(req, res, (context) => bot.run(context));
});

// Health check endpoint
server.get('/health', (req, res, next) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0'
    });
    return next();
});

// Listen for incoming connections
server.listen(process.env.PORT || 3978, () => {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log('\nGet Bot Framework Emulator: https://aka.ms/bot-framework-emulator-readme');
    console.log('\nTo talk to your bot, open the emulator and connect to the endpoint below:');
    console.log(`http://localhost:${process.env.PORT || 3978}/api/messages`);
    console.log(`\nHealth check available at: http://localhost:${process.env.PORT || 3978}/health`);
});