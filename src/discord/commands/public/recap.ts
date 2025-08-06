import { createCommand } from "#base";
import { generateRecap, extractKeywords, analyzeSentiment } from "#functions";
import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  TextChannel,
  ChannelType,
} from "discord.js";

export default createCommand({
  name: "recap",
  description: "Generate a summary of today's messages in the channel using AI",
  global: true,
  options: [
    {
      name: "channel",
      description: "Channel to recap (default: current channel)",
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

      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);

      const messages = await channel.messages.fetch({ limit: 100 });

      const messageArray = Array.from(messages.values())
        .filter((msg) => msg.createdAt >= startOfDay)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .filter((msg) => !msg.author.bot && msg.content.trim().length > 0)
        .map((msg) => `${msg.author.displayName}: ${msg.content}`);

      if (messageArray.length === 0) {
        await interaction.editReply({
          content: "❌ No messages found from today to create recap!",
        });
        return;
      }

      const recap = await generateRecap(messageArray, {
        model: "gpt-3.5-turbo",
        temperature: 0.6,
        maxTokens: 1000,
      });

      const embed = new EmbedBuilder()
        .setTitle(`📋 Today's Channel Recap #${channel.name}`)
        .setDescription(recap)
        .setColor("#00ff00")
        .setFooter({
          text: `Based on ${messageArray.length} messages from today`,
        })
        .setTimestamp();

      if (includeAnalysis && messageArray.length > 0) {
        try {
          const fullText = messageArray.join(" ");

          const sentimentAnalysis = await analyzeSentiment(fullText);

          const keywords = await extractKeywords(fullText, 8);

          embed.addFields([
            {
              name: "📊 Sentiment Analysis",
              value: `**Sentiment:** ${sentimentAnalysis.sentiment}\n**Confidence:** ${sentimentAnalysis.confidence}\n**Explanation:** ${sentimentAnalysis.explanation}`,
              inline: false,
            },
            {
              name: "🔑 Keywords",
              value:
                keywords.length > 0
                  ? keywords.join(", ")
                  : "No keywords identified",
              inline: false,
            },
          ]);
        } catch (error) {
          console.error("Error in additional analysis:", error);
          embed.addFields([
            {
              name: "⚠️ Additional Analysis",
              value:
                "Could not perform sentiment analysis and keyword extraction.",
              inline: false,
            },
          ]);
        }
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error in recap command:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while generating the recap.";

      await interaction.editReply({
        content: `❌ **Error:** ${errorMessage}`,
      });
    }
  },
});
