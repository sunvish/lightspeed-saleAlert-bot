import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { Telegraf } from "telegraf";
import mongoose from "mongoose";
import connectionModel from "./connectionModel.js";

dotenv.config();

mongoose
  .connect("mongodb://localhost:27017/tele")
  .then(() => console.log("mongodb connected"))
  .catch((error) => console.log(error));

const app = express();
app.use(express.json());

async function sendTelegramMessage(message, chatId) {
  const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;
  const data = {
    chat_id: chatId,
    text: message,
  };

  try {
    const response = await axios.post(url, data);
    console.log(`message sent`, response.data);
  } catch (error) {
    console.log(error);
  }
}

app.post("/lightspeed-webhook", async (req, res) => {
  const sale = req.body;
  const domainName = sale.retailer.domain_prefix;
  const connections = await connectionModel.find({
    domainName: domainName,
  });

  connections.forEach((connection) => {
    const message = `a new sale has been made by ${sale.customer.customer_code} total price : ${sale.sale.total_price}`;
    sendTelegramMessage(message, connection.chatId);
  });

  res.send({
    actions: [],
  });
});

// bot functionality  sunvish/lightspeed-saleAlert-bot

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply(
    "welcome to the bot, please configure your store by pressing /connect command"
  );
});
bot.help((ctx) => {
  ctx.reply("what help");
});

bot.hears("hello", (ctx) => ctx.reply("well hello there..."));

bot.hears("how are you", (ctx) =>
  ctx.reply("iam just a bot but am functioning properly")
);
bot.hears("orders", (ctx) =>
  ctx.reply("iam just a bot but am functioning properly")
);

bot.command("connect", async (ctx) => {
  const chatId = ctx.update.message.chat.id;
  console.log(chatId);
  const command = ctx.update.message.text;
  const domainName = command.split(" ").slice(1).join("").toString();
  const newConnection = await connectionModel.findOneAndUpdate(
    { domainName, chatId },
    { domainName, chatId },
    { upsert: true, new: true }
  );

  if (newConnection) {
    ctx.reply(`you are now connected to ${domainName}`);
  }
});

bot.hears("image", (ctx) =>
  ctx.replyWithPhoto(
    "https://c8.alamy.com/comp/C1GNDD/adult-bonobo-chimpanzee-at-the-sanctuary-lola-ya-bonobo-democratic-C1GNDD.jpg"
  )
);
bot.launch();

app.listen(3999, () => console.log("Server is running on port 3999"));
