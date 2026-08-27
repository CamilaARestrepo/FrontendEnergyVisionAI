/**
 * SettingsPage — Página dedicada de configuración del proveedor de IA.
 *
 * Ruta: /settings
 *
 * Muestra:
 * - Grid de tarjetas por proveedor (identico al modal pero en página completa)
 * - Formulario de configuración expandido al seleccionar un proveedor
 * - Sección de diagnósticos del sistema
 */

import { useState } from 'react';
import { Settings2, Zap, Server, BrainCircuit, GlobeLock, Cpu, Activity, Database } from 'lucide-react';

import { useSettings } from '@/hooks/useSettings';
import ProviderCard from '@/components/settings/ProviderCard';
import ProviderForm from '@/components/settings/ProviderForm';
import type { ProviderSettings } from '@/types/settings.types';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const iconMap: Record<string, any> = {
  openai: GlobeLock,
  anthropic: BrainCircuit,
  gemini: Cpu,
  ollama: Server,
};

const providerColors: Record<string, string> = {
  openai: 'text-emerald-400',
  anthropic: 'text-orange-400',
  gemini: 'text-blue-400',
  ollama: 'text-zinc-400',
};

export default function SettingsPage() {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const { data: settings, isLoading, refetch } = useSettings();

  const currentProviderData = settings?.providers.find(
    (p) => p.name === selectedProvider
  );

  const activeProvider = settings?.providers.find(
    (p) => p.name === settings.active_provider
  );

  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="gradient-brand text-white p-3 rounded-xl shadow-lg glow-green-sm flex items-center justify-center">
              <Settings2 size={22} />
            </div>
            <div className="absolute inset-0 gradient-brand rounded-xl blur-md opacity-40 -z-10" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Configuración IA
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Gestiona y prueba los proveedores de inteligencia artificial
            </p>
          </div>
        </div>

        {/* Active provider badge */}
        {activeProvider && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border/60">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-foreground">
              {activeProvider.display_name}
            </span>
            <span className="text-xs text-muted-foreground">
              · {settings?.active_model}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Left: Provider Selection/Form */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Motores disponibles
            </p>
            {selectedProvider && (
              <button
                onClick={() => setSelectedProvider(null)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Volver a lista
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-5 rounded-xl border border-border/40 flex flex-col gap-4">
                  <Skeleton className="h-10 w-10 rounded-xl bg-muted/40" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-muted/40" />
                    <Skeleton className="h-3 w-16 bg-muted/30" />
                  </div>
                  <Skeleton className="h-3 w-28 bg-muted/20" />
                </div>
              ))}
            </div>
          ) : currentProviderData ? (
            <div className="bg-card rounded-xl border border-border/60 p-6">
              <ProviderForm
                provider={currentProviderData}
                onSuccess={() => {
                  setSelectedProvider(null);
                  refetch();
                }}
                onCancel={() => setSelectedProvider(null)}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {settings?.providers.map((p: ProviderSettings) => (
                <ProviderCard
                  key={p.name}
                  provider={p}
                  icon={iconMap[p.name] || Cpu}
                  onClick={() => setSelectedProvider(p.name)}
                  isActive={settings.active_provider === p.name}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: System Diagnostics */}
        <div className="flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Estado del sistema
          </p>

          {/* Pipeline info */}
          <Card className="bg-card border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Zap size={14} className="text-primary" />
                Pipeline LangGraph
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {[
                'validate_image_node',
                'detection_node',
                'waste_node',
                'energy_node',
                'enrichment_node',
                'persist_node',
              ].map((node) => (
                <div key={node} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
                  <span className="text-xs font-mono text-muted-foreground">{node}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Configured providers summary */}
          <Card className="bg-card border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity size={14} className="text-primary" />
                Proveedores
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5">
              {settings?.providers.map((p) => {
                const colorClass = providerColors[p.name] || 'text-zinc-400';
                return (
                  <div key={p.name} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{p.display_name}</span>
                    <Badge
                      variant={p.is_configured ? 'outline' : 'secondary'}
                      className={`text-[10px] h-5 px-2 ${p.is_configured ? `border-current ${colorClass}` : ''}`}
                    >
                      {p.is_configured ? 'Listo' : 'Sin configurar'}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Version info */}
          <Card className="bg-card border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Database size={14} className="text-primary" />
                Versión
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Backend</span>
                <span className="font-mono">v1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>LangGraph</span>
                <span className="font-mono">0.2.x</span>
              </div>
              <div className="flex justify-between">
                <span>SQLite / SQLAlchemy</span>
                <span className="font-mono">2.0+</span>
              </div>
              <Separator className="my-1 opacity-30" />
              <div className="flex justify-between">
                <span>Fernet enc.</span>
                <Badge variant="outline" className="text-[10px] h-5 px-2 border-primary/40 text-primary">
                  Activo
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Validación magic bytes</span>
                <Badge variant="outline" className="text-[10px] h-5 px-2 border-primary/40 text-primary">
                  Activo
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
