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

// Global daily counter
let dailyCounter = 0;
const DAILY_LIMIT = 1000;

// Reset daily counter at midnight
setInterval(() => {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    dailyCounter = 0;
    console.log('Daily counter reset');
  }
}, 60000);

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: "🧬 Ancestral Travel Proxy is running!", 
    endpoints: {
      groq: "POST /api/chat",
      claude: "POST /api/claude-chat",
      status: "GET /"
    },
    status: "online",
    dailyRequests: dailyCounter,
    dailyLimit: DAILY_LIMIT,
    groqConfigured: !!process.env.GROQ_API_KEY,
    claudeConfigured: !!process.env.CLAUDE_API_KEY
  });
});

// Groq endpoint
app.post('/api/chat', async (req, res) => {
  try {
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

    // PROMPT CORRIGIDO - DIRETO E OBJETIVO
    let systemPrompt = `Aja como um especialista em viagens com ampla experiência nacional e internacional.

REGRAS RÍGIDAS:
- Apresente-se APENAS UMA VEZ no início da conversa
- NUNCA invente informações sobre o usuário
- Seja direto e objetivo
- Máximo 2 perguntas por vez
- NUNCA se chame por nome - você é apenas "especialista"
- NUNCA repita a apresentação em mensagens seguintes
- NUNCA tire conclusões sobre o tipo de viagem sem o usuário especificar

FORMATO OBRIGATÓRIO DOS ROTEIROS:
**DIA X – [Cidade]**
* **Manhã:** [Atividade] *(R$ valor)*
* **Tarde:** [Atividade] *(R$ valor)*
* **Noite:** [Atividade] *(R$ valor)*
* 💡 **Dica local:** [Experiência autêntica]

Sempre que possível, inclua dicas locais menos turísticas. Você pode sugerir roteiros prontos ou montar personalizados a partir das preferências do usuário.

Regras de Interação:
* Apresente-se apenas uma vez no início do chat
* Seja educado, direto e acolhedor
* Pergunte o nome do usuário e o estilo de viagem preferido
* Faça no máximo 2 perguntas por vez
* Se não tiver certeza de uma informação, diga isso com transparência — nunca invente`;

    if (ancestralData) {
      systemPrompt += `\n\nDADOS ANCESTRAIS DO USUÁRIO:
${ancestralData}

Use essas informações para sugerir destinos relacionados às origens ancestrais quando relevante.`;
    }

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
        max_tokens: 500, // REDUZIDO PARA RESPOSTAS MAIS CURTAS
        temperature: 0.7
      })
    });

    if (!groqResponse.ok) {
      const errorData = await groqResponse.text();
      console.error('Groq API error:', errorData);
      return res.status(500).json({ error: 'Failed to get response from AI service' });
    }

    const data = await groqResponse.json();
    dailyCounter++;
    
    console.log(`Groq request processed. Daily count: ${dailyCounter}/${DAILY_LIMIT}`);

    res.json({
      response: data.choices[0].message.content,
      dailyRequestsUsed: dailyCounter,
      dailyLimit: DAILY_LIMIT,
      provider: 'groq'
    });

  } catch (error) {
    console.error('Groq Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Claude endpoint
app.post('/api/claude-chat', async (req, res) => {
  try {
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

    // PROMPT CORRIGIDO PARA CLAUDE TAMBÉM
    let claudeSystemPrompt = `Aja como um especialista em viagens com ampla experiência nacional e internacional.

REGRAS RÍGIDAS:
- Apresente-se APENAS UMA VEZ no início da conversa
- NUNCA invente informações sobre o usuário
- Seja direto e objetivo
- Máximo 2 perguntas por vez
- NUNCA se chame por nome - você é apenas "especialista"
- NUNCA repita a apresentação em mensagens seguintes
- NUNCA tire conclusões sobre o tipo de viagem sem o usuário especificar

FORMATO OBRIGATÓRIO DOS ROTEIROS:
**DIA X – [Cidade]**
* **Manhã:** [Atividade] *(R$ valor)*
* **Tarde:** [Atividade] *(R$ valor)*
* **Noite:** [Atividade] *(R$ valor)*
* 💡 **Dica local:** [Experiência autêntica]

Sempre que possível, inclua dicas locais menos turísticas. Você pode sugerir roteiros prontos ou montar personalizados a partir das preferências do usuário.

Regras de Interação:
* Apresente-se apenas uma vez no início do chat
* Seja educado, direto e acolhedor
* Pergunte o nome do usuário e o estilo de viagem preferido
* Faça no máximo 2 perguntas por vez
* Se não tiver certeza de uma informação, diga isso com transparência — nunca invente`;

    if (ancestralData) {
      claudeSystemPrompt += `\n\nDADOS ANCESTRAIS DO USUÁRIO:
${ancestralData}

Use essas informações para sugerir destinos relacionados às origens ancestrais quando relevante.`;
    }

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLAUDE_API_KEY}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500, // REDUZIDO PARA RESPOSTAS MAIS CURTAS
        system: claudeSystemPrompt,
        messages: [
          {
            role: 'user',
            content: message
          }
        ]
      })
    });

    if (!claudeResponse.ok) {
      const errorData = await claudeResponse.text();
      console.error('Claude API error:', errorData);
      return res.status(500).json({ error: 'Failed to get response from Claude API' });
    }

    const data = await claudeResponse.json();
    dailyCounter++;
    
    console.log(`Claude request processed. Daily count: ${dailyCounter}/${DAILY_LIMIT}`);

    res.json({
      response: data.content[0].text,
      dailyRequestsUsed: dailyCounter,
      dailyLimit: DAILY_LIMIT,
      provider: 'claude'
    });

  } catch (error) {
    console.error('Claude Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`🧬 Ancestral Travel Proxy running on port ${PORT}`);
  console.log(`📊 Daily limit: ${DAILY_LIMIT} requests`);
  console.log(`🤖 Groq API: ${process.env.GROQ_API_KEY ? 'Configured ✅' : 'Not configured ❌'}`);
  console.log(`🧠 Claude API: ${process.env.CLAUDE_API_KEY ? 'Configured ✅' : 'Not configured ❌'}`);
});
