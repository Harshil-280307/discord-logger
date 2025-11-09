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

app.listen(PORT, () => console.log(`🌍 Keep-alive server running on port ${PORT}`));

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

// ✅ Allowed channels (ONLY these will be logged)
const ALLOWED_CHANNELS = ["general", "support"];

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);

  const notice = `⚠️ Notice: This server's messages in #general and #support are logged for transparency. DMs and private channels are NOT logged.`;

  client.guilds.cache.forEach(guild => {
    const channel =
      guild.systemChannel ||
      guild.channels.cache.find(c =>
        c.type === 0 &&
        c.permissionsFor(guild.members.me).has("SendMessages")
      );

    if (channel) channel.send(notice);
  });
});

// client.on("messageCreate", async (message) => {
//   if (message.author.bot) return;

//   if (!ALLOWED_CHANNELS.includes(message.channel.name)) return; // ❌ Skip other channels

//   const payload = {
//     time: new Date().toISOString(),
//     author: message.author.username,
//     channel: message.channel.name,
//     message: message.content || "(no text)",
//     attachments: message.attachments.size > 0
//       ? [...message.attachments.values()].map(a => a.url).join(", ")
//       : null
//   };

//   try {
//     await axios.post(SHEET_WEBHOOK, payload);
//     console.log(`✅ Logged: ${message.author.username} → ${message.channel.name}`);
//   } catch (error) {
//     console.error("❌ Logging failed:", error.message);
//   }
// });














// client.on("messageCreate", async (message) => {
//   if (message.author.bot) return;

//   if (!ALLOWED_CHANNELS.includes(message.channel.name)) return;

//   const content = message.content.trim();
//   if (!content) return; // ignores pure image messages

//   const payload = {
//     time: new Date().toISOString(),
//     author: message.author.username,
//     channel: message.channel.name,
//     message: content
//   };

//   try {
//     await axios.post(SHEET_WEBHOOK, payload);
//     console.log(`✅ Logged: ${message.author.username} → ${content}`);
//   } catch (error) {
//     console.error("❌ Logging failed:", error.message);
//   }
// });









client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // Only log selected channels
  if (!ALLOWED_CHANNELS.includes(message.channel.name)) return;

  // If no text content, ignore message (example: only image)
  const content = message.content?.trim();
  if (!content || content.length === 0) return;

  const payload = {
    time: new Date().toISOString(),
    author: message.author.username,
    channel: message.channel.name,
    message: content
  };

  try {
    await axios.post(SHEET_WEBHOOK, payload);
    console.log(`✅ Logged:`);
  } catch (error) {
    console.error("❌ Logging failed:", error.message);
  }
});











client.login(TOKEN);
