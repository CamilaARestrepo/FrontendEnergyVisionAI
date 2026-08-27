import { useState } from 'react';
import { toast } from 'sonner';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../../services/settings.service';
import type { ProviderSettings } from '../../types/settings.types';
import {
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  FlaskConical,
  Loader2,
  Save,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface FormProps {
  provider: ProviderSettings;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProviderForm({ provider, onSuccess, onCancel }: FormProps) {
  const queryClient = useQueryClient();
  const [model, setModel] = useState(provider.available_models[0]);
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    msg: string;
    ms?: number;
  } | null>(null);

  const isOllama = provider.name === 'ollama';

  const testMutation = useMutation({
    mutationFn: settingsService.testConnection,
    onSuccess: (data) => {
      setTestResult({
        success: data.success,
        msg: data.success ? 'Conexión exitosa' : data.error || 'Error desconocido',
        ms: data.latency_ms,
      });
    },
    onError: (err: any) => {
      setTestResult({
        success: false,
        msg: err?.response?.data?.detail || err.message,
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: settingsService.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Configuración guardada', {
        description: `${provider.display_name} · ${model} activado correctamente.`,
      });
      onSuccess();
    },
    onError: (err: any) => {
      toast.error('Error al guardar', {
        description: err?.response?.data?.detail || err.message,
      });
    },
  });


  const handleTest = () => {
    setTestResult(null);
    testMutation.mutate({
      provider_name: provider.name,
      model_name: model,
      api_key: apiKey,
      base_url: baseUrl,
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      provider_name: provider.name,
      model_name: model,
      api_key: apiKey,
      base_url: baseUrl,
    });
  };

  const isTesting = testMutation.status === 'pending';
  const isSaving = saveMutation.status === 'pending';
  const disableSave =
    (!isOllama && !apiKey && !provider.has_api_key) || isSaving;

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-5 w-full animate-in px-1">

      {/* Back button */}
      <button
        type="button"
        onClick={onCancel}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ChevronLeft size={14} />
        Volver a proveedores
      </button>

      <Separator className="opacity-30" />

      {/* Model Selection */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Modelo Deseado
        </Label>
        <Select value={model} onValueChange={(val) => val && setModel(val)}>
          <SelectTrigger className="h-10 bg-background border-border/60 focus:border-primary/50">
            <SelectValue placeholder="Selecciona un modelo" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border/60">
            {provider.available_models.map((m) => (
              <SelectItem key={m} value={m} className="text-sm">
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* API Key */}
      {!isOllama && (
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-baseline gap-2">
            API Key
            {provider.has_api_key && (
              <span className="text-[10px] text-muted-foreground/60 font-normal normal-case tracking-normal">
                (Clave cifrada existente — déjala vacía para reusar)
              </span>
            )}
          </Label>
          <div className="relative">
            <Input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="pr-10 h-10 bg-background border-border/60 focus:border-primary/50 font-mono text-sm"
              required={!provider.has_api_key}
            />
            <button
              type="button"
              onClick={() => setShowKey((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground outline-none transition-colors"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      )}

      {/* Base URL (Ollama) */}
      {(isOllama || baseUrl) && (
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Base URL
          </Label>
          <Input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="http://localhost:11434/v1"
            className="h-10 bg-background border-border/60 focus:border-primary/50 font-mono text-sm"
            required={isOllama}
          />
        </div>
      )}

      {/* Test Result */}
      {testResult && (
        <div
          className={`flex items-start gap-3 p-4 rounded-xl border text-sm animate-in ${
            testResult.success
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
              : 'bg-red-500/10 border-red-500/25 text-red-400'
          }`}
        >
          {testResult.success ? (
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          ) : (
            <XCircle size={16} className="mt-0.5 shrink-0" />
          )}
          <div>
            <p className="font-semibold">{testResult.msg}</p>
            {testResult.ms && (
              <p className="text-xs opacity-70 mt-0.5">Latencia: {testResult.ms}ms</p>
            )}
          </div>
        </div>
      )}

      <Separator className="opacity-30" />

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isSaving || isTesting}
          className="text-muted-foreground hover:text-foreground"
        >
          Cancelar
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleTest}
          disabled={disableSave || isTesting}
          className="gap-2 border-border/60 hover:border-primary/40 hover:text-primary"
        >
          {isTesting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <FlaskConical size={14} />
          )}
          Testear
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={disableSave}
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
        >
          {isSaving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          Guardar & Activar
        </Button>
      </div>
    </form>
  );
}
