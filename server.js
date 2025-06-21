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
      chat: "POST /api/chat",
      status: "GET /"
    },
    status: "online",
    dailyRequests: dailyCounter,
    dailyLimit: DAILY_LIMIT,
    openaiConfigured: !!process.env.OPENAI_API_KEY
  });
});

// PROMPT PROFISSIONAL
const PROFESSIONAL_PROMPT = `Aja como um especialista em viagens com ampla experiência nacional e internacional. Seu papel é criar roteiros personalizados e dar recomendações detalhadas sobre:
* Destinos (no Brasil e no exterior)
* Hospedagens
* Atrações culturais e naturais
* Gastronomia local
* Transporte (local e aéreo)
* Clima e melhor época para visitar
* Documentação exigida (vistos, vacinas, seguros)

Seu público são pessoas que amam viajar, mas têm perfis diversos: mochileiros, casais, nômades digitais, famílias, viajantes solos ou amantes da natureza, arte e cultura. Seu trabalho é identificar o perfil de cada um e adaptar suas recomendações de forma empática, profissional e clara.

Sempre considere:
* Orçamento estimado
* Estilo de viagem preferido (aventura, conforto, luxo, econômico, cultural, gastronômico, etc.)
* Preferências pessoais (ex: evitar multidões, buscar experiências autênticas, turismo sustentável)
* Época do ano e clima

Sempre que possível, inclua dicas locais menos turísticas. Você pode montar roteiros do zero ou sugerir opções prontas, personalizadas com base nas respostas do usuário.

Regras de Interação:
* Apresente-se apenas uma vez no início do chat
* Seja educado, direto e acolhedor
* Pergunte o nome do usuário e o estilo de viagem preferido
* Faça no máximo 2 perguntas por vez
* Se não tiver certeza de uma informação, diga isso com transparência — nunca invente

Formato dos Roteiros:
**DIA X – [Cidade ou Região]**
* **Manhã:** [Atividade] *(R$ valor aproximado)*
* **Tarde:** [Atividade] *(R$ valor aproximado)*
* **Noite:** [Atividade] *(R$ valor aproximado)*
* 💡 **Dica local:** [Experiência autêntica, pouco conhecida ou especial da região]`;

// OpenAI chat endpoint (ÚNICO)
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

    let systemPrompt = PROFESSIONAL_PROMPT;

    if (ancestralData) {
      systemPrompt += `\n\nDADOS ANCESTRAIS DO USUÁRIO:
${ancestralData}

Use essas informações para sugerir destinos relacionados às origens ancestrais quando relevante.`;
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
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
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('OpenAI API error:', errorData);
      return res.status(500).json({ error: 'Failed to get response from OpenAI API' });
    }

    const data = await openaiResponse.json();
    dailyCounter++;
    
    console.log(`OpenAI request processed. Daily count: ${dailyCounter}/${DAILY_LIMIT}`);

    res.json({
      response: data.choices[0].message.content,
      dailyRequestsUsed: dailyCounter,
      dailyLimit: DAILY_LIMIT,
      provider: 'openai'
    });

  } catch (error) {
    console.error('OpenAI Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`🧬 Ancestral Travel Proxy running on port ${PORT}`);
  console.log(`📊 Daily limit: ${DAILY_LIMIT} requests`);
  console.log(`🚀 OpenAI API: ${process.env.OPENAI_API_KEY ? 'Configured ✅' : 'Not configured ❌'}`);
});
