const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

app.use('/api/', limiter);

// Global daily counter (simple in-memory counter)
let dailyCounter = 0;
const DAILY_LIMIT = 1000;

// Reset daily counter at midnight (simple implementation)
setInterval(() => {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    dailyCounter = 0;
    console.log('Daily counter reset');
  }
}, 60000); // Check every minute

// Rota inicial para confirmar que está funcionando
app.get('/', (req, res) => {
  res.json({ 
    message: "🧬 Ancestral Travel Proxy is running!", 
    endpoints: {
      chat: "POST /api/chat",
      status: "GET /"
    },
    status: "online",
    dailyRequests: dailyCounter,
    dailyLimit: DAILY_LIMIT,
    groqConfigured: !!process.env.GROQ_API_KEY
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    dailyRequests: dailyCounter,
    dailyLimit: DAILY_LIMIT
  });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    // Check daily limit
    if (dailyCounter >= DAILY_LIMIT) {
      return res.status(429).json({ 
        error: 'Daily limit reached. Please try again tomorrow.',
        dailyLimit: DAILY_LIMIT 
      });
    }

    const { message, ancestralData } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Construct system prompt
    let systemPrompt = `Você é um especialista em viagens com foco em roteiros personalizados para a Ancestral Travel.

IMPORTANTE: O usuário pode escolher entre:
1) ROTEIRO ANCESTRAL - Baseado no teste de DNA/ancestralidade
2) ROTEIRO LIVRE - Baseado apenas em preferências pessoais

SUAS RESPOSTAS DEVEM INCLUIR:
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
- Use emojis para deixar as respostas mais visuais`;

    if (ancestralData) {
      systemPrompt += `\n\nDADOS ANCESTRAIS DO USUÁRIO:
${ancestralData}

Use essas informações para sugerir destinos relacionados às origens ancestrais quando relevante.`;
    }

    // Prepare the request to Groq
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!groqResponse.ok) {
      const errorData = await groqResponse.text();
      console.error('Groq API error:', errorData);
      return res.status(500).json({ error: 'Failed to get response from AI service' });
    }

    const data = await groqResponse.json();
    
    // Increment daily counter
    dailyCounter++;
    
    console.log(`Request processed. Daily count: ${dailyCounter}/${DAILY_LIMIT}`);

    res.json({
      response: data.choices[0].message.content,
      dailyRequestsUsed: dailyCounter,
      dailyLimit: DAILY_LIMIT
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`🧬 Ancestral Travel Proxy running on port ${PORT}`);
  console.log(`📊 Daily limit: ${DAILY_LIMIT} requests`);
  console.log(`🤖 Groq API: ${process.env.GROQ_API_KEY ? 'Configured ✅' : 'Not configured ❌'}`);
});
