# AI Foundry Teams Bot

A Microsoft Teams bot that integrates with AI Foundry endpoints to provide intelligent conversations with voice input and speech output capabilities.

## Features

- 🤖 **AI-Powered Conversations**: Connects to AI Foundry endpoints for intelligent responses
- 🎙️ **Voice Input**: Process voice commands and convert speech to text
- 🔊 **Speech Output**: Convert text responses to speech
- 👥 **Teams Integration**: Works seamlessly within Microsoft Teams (personal, group, and team chats)
- 🛡️ **Error Handling**: Robust error handling with fallback responses

## Prerequisites

- Node.js 18.0.0 or higher
- Microsoft Teams Developer account
- Azure subscription (for Speech Services)
- AI Foundry API access

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/RobertoBorges/chatbotteams.git
cd chatbotteams
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Microsoft Bot Framework
MicrosoftAppId=your-bot-app-id
MicrosoftAppPassword=your-bot-app-password

# AI Foundry Configuration
AI_FOUNDRY_BASE_URL=https://api.ai-foundry.com
AI_FOUNDRY_API_KEY=your-ai-foundry-api-key
AI_FOUNDRY_MODEL=gpt-3.5-turbo

# Azure Speech Services
AZURE_SPEECH_KEY=your-azure-speech-key
AZURE_SPEECH_REGION=eastus
```

### 3. Create a Bot in Azure

1. Go to [Azure Portal](https://portal.azure.com)
2. Create a new "Azure Bot" resource
3. Configure the messaging endpoint: `https://your-domain.com/api/messages`
4. Note down the App ID and App Password

### 4. Configure Teams App

1. Go to [Teams Developer Portal](https://dev.teams.microsoft.com)
2. Create a new app or import the manifest from `teams-app/manifest.json`
3. Replace `{{BOT_ID}}` with your bot's App ID
4. Upload proper icon files (32x32 PNG)

### 5. Run the Bot

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

The bot will be available at `http://localhost:3978`

## Usage

### Text Commands

Simply type messages to interact with the AI:
```
Hello, how are you?
Tell me about AI Foundry
What can you help me with?
```

### Voice Commands

Use voice prefixes to trigger voice/speech features:

- **Voice Input**: `voice: your message here`
  ```
  voice: What's the weather like today?
  ```

- **Speech Output**: `speak: text to be spoken`
  ```
  speak: Hello, this text will be converted to speech
  ```

## Architecture

```
src/
├── index.js          # Main server entry point
├── teamsBot.js       # Teams bot logic and message handling
services/
├── aiFoundryService.js  # AI Foundry API integration
└── speechService.js     # Azure Speech Services integration
teams-app/
├── manifest.json     # Teams app manifest
├── icon-color.png    # Teams app color icon
└── icon-outline.png  # Teams app outline icon
```

## API Integration

### AI Foundry Service

The bot integrates with AI Foundry using standard OpenAI-compatible endpoints:

- **Endpoint**: Configurable via `AI_FOUNDRY_BASE_URL`
- **Model**: Configurable via `AI_FOUNDRY_MODEL`
- **Authentication**: Bearer token via `AI_FOUNDRY_API_KEY`

### Azure Speech Services

Voice capabilities powered by Azure Cognitive Services:

- **Text-to-Speech**: Converts bot responses to audio
- **Speech-to-Text**: Processes voice input from users
- **Multiple Voices**: Supports various neural voices
- **Multiple Languages**: Configurable language support

## Development

### Running Tests

```bash
npm test
```

### Debugging

Set `LOG_LEVEL=debug` in your `.env` file for detailed logging.

### Adding New Features

1. Create new service files in the `services/` directory
2. Import and initialize in `src/index.js`
3. Add functionality to `src/teamsBot.js`

## Deployment

### Azure App Service

1. Create an Azure App Service
2. Configure environment variables in the App Service settings
3. Deploy using GitHub Actions or Azure CLI

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3978
CMD ["node", "src/index.js"]
```

## Configuration Options

| Environment Variable | Description | Default |
|---------------------|-------------|---------|
| `PORT` | Server port | 3978 |
| `AI_FOUNDRY_BASE_URL` | AI Foundry API base URL | https://api.ai-foundry.com |
| `AI_FOUNDRY_MODEL` | AI model to use | gpt-3.5-turbo |
| `SPEECH_LANGUAGE` | Speech recognition language | en-US |
| `LOG_LEVEL` | Logging level | info |

## Troubleshooting

### Common Issues

1. **Bot not responding**: Check App ID and Password configuration
2. **AI Foundry errors**: Verify API key and endpoint URL
3. **Speech not working**: Ensure Azure Speech Services key is valid
4. **Teams installation fails**: Check manifest.json syntax and required permissions

### Debugging Steps

1. Check application logs
2. Verify environment variables
3. Test endpoints individually
4. Use Bot Framework Emulator for local testing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues and questions:
- Create an issue on GitHub
- Check the [Teams Bot Framework documentation](https://docs.microsoft.com/en-us/microsoftteams/platform/bots/what-are-bots)
- Review [Azure Speech Services documentation](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/)