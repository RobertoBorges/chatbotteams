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

// Listen for incoming connections
server.listen(process.env.PORT || 3978, () => {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log('\nGet Bot Framework Emulator: https://aka.ms/bot-framework-emulator-readme');
    console.log('\nTo talk to your bot, open the emulator and connect to the endpoint below:');
    console.log(`http://localhost:${process.env.PORT || 3978}/api/messages`);
});