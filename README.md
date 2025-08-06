# recap-bot

recap-bot is a Discord bot powered by OpenAI that generates intelligent summaries of conversations in channels.  
Perfect for keeping track of what was discussed without reading through everything.

## ✨ Features

- **🤖 AI-Powered Recaps**: Generate intelligent summaries using OpenAI's GPT models
- **📊 Sentiment Analysis**: Analyze the mood and sentiment of conversations
- **🔑 Keyword Extraction**: Identify the most important topics discussed
- **❓ Question & Answer**: Ask questions about recent channel history
- **📝 Text Summarization**: Summarize any text with adjustable length
- **🎯 Channel Targeting**: Work with specific channels or current channel
- **⚙️ Customizable**: Adjust message count, analysis depth, and more

## 🚀 Commands

### `/recap`

Automatically generates a summary of all messages from today in the channel.

- `include_analysis` (optional): Include sentiment analysis and keywords (default: false)
- `channel` (optional): Target channel (default: current channel)

### `/summarize`

Generate a configurable summary of recent messages in a channel.

- `amount`: Number of recent messages to analyze (10-100)
- `channel` (optional): Target channel (default: current channel)
- `include_analysis` (optional): Include sentiment analysis and keywords (default: false)

## 🛠️ Setup

### Prerequisites

- Node.js 18+
- Discord Bot Token
- OpenAI API Key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/raulvieiradev/recap-bot.git
cd recap-bot
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
BOT_TOKEN=your_discord_bot_token_here
OPENAI_API_KEY=your_openai_api_key_here
WEBHOOK_LOGS_URL=https://discord.com/api/webhooks/your_webhook_url_here # Optional
```

4. Build the project:

```bash
npm run build
```

5. Start the bot:

```bash
npm start
```

### Development

For development with hot reload:

```bash
npm run dev
```

To check for TypeScript errors:

```bash
npm run check
```

## 🏗️ Project Structure

```
src/
├── discord/          # Discord bot logic
│   ├── commands/     # Slash commands
│   │   └── public/   # Public commands (recap, summarize)
│   ├── events/       # Discord events
│   └── base/         # Base classes and utilities
├── functions/        # Utility functions
│   └── openai.ts     # OpenAI integration
└── settings/         # Configuration and environment
```

## 🤖 OpenAI Integration

The bot includes a comprehensive OpenAI service (`src/functions/openai.ts`) with the following functions:

- **`generateRecap()`**: Create conversation summaries
- **`generateSummary()`**: Summarize any text
- **`analyzeSentiment()`**: Analyze text sentiment
- **`extractKeywords()`**: Extract important keywords
- **`askQuestion()`**: Answer questions based on context

All functions support customizable options like model selection, temperature, and token limits.

## 📋 Requirements

- Discord Bot with message read permissions
- OpenAI API access (GPT-3.5-turbo recommended for cost efficiency)
- Sufficient Discord API rate limits for message fetching

## 🔧 Configuration

The bot uses Zod for environment validation. Required variables:

- `BOT_TOKEN`: Discord bot token
- `OPENAI_API_KEY`: OpenAI API key
- `WEBHOOK_LOGS_URL`: (Optional) Discord webhook for logging

## 🚨 Rate Limits & Costs

Be mindful of:

- Discord API rate limits when fetching messages
- OpenAI API costs (varies by model and token usage)
- Set reasonable limits on message quantities in commands

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure TypeScript compiles (`npm run check`)
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Built with Node.js | Discord.js | TypeScript | OpenAI API.
