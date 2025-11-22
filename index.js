import express from "express";
import { Client, GatewayIntentBits } from "discord.js";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

// ---------- EXPRESS KEEPALIVE SERVER ----------
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("✅ Discord Logger Bot is running");
});

app.listen(PORT, () =>
  console.log(`🌍 Keep-alive server running on port ${PORT}`)
);

// ---------- DISCORD BOT SETUP ----------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const SHEET_WEBHOOK = process.env.SHEET_WEBHOOK;
const TOKEN = process.env.BOT_TOKEN;

// Allowed channels
const ALLOWED_CHANNELS = ["general", "support"];

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);

  const notice = `⚠️ Notice: This server's messages in #general and #support are logged for transparency. DMs and private channels are NOT logged.`;

  client.guilds.cache.forEach((guild) => {
    const channel =
      guild.systemChannel ||
      guild.channels.cache.find(
        (c) =>
          c.type === 0 &&
          c.permissionsFor(guild.members.me).has("SendMessages")
      );

    if (channel) channel.send(notice);
  });
});

// ---------- MESSAGE LOGGER ----------
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // Only allowed channels
  if (!ALLOWED_CHANNELS.includes(message.channel.name)) return;

  // Ignore image-only messages
  const content = message.content?.trim();
  if (!content || content.length === 0) return;

  // Format date + time: "10 / 11 / 2025 , 12 : 24 AM"
  const now = new Date();

  const date = now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  const timeString = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  const payload = {
    time: `${date} , ${timeString}`,
    author: message.author.username,
    channel: message.channel.name,
    message: content
  };

  try {
    await axios.post(SHEET_WEBHOOK, payload);
    console.log(`✅ Logged: ${message.author.username} → ${content}`);
  } catch (error) {
    console.error("❌ Logging failed:", error.message);
  }
});

// ---------- START BOT ----------
client.login(TOKEN);
