import { createCommand } from "#base";
import { generateRecap, extractKeywords, analyzeSentiment } from "#functions";
import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  TextChannel,
  ChannelType,
} from "discord.js";

export default createCommand({
  name: "summarize",
  description: "Generate a concise summary of recent channel messages using AI",
  global: true,
  options: [
    {
      name: "amount",
      description:
        "Number of messages to include in summary (default: 50, max: 200)",
      type: ApplicationCommandOptionType.Integer,
      min_value: 10,
      max_value: 200,
      required: false,
    },
    {
      name: "channel",
      description: "Channel to summarize (default: current channel)",
      type: ApplicationCommandOptionType.Channel,
      channel_types: [ChannelType.GuildText],
      required: false,
    },
    {
      name: "include_analysis",
      description: "Include sentiment analysis and keywords",
      type: ApplicationCommandOptionType.Boolean,
      required: false,
    },
  ],
  async run(interaction) {
    await interaction.deferReply();

    try {
      const amount = interaction.options.getInteger("amount") ?? 50;
      const channel =
        (interaction.options.getChannel("channel") as TextChannel) ??
        (interaction.channel as TextChannel);
      const includeAnalysis =
        interaction.options.getBoolean("include_analysis") ?? false;

      if (!channel || channel.type !== ChannelType.GuildText) {
        await interaction.editReply({
          content: "❌ This command can only be used in text channels!",
        });
        return;
      }

      const messages = await channel.messages.fetch({ limit: amount });
      const messageArray = Array.from(messages.values())
        .reverse()
        .filter((msg) => !msg.author.bot && msg.content.trim().length > 0)
        .map((msg) => `${msg.author.displayName}: ${msg.content}`);

      if (messageArray.length === 0) {
        await interaction.editReply({
          content: "❌ No valid messages found to summarize!",
        });
        return;
      }

      const summary = await generateRecap(messageArray, {
        model: "gpt-3.5-turbo",
        temperature: 0.5,
        maxTokens: 500,
        systemMessage:
          "You are an assistant specialized in creating concise, bullet-point summaries of conversations. Focus on the main topics and key points discussed.",
      });

      const embed = new EmbedBuilder()
        .setTitle(`📝 Channel Summary #${channel.name}`)
        .setDescription(summary)
        .setColor("#0099ff")
        .setFooter({
          text: `Summarized ${messageArray.length} recent messages`,
        })
        .setTimestamp();

      if (includeAnalysis && messageArray.length > 0) {
        try {
          const fullText = messageArray.join(" ");

          const sentimentAnalysis = await analyzeSentiment(fullText);

          const keywords = await extractKeywords(fullText, 6);

          embed.addFields([
            {
              name: "📊 Sentiment Analysis",
              value: `**Sentiment:** ${sentimentAnalysis.sentiment}\n**Confidence:** ${sentimentAnalysis.confidence}`,
              inline: true,
            },
            {
              name: "🔑 Keywords",
              value:
                keywords.length > 0
                  ? keywords.join(", ")
                  : "No keywords identified",
              inline: true,
            },
          ]);
        } catch (error) {
          console.error("Error in additional analysis:", error);
          embed.addFields([
            {
              name: "⚠️ Analysis",
              value: "Could not perform additional analysis.",
              inline: false,
            },
          ]);
        }
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error in summarize command:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while generating the summary.";

      await interaction.editReply({
        content: `❌ **Error:** ${errorMessage}`,
      });
    }
  },
});
