// server.js - Proxy para Groq API - Ancestral Travel MVP
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting - Protege sua API key
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // 20 requests por IP por 15 min
  message: {
    error: 'Muitas tentativas. Tente novamente em 15 minutos.',
    retryAfter: '15 minutos'
  }
});
app.use('/api/chat', limiter);

// Sua API key (mantida privada no servidor)
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Sistema de tracking de uso
let dailyUsage = {
  date: new Date().toDateString(),
  requests: 0,
  limit: 1000 // Limite diário para controlar custos
};

// Reset contador diário
function resetDailyUsage() {
  const today = new Date().toDateString();
  if (dailyUsage.date !== today) {
    dailyUsage = {
      date: today,
      requests: 0,
      limit: 1000
    };
  }
}

// Middleware para tracking
app.use((req, res, next) => {
  resetDailyUsage();
  next();
});

// Endpoint principal - Proxy para Groq
app.post('/api/chat', async (req, res) => {
  try {
    // Verificar limite diário
    if (dailyUsage.requests >= dailyUsage.limit) {
      return res.status(429).json({
        error: 'Limite diário de uso atingido',
        message: 'O MVP atingiu o limite de consultas hoje. Tente novamente amanhã ou entre em contato.',
        resetTime: 'Amanhã às 00:00'
      });
    }

    const { message, ancestryData } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }

    // Construir prompt especializado
    const systemPrompt = buildSystemPrompt(ancestryData);
    
    // Chamar Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 1200,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API Error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Incrementar contador
    dailyUsage.requests++;

    // Log para monitoramento
    console.log(`[${new Date().toISOString()}] Request #${dailyUsage.requests} - Message: "${message.substring(0, 50)}..."`);

    res.json({
      response: aiResponse,
      usage: {
        requestsToday: dailyUsage.requests,
        limit: dailyUsage.limit,
        remaining: dailyUsage.limit - dailyUsage.requests
      }
    });

  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Tente novamente em alguns momentos'
    });
  }
});

// Endpoint para stats (opcional)
app.get('/api/stats', (req, res) => {
  resetDailyUsage();
  res.json({
    date: dailyUsage.date,
    requests: dailyUsage.requests,
    limit: dailyUsage.limit,
    remaining: dailyUsage.limit - dailyUsage.requests
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    service: 'Ancestral Travel Proxy',
    timestamp: new Date().toISOString(),
    groqConfigured: !!GROQ_API_KEY
  });
});

// Função para construir prompt
function buildSystemPrompt(ancestryData = null) {
  let prompt = `Você é um especialista em viagens com foco em roteiros personalizados para a Ancestral Travel.

IMPORTANTE: O usuário pode escolher entre dois tipos de viagem:
1) **ROTEIRO ANCESTRAL** - Baseado no teste de DNA/ancestralidade
2) **ROTEIRO LIVRE** - Baseado apenas em preferências pessoais

`;

  if (ancestryData && ancestryData.continents) {
    prompt += `DADOS DE ANCESTRALIDADE DO USUÁRIO:
`;
    Object.entries(ancestryData.continents).forEach(([continent, percentage]) => {
      prompt += `- ${continent}: ${percentage}%\n`;
    });
    
    if (ancestryData.regions) {
      prompt += `\nRegiões específicas:\n`;
      Object.entries(ancestryData.regions).forEach(([region, percentage]) => {
        prompt += `- ${region}: ${percentage}%\n`;
      });
    }
    
    prompt += `\n🧬 PARA ROTEIROS ANCESTRAIS: Use estes dados para sugerir destinos conectados às origens do usuário.\n\n`;
  } else {
    prompt += `❌ USUÁRIO NÃO FEZ UPLOAD DE DNA: Foque apenas em preferências pessoais.\n\n`;
  }

  prompt += `SUAS RESPOSTAS DEVEM INCLUIR:
- Se apresente como especialista da Ancestral Travel
- Recomendações específicas de destinos
- Orçamentos realistas em reais (R$)
- Dicas práticas (hospedagem, transporte, melhor época)
- Seja conversacional, específico, educado e útil
- Sempre faça uma pergunta para continuar a conversa

REGRAS IMPORTANTES:
- Quando não souber de algo, pergunte educadamente
- Não invente informações, seja honesto quando não souber
- Para orçamentos, seja realista com preços atuais do Brasil
- Use emojis para deixar as respostas mais visuais
- Mantenha tom profissional mas amigável

FORMATO DE RESPOSTA:
- Use markdown para destacar seções importantes
- Inclua pelo menos 3-5 recomendações específicas quando possível
- Termine sempre com uma pergunta relevante para continuar a conversa`;

  return prompt;
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Ancestral Travel Proxy running on port ${PORT}`);
  console.log(`📊 Daily limit: ${dailyUsage.limit} requests`);
  console.log(`🔑 Groq API: ${GROQ_API_KEY ? 'Configured ✅' : 'Missing! ❌'}`);
});

module.exports = app;
