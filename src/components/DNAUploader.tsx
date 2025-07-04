'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Upload, 
  File, 
  CheckCircle, 
  AlertCircle, 
  X, 
  DNA,
  Shield,
  Eye,
  Download
} from 'lucide-react';

interface DNAUploaderProps {
  onUploadComplete?: (data: any) => void;
  onClose?: () => void;
}

export const DNAUploader: React.FC<DNAUploaderProps> = ({
  onUploadComplete,
  onClose,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<'upload' | 'processing' | 'results'>('upload');
  const [results, setResults] = useState<any>(null);

  const supportedProviders = [
    { name: '23andMe', logo: '🧬', format: 'txt/zip' },
    { name: 'MyHeritage', logo: '🌳', format: 'csv' },
    { name: 'AncestryDNA', logo: '📜', format: 'txt' },
    { name: 'Family Tree DNA', logo: '🔬', format: 'csv' },
    { name: 'Living DNA', logo: '🎯', format: 'txt' },
  ];

  const mockResults = {
    regions: [
      { region: 'Toscana', country: 'Itália', percentage: 35, confidence: 'high' },
      { region: 'Norte', country: 'Portugal', percentage: 28, confidence: 'high' },
      { region: 'Baviera', country: 'Alemanha', percentage: 22, confidence: 'medium' },
      { region: 'Andaluzia', country: 'Espanha', percentage: 15, confidence: 'medium' },
    ],
    total_regions: 4,
    confidence_score: 89,
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const validateFile = (file: File): boolean => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'text/plain',
      'text/csv',
      'application/zip',
      'application/x-zip-compressed',
    ];

    if (file.size > maxSize) {
      alert('Arquivo muito grande. Máximo 10MB.');
      return false;
    }

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(txt|csv|zip)$/i)) {
      alert('Formato não suportado. Use .txt, .csv ou .zip');
      return false;
    }

    return true;
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setStep('processing');

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setStep('results');
            setResults(mockResults);
            setUploading(false);
          }, 1000);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleConfirm = () => {
    onUploadComplete?.(results);
    onClose?.();
  };

  if (step === 'processing') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <DNA className="w-8 h-8 text-white animate-spin" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Analisando seu DNA
            </h3>
            <p className="text-gray-600 mb-6">
              Identificando suas origens ancestrais...
            </p>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div
                className="bg-gradient-primary h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <p className="text-sm text-gray-500">
              {progress}% concluído
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'results') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                  <DNA className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>Análise Concluída!</CardTitle>
                  <CardDescription>
                    Suas origens ancestrais foram identificadas
                  </CardDescription>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Confidence Score */}
            <div className="text-center p-6 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {results.confidence_score}%
              </div>
              <p className="text-gray-600">
                Nível de Confiança da Análise
              </p>
            </div>

            {/* Regions */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Suas Origens Ancestrais
              </h4>
              <div className="space-y-3">
                {results.regions.map((region: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {region.country === 'Itália' ? '🇮🇹' :
                         region.country === 'Portugal' ? '🇵🇹' :
                         region.country === 'Alemanha' ? '🇩🇪' : '🇪🇸'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {region.region}, {region.country}
                        </p>
                        <Badge 
                          variant={region.confidence === 'high' ? 'success' : 'warning'}
                          size="sm"
                        >
                          {region.confidence === 'high' ? 'Alta confiança' : 'Média confiança'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary-600">
                        {region.percentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps */}
            <div className="p-6 bg-gradient-primary text-white rounded-xl">
              <h4 className="text-lg font-semibold mb-2">
                Próximo Passo
              </h4>
              <p className="text-primary-100 mb-4">
                Agora você pode criar roteiros personalizados baseados na sua ancestralidade!
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="secondary"
                  onClick={handleConfirm}
                  className="bg-white text-primary-500 hover:bg-gray-50"
                >
                  Criar Roteiro DNA
                </Button>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                >
                  Ver Detalhes Completos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <DNA className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>Upload do Teste de DNA</CardTitle>
                <CardDescription>
                  Faça upload do seu arquivo para criar roteiros ancestrais
                </CardDescription>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Security Notice */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900 mb-1">
                  100% Seguro e Privado
                </h4>
                <p className="text-sm text-green-700">
                  Seus dados são criptografados e nunca compartilhados. 
                  Você pode deletar a qualquer momento.
                </p>
              </div>
            </div>
          </div>

          {/* Supported Providers */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              Formatos Suportados
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {supportedProviders.map((provider, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <span className="text-lg">{provider.logo}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {provider.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {provider.format}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
              dragActive
                ? 'border-primary-500 bg-primary-50'
                : file
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              type="file"
              accept=".txt,.csv,.zip"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            {file ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-2">
                    Arquivo Selecionado
                  </p>
                  <div className="inline-flex items-center space-x-2 bg-white rounded-lg p-3 border">
                    <File className="w-5 h-5 text-gray-500" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    Arraste seu arquivo aqui
                  </p>
                  <p className="text-gray-600 mb-4">
                    ou clique para selecionar
                  </p>
                  <p className="text-sm text-gray-500">
                    Formatos: .txt, .csv, .zip • Máximo: 10MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* How to Download */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Download className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">
                  Como baixar seus dados?
                </h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>23andMe:</strong> Conta → Baixar Dados → Dados Brutos</p>
                  <p><strong>MyHeritage:</strong> Configurações → Baixar DNA → CSV</p>
                  <p><strong>AncestryDNA:</strong> Configurações → Baixar Dados → DNA</p>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Options */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Privacidade</h4>
            <div className="space-y-3">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mt-1 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Aceito os termos de uso
                  </p>
                  <p className="text-xs text-gray-500">
                    Seus dados são processados apenas para criar roteiros e nunca compartilhados
                  </p>
                </div>
              </label>

              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  className="mt-1 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Salvar dados para futuras consultas
                  </p>
                  <p className="text-xs text-gray-500">
                    Manter seus dados para não precisar fazer upload novamente
                  </p>
                </div>
              </label>

              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  className="mt-1 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Receber insights sobre minhas origens
                  </p>
                  <p className="text-xs text-gray-500">
                    Emails ocasionais com informações culturais das suas regiões ancestrais
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              loading={uploading}
              className="flex-1"
              icon={<DNA className="w-4 h-4" />}
            >
              {uploading ? 'Analisando...' : 'Analisar DNA'}
            </Button>
            
            <Button
              variant="secondary"
              onClick={onClose}
              className="sm:w-auto"
            >
              Cancelar
            </Button>
          </div>

          {/* Help Link */}
          <div className="text-center pt-4 border-t border-gray-100">
            <button className="flex items-center space-x-2 text-sm text-primary-500 hover:text-primary-600 mx-auto">
              <Eye className="w-4 h-4" />
              <span>Precisa de ajuda? Ver tutorial completo</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DNAUploader;
