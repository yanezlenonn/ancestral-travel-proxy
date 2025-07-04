'use client';

import { useState } from 'react';
import { 
  Dna, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  ToggleLeft, 
  ToggleRight,
  X,
  FileText,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DNAData {
  id: string;
  fileName: string;
  uploadDate: Date;
  ancestries: Array<{
    region: string;
    percentage: number;
    countries: string[];
  }>;
  totalRegions: number;
  primaryAncestry: string;
}

interface DNAStatusBannerProps {
  dnaData?: DNAData;
  currentMode: 'dna' | 'traditional';
  onModeChange: (mode: 'dna' | 'traditional') => void;
  onUploadClick: () => void;
  onDismiss?: () => void;
  className?: string;
}

export default function DNAStatusBanner({
  dnaData,
  currentMode,
  onModeChange,
  onUploadClick,
  onDismiss,
  className = ''
}: DNAStatusBannerProps) {
  const [showDetails, setShowDetails] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getTopAncestries = (ancestries: DNAData['ancestries'], limit: number = 3) => {
    return ancestries
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, limit);
  };

  // Banner quando não há DNA
  if (!dnaData) {
    return (
      <Card className={`border-blue-200 bg-blue-50 ${className}`}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Dna className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-blue-900">
                  Descubra suas origens ancestrais
                </h3>
                <p className="text-sm text-blue-700">
                  Faça upload do seu teste de DNA para roteiros personalizados
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={onUploadClick}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Fazer Upload
              </Button>
              {onDismiss && (
                <Button
                  onClick={onDismiss}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Supported Formats */}
          <div className="mt-3 pt-3 border-t border-blue-200">
            <p className="text-xs text-blue-600 mb-1">Formatos suportados:</p>
            <div className="flex flex-wrap gap-1">
              {['23andMe', 'MyHeritage', 'Genera', 'AncestryDNA'].map((format) => (
                <Badge key={format} variant="outline" className="text-xs bg-white">
                  {format}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>
  }
  }

  // Banner quando há DNA
  return (
    <Card className={`border-green-200 bg-green-50 ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-green-900">
                DNA Analisado com Sucesso
              </h3>
              <p className="text-sm text-green-700">
                {dnaData.totalRegions} regiões identificadas • Upload: {formatDate(dnaData.uploadDate)}
              </p>
            </div>
          </div>
          
          {/* Mode Toggle */}
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => onModeChange(currentMode === 'dna' ? 'traditional' : 'dna')}
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2 bg-white hover:bg-gray-50"
                  >
                    {currentMode === 'dna' ? (
                      <>
                        <ToggleRight className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Modo DNA</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">Modo Tradicional</span>
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {currentMode === 'dna' 
                      ? 'Clique para mudar para planejamento tradicional'
                      : 'Clique para usar dados do DNA no planejamento'
                    }
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {onDismiss && (
              <Button
                onClick={onDismiss}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-green-600 hover:bg-green-100"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* DNA Summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Primary Ancestry */}
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                {dnaData.primaryAncestry}
              </span>
              <Badge variant="outline" className="text-xs bg-white">
                Principal
              </Badge>
            </div>
            
            {/* File Info */}
            <div className="flex items-center space-x-2 text-xs text-green-700">
              <FileText className="h-3 w-3" />
              <span>{dnaData.fileName}</span>
            </div>
          </div>
          
          {/* Toggle Details */}
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="ghost"
            size="sm"
            className="text-green-700 hover:bg-green-100"
          >
            {showDetails ? 'Ocultar detalhes' : 'Ver detalhes'}
          </Button>
        </div>

        {/* Expanded Details */}
        {showDetails && (
          <div className="mt-4 pt-3 border-t border-green-200">
            <h4 className="text-sm font-medium text-green-900 mb-3">
              Suas principais ancestralidades:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {getTopAncestries(dnaData.ancestries).map((ancestry, index) => (
                <div
                  key={ancestry.region}
                  className="bg-white rounded-lg p-3 border border-green-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-sm text-gray-800">
                      {ancestry.region}
                    </h5>
                    <Badge variant="secondary" className="text-xs">
                      {ancestry.percentage.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    {ancestry.countries.slice(0, 3).map((country) => (
                      <div key={country} className="text-xs text-gray-600">
                        • {country}
                      </div>
                    ))}
                    {ancestry.countries.length > 3 && (
                      <div className="text-xs text-gray-500 italic">
                        +{ancestry.countries.length - 3} outros países
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Additional Stats */}
            <div className="mt-4 pt-3 border-t border-green-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-green-800">
                    {dnaData.totalRegions}
                  </div>
                  <div className="text-xs text-green-600">
                    Regiões
                  </div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-green-800">
                    {dnaData.ancestries.reduce((sum, a) => sum + a.countries.length, 0)}
                  </div>
                  <div className="text-xs text-green-600">
                    Países
                  </div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-green-800">
                    {dnaData.ancestries[0]?.percentage.toFixed(1)}%
                  </div>
                  <div className="text-xs text-green-600">
                    Maior %
                  </div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-green-800">
                    {Math.round(dnaData.ancestries.reduce((sum, a) => sum + a.percentage, 0))}%
                  </div>
                  <div className="text-xs text-green-600">
                    Total
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-4 flex items-center justify-between">
              <Button
                onClick={onUploadClick}
                variant="outline"
                size="sm"
                className="text-green-700 border-green-300 hover:bg-green-100"
              >
                <Upload className="h-4 w-4 mr-2" />
                Novo Upload
              </Button>
              
              {currentMode !== 'dna' && (
                <Alert className="flex-1 ml-4 border-amber-200 bg-amber-50">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800 text-xs">
                    Ative o modo DNA para roteiros baseados em ancestralidade
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
