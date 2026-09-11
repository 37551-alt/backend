const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const conectarBanco = require("./config/database");

const app = express();

// ─────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────

app.use(
  cors({
    origin: "https://frontend-lake-nine-52.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Permite requisições OPTIONS do navegador
app.options("*", cors());

// ─────────────────────────────────────────────
// JSON
// ─────────────────────────────────────────────

app.use(express.json());

// ─────────────────────────────────────────────
// Conexão com MongoDB
// ─────────────────────────────────────────────

let bancoConectado = false;

app.use(async (req, res, next) => {
  try {
    if (!bancoConectado) {
      await conectarBanco();
      bancoConectado = true;
      console.log("✅ MongoDB conectado");
    }

    next();
  } catch (erro) {
    console.error("❌ Erro ao conectar ao MongoDB:", erro);

    res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao conectar ao banco de dados.",
    });
  }
});

// ─────────────────────────────────────────────
// Health check
// ─────────────────────────────────────────────

app.get("/", (req, res) => {
  res.json({
    sucesso: true,
    mensagem: "API funcionando! 🚀",
    versao: "1.0.0",
  });
});

// ─────────────────────────────────────────────
// Rotas
// ─────────────────────────────────────────────

const usuarioRoutes = require("./routes/userRoutes");

app.use("/api/usuarios", usuarioRoutes);

// ─────────────────────────────────────────────
// 404
// ─────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({
    sucesso: false,
    mensagem: `Rota "${req.method} ${req.url}" não encontrada.`,
  });
});

// ─────────────────────────────────────────────
// VERCEL
// ─────────────────────────────────────────────

module.exports = app;
