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

// PROMPT PROFISSIONAL CORRIGIDO E SIMPLIFICADO
const PROFESSIONAL_PROMPT = `Você é um especialista em viagens da Ancestral Travel, sua função será apoiar o usuário na estruturação de um excelente roteiro

REGRAS OBRIGATÓRIAS:
1. NUNCA se apresente novamente após a primeira mensagem
2. NUNCA pergunte "sobre o que gostaria de conversar"  
3. Seja DIRETO e objetivo - máximo 3 frases por resposta
4. NUNCA invente informações sobre o usuário
5. Máximo 1 pergunta por vez

FORMATO DOS ROTEIROS:
*DIA X – [Cidade]*
Manhã: [Atividade] (R$ valor)
Tarde: [Atividade] (R$ valor)  
Noite: [Atividade] (R$ valor)
💡 **Dica local:** [Experiência autêntica]

APRESENTAÇÃO (apenas uma vez):
"Sou seu especialista em viagens da Ancestral Travel! Qual seu nome e para onde quer viajar?"

Para mensagens seguintes: seja direto, crie roteiros específicos ou faça UMA pergunta relevante.`;

// OpenAI chat endpoint com DEBUG
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
      systemPrompt += `\n\nDADOS ANCESTRAIS: ${ancestralData}
Use essas informações para sugerir destinos conectados às origens quando relevante.`;
    }

    // DEBUG: Log do que está sendo enviado
    console.log('=== DEBUG REQUEST ===');
    console.log('Model: gpt-4');
    console.log('System Prompt Length:', systemPrompt.length);
    console.log('User Message:', message);
    console.log('Ancestral Data:', ancestralData ? 'Yes' : 'No');

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',  // GARANTINDO GPT-4
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
        max_tokens: 300,  // REDUZIDO para forçar respostas diretas
        temperature: 0.7
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('OpenAI API error:', errorData);
      
      // Se GPT-4 falhar, tenta GPT-3.5-turbo como fallback
      if (errorData.includes('model_not_found') || errorData.includes('insufficient_quota')) {
        console.log('GPT-4 failed, trying GPT-3.5-turbo...');
        
        const fallbackResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
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
            max_tokens: 300,
            temperature: 0.7
          })
        });
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          dailyCounter++;
          
          console.log('=== DEBUG RESPONSE (GPT-3.5) ===');
          console.log('Response:', fallbackData.choices[0].message.content);
          
          return res.json({
            response: fallbackData.choices[0].message.content,
            dailyRequestsUsed: dailyCounter,
            dailyLimit: DAILY_LIMIT,
            provider: 'openai-gpt35',
            debug: 'Used GPT-3.5-turbo fallback'
          });
        }
      }
      
      return res.status(500).json({ error: 'Failed to get response from OpenAI API' });
    }

    const data = await openaiResponse.json();
    dailyCounter++;
    
    // DEBUG: Log da resposta
    console.log('=== DEBUG RESPONSE (GPT-4) ===');
    console.log('Response:', data.choices[0].message.content);
    console.log('Usage:', data.usage);
    
    res.json({
      response: data.choices[0].message.content,
      dailyRequestsUsed: dailyCounter,
      dailyLimit: DAILY_LIMIT,
      provider: 'openai-gpt4',
      debug: {
        model: 'gpt-4',
        usage: data.usage,
        promptLength: systemPrompt.length
      }
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
