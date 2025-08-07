import { createCommand } from "#base";
import { askQuestion } from "#functions";
import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  TextChannel,
  ChannelType,
} from "discord.js";

export default createCommand({
  name: "ask",
  description: "Ask a question about the recent channel history using AI",
  global: true,
  options: [
    {
      name: "question",
      description: "The question you want to ask about the channel history",
      type: ApplicationCommandOptionType.String,
      required: true,
      max_length: 500,
    },
    {
      name: "amount",
      description: "Number of messages to analyze (default: 100, max: 200)",
      type: ApplicationCommandOptionType.Integer,
      min_value: 20,
      max_value: 200,
      required: false,
    },
    {
      name: "channel",
      description: "Channel to analyze (default: current channel)",
      type: ApplicationCommandOptionType.Channel,
      channel_types: [ChannelType.GuildText],
      required: false,
    },
  ],
  async run(interaction) {
    await interaction.deferReply();

    try {
      const question = interaction.options.getString("question", true);
      const amount = interaction.options.getInteger("amount") ?? 100;
      const channel =
        (interaction.options.getChannel("channel") as TextChannel) ??
        (interaction.channel as TextChannel);

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
        .map(
          (msg) =>
            `[${msg.createdAt.toLocaleString("en-US")}] ${
              msg.author.displayName
            }: ${msg.content}`
        );

      if (messageArray.length === 0) {
        await interaction.editReply({
          content: "❌ No valid messages found to analyze!",
        });
        return;
      }

      const context = messageArray.join("\n");

      const answer = await askQuestion(context, question, {
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        maxTokens: 500,
      });

      const embed = new EmbedBuilder()
        .setTitle("🤔 Question about Channel History")
        .addFields([
          {
            name: "❓ Question",
            value: question,
            inline: false,
          },
          {
            name: "💬 Answer",
            value: answer,
            inline: false,
          },
        ])
        .setColor("#0099ff")
        .setFooter({
          text: `Based on ${messageArray.length} messages from #${channel.name}`,
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error in ask command:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while processing your question.";

      await interaction.editReply({
        content: `❌ **Error:** ${errorMessage}`,
      });
    }
  },
});
