const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
  console.error(
    "Ошибка: не найдены TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID в .env",
  );
  process.exit(1);
}

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }),
);

app.use(express.json({ limit: "1mb" }));

app.use(express.static(path.join(__dirname, "public")));

function normalizeText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatPrice(value) {
  return new Intl.NumberFormat("ru-RU").format(Number(value || 0));
}

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    message: "Server is working",
  });
});

app.post("/api/order", async (req, res) => {
  try {
    const { customer = {}, items = [], total = 0 } = req.body || {};

    const fullName = normalizeText(customer.fullName);
    const phone = normalizeText(customer.phone);
    const messenger = normalizeText(customer.messenger);
    const messengerContact = normalizeText(customer.messengerContact);
    const comment = normalizeText(customer.comment);

    if (!fullName) {
      return res.status(400).json({
        ok: false,
        message: "Укажите ФИО",
      });
    }

    if (!phone) {
      return res.status(400).json({
        ok: false,
        message: "Укажите номер телефона",
      });
    }

    if (!messenger) {
      return res.status(400).json({
        ok: false,
        message: "Укажите мессенджер",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        ok: false,
        message: "Корзина пуста",
      });
    }

    const itemsText = items
      .map((item, index) => {
        const name = normalizeText(item.name) || "Товар";
        const price = Number(item.price) || 0;
        const qty = Number(item.qty) || 0;
        const sum = price * qty;

        return `${index + 1}. ${name}\n${qty} × ${formatPrice(price)} = ${formatPrice(sum)} din`;
      })
      .join("\n\n");

    const text = [
      "🛒 Новый заказ",
      "",
      `👤 ФИО: ${fullName}`,
      `📞 Телефон: ${phone}`,
      `💬 Мессенджер: ${messenger}`,
      `🔗 Контакт: ${messengerContact || "не указан"}`,
      comment ? `📝 Комментарий: ${comment}` : null,
      "",
      "📦 Состав заказа:",
      itemsText,
      "",
      `💰 Итого: ${formatPrice(total)} din`,
    ]
      .filter(Boolean)
      .join("\n");

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const tgResponse = await axios.post(
      telegramUrl,
      {
        chat_id: TELEGRAM_CHAT_ID,
        text,
      },
      {
        timeout: 15000,
      },
    );

    if (!tgResponse.data || !tgResponse.data.ok) {
      throw new Error(tgResponse.data?.description || "Telegram error");
    }

    return res.json({
      ok: true,
      message: "Заказ отправлен",
    });
  } catch (error) {
    console.error(
      "Ошибка отправки заказа:",
      error.response?.data || error.message,
    );

    return res.status(500).json({
      ok: false,
      message:
        error.response?.data?.description || "Не удалось отправить заказ",
    });
  }
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server started on port ${PORT}`);
});