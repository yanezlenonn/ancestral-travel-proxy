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
  return (
    <div style={{ padding: '20px' }}>
      <h1>🧪 Teste Básico</h1>
      <p>Se você vê esta página, funcionou!</p>
    </div>
  )
}
