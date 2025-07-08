'use client'

import { useState } from 'react'

interface TestResult {
  name: string
  status: 'idle' | 'running' | 'success' | 'error'
  message?: string
  data?: any
  duration?: number
}

export default function TestPage() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'OpenAI Service', status: 'idle' },
    { name: 'DNA Parser', status: 'idle' },
    { name: 'Context Manager', status: 'idle' },
    { name: 'Intelligent Agent', status: 'idle' },
    { name: 'API Chat', status: 'idle' },
    { name: 'API Process DNA', status: 'idle' }
  ])

  const updateTest = (name: string, updates: Partial<TestResult>) => {
    setTests(prev => prev.map(test => 
      test.name === name ? { ...test, ...updates } : test
    ))
  }

  const testOpenAIService = async () => {
    updateTest('OpenAI Service', { status: 'running' })
    const start = Date.now()
    
    try {
      const response = await fetch('/api/test/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'health-check' })
      })
      
      const result = await response.json()
      const duration = Date.now() - start
      
      if (response.ok && result.success) {
        updateTest('OpenAI Service', { 
          status: 'success', 
          message: 'Conectado e funcionando',
          data: result,
          duration 
        })
      } else {
        updateTest('OpenAI Service', { 
          status: 'error', 
          message: result.error || 'Erro desconhecido',
          duration 
        })
      }
    } catch (error) {
      updateTest('OpenAI Service', { 
        status: 'error', 
        message: `Erro de conexão: ${error}`,
        duration: Date.now() - start
      })
    }
  }

  const testDNAParser = async () => {
    updateTest('DNA Parser', { status: 'running' })
    const start = Date.now()
    
    try {
      const response = await fetch('/api/test/dna-parser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'mock-data' })
      })
      
      const result = await response.json()
      const duration = Date.now() - start
      
      if (response.ok && result.success) {
        updateTest('DNA Parser', { 
          status: 'success', 
          message: `Processou ${result.data.ancestry?.length || 0} regiões`,
          data: result,
          duration 
        })
      } else {
        updateTest('DNA Parser', { 
          status: 'error', 
          message: result.error || 'Erro no parser',
          duration 
        })
      }
    } catch (error) {
      updateTest('DNA Parser', { 
        status: 'error', 
        message: `Erro: ${error}`,
        duration: Date.now() - start
      })
    }
  }

  const testContextManager = async () => {
    updateTest('Context Manager', { status: 'running' })
    const start = Date.now()
    
    try {
      const response = await fetch('/api/test/context-manager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'rate-limit' })
      })
      
      const result = await response.json()
      const duration = Date.now() - start
      
      if (response.ok && result.success) {
        updateTest('Context Manager', { 
          status: 'success', 
          message: `Rate limit OK: ${result.data.remainingMessages} restantes`,
          data: result,
          duration 
        })
      } else {
        updateTest('Context Manager', { 
          status: 'error', 
          message: result.error || 'Erro no context manager',
          duration 
        })
      }
    } catch (error) {
      updateTest('Context Manager', { 
        status: 'error', 
        message: `Erro: ${error}`,
        duration: Date.now() - start
      })
    }
  }

  const testIntelligentAgent = async () => {
    updateTest('Intelligent Agent', { status: 'running' })
    const start = Date.now()
    
    try {
      const response = await fetch('/api/test/intelligent-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          test: 'process-request',
          message: 'Quero planejar uma viagem para Portugal com orçamento de 5 mil reais'
        })
      })
      
      const result = await response.json()
      const duration = Date.now() - start
      
      if (response.ok && result.success) {
        updateTest('Intelligent Agent', { 
          status: 'success', 
          message: `Agente processou com sucesso`,
          data: result,
          duration 
        })
      } else {
        updateTest('Intelligent Agent', { 
          status: 'error', 
          message: result.error || 'Erro no agente',
          duration 
        })
      }
    } catch (error) {
      updateTest('Intelligent Agent', { 
        status: 'error', 
        message: `Erro: ${error}`,
        duration: Date.now() - start
      })
    }
  }

  const testAPIChat = async () => {
    updateTest('API Chat', { status: 'running' })
    const start = Date.now()
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: 'Teste da API de chat',
          sessionId: 'test_session_' + Date.now(),
          useStreaming: false
        })
      })
      
      const result = await response.json()
      const duration = Date.now() - start
      
      if (response.ok && result.success) {
        updateTest('API Chat', { 
          status: 'success', 
          message: `API respondeu: ${result.content?.slice(0, 50)}...`,
          data: result,
          duration 
        })
      } else {
        updateTest('API Chat', { 
          status: 'error', 
          message: result.error || 'Erro na API chat',
          duration 
        })
      }
    } catch (error) {
      updateTest('API Chat', { 
        status: 'error', 
        message: `Erro: ${error}`,
        duration: Date.now() - start
      })
    }
  }

  const testAPIProcessDNA = async () => {
    updateTest('API Process DNA', { status: 'running' })
    const start = Date.now()
    
    try {
      // Criar um mock de arquivo PDF para teste
      const mockFile = new File(['%PDF-1.4 Mock file'], 'genera_test.pdf', { 
        type: 'application/pdf' 
      })
      
      const formData = new FormData()
      formData.append('file', mockFile)
      formData.append('sessionId', 'test_session_' + Date.now())
      
      const response = await fetch('/api/process-dna', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      const duration = Date.now() - start
      
      if (response.ok && result.success) {
        updateTest('API Process DNA', { 
          status: 'success', 
          message: `DNA processado: ${result.data.ancestry?.length || 0} regiões`,
          data: result,
          duration 
        })
      } else {
        updateTest('API Process DNA', { 
          status: 'error', 
          message: result.error || 'Erro na API DNA',
          duration 
        })
      }
    } catch (error) {
      updateTest('API Process DNA', { 
        status: 'error', 
        message: `Erro: ${error}`,
        duration: Date.now() - start
      })
    }
  }

  const runAllTests = async () => {
    // Reset all tests
    setTests(prev => prev.map(test => ({ ...test, status: 'idle' as const })))
    
    // Run tests sequentially with delay
    await testOpenAIService()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await testDNAParser()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await testContextManager()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await testIntelligentAgent()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await testAPIChat()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await testAPIProcessDNA()
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'idle': return 'bg-gray-100 text-gray-600'
      case 'running': return 'bg-blue-100 text-blue-600'
      case 'success': return 'bg-green-100 text-green-600'
      case 'error': return 'bg-red-100 text-red-600'
    }
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'idle': return '⏸️'
      case 'running': return '🔄'
      case 'success': return '✅'
      case 'error': return '❌'
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>
        🧪 Página de Testes - Ancestral Travel
      </h1>
      
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <button
          onClick={runAllTests}
          style={{
            backgroundColor: '#3B82F6',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          🚀 Executar Todos os Testes
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
        {tests.map((test, index) => (
          <div
            key={test.name}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px',
              backgroundColor: 'white',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0' }}>
                {test.name}
              </h3>
              <span style={{ fontSize: '1.5rem' }}>
                {getStatusIcon(test.status)}
              </span>
            </div>

            <div
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                marginBottom: '15px',
                fontSize: '14px',
                fontWeight: '500'
              }}
              className={getStatusColor(test.status)}
            >
              Status: {test.status.toUpperCase()}
              {test.duration && ` (${test.duration}ms)`}
            </div>

            {test.message && (
              <div style={{ 
                padding: '10px', 
                backgroundColor: '#f8fafc', 
                borderRadius: '6px', 
                fontSize: '14px',
                marginBottom: '15px',
                border: '1px solid #e2e8f0'
              }}>
                <strong>Resultado:</strong> {test.message}
              </div>
            )}

            {test.data && (
              <details style={{ marginBottom: '15px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                  📊 Ver dados detalhados
                </summary>
                <pre style={{
                  fontSize: '12px',
                  backgroundColor: '#1f2937',
                  color: '#f9fafb',
                  padding: '10px',
                  borderRadius: '6px',
                  overflow: 'auto',
                  maxHeight: '200px',
                  marginTop: '10px'
                }}>
                  {JSON.stringify(test.data, null, 2)}
                </pre>
              </details>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  if (index === 0) testOpenAIService()
                  else if (index === 1) testDNAParser()
                  else if (index === 2) testContextManager()
                  else if (index === 3) testIntelligentAgent()
                  else if (index === 4) testAPIChat()
                  else if (index === 5) testAPIProcessDNA()
                }}
                disabled={test.status === 'running'}
                style={{
                  backgroundColor: test.status === 'running' ? '#9CA3AF' : '#10B981',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '14px',
                  cursor: test.status === 'running' ? 'not-allowed' : 'pointer',
                  opacity: test.status === 'running' ? 0.6 : 1
                }}
              >
                {test.status === 'running' ? '⏳ Testando...' : '🧪 Testar Individual'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        backgroundColor: '#f0f9ff', 
        borderRadius: '12px',
        border: '1px solid #0ea5e9'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '10px' }}>
          ℹ️ Como usar esta página
        </h2>
        <ul style={{ paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6' }}>
          <li><strong>Executar Todos:</strong> Roda todos os testes em sequência</li>
          <li><strong>Teste Individual:</strong> Testa apenas um componente específico</li>
          <li><strong>Ver dados detalhados:</strong> Mostra o JSON completo da resposta</li>
          <li><strong>Status:</strong> Verde = sucesso, Vermelho = erro, Azul = executando</li>
        </ul>
      </div>
    </div>
  )
}
