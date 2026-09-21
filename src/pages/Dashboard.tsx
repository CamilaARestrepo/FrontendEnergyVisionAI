/**
 * Dashboard — Página principal del Scanner Multimodal.
 *
 * Flujo:
 * 1. Usuario sube imagen o captura con cámara
 * 2. Botón "Iniciar Profiling" envía al pipeline LangGraph
 * 3. Los resultados se muestran inline via ScanResultsPanel
 * 4. Notificaciones vía Sonner (sin alert() ni console.error())
 */

import { useEffect } from 'react';
import { toast } from 'sonner';
import { useScanStore } from '@/store/scan.store';
import { useScan } from '@/hooks/useScan';
import ImageUploader from '@/components/dashboard/ImageUploader';
import ScanResultsPanel from '@/components/dashboard/ScanResultsPanel';
import { Leaf, ScanSearch, Zap, Recycle, Activity, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';


const stats = [
  {
    icon: Zap,
    label: 'Clasificación IA',
    value: 'Multimodal',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: Recycle,
    label: 'Norma aplicada',
    value: 'LER Europeo',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
  },
  {
    icon: Activity,
    label: 'Pipeline',
    value: 'LangGraph',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
  },
];

export default function Dashboard() {
  const { currentFile, lastResult, clearScan } = useScanStore();


  const { scan, isPending } = useScan({
    onSuccess: (data) => {
      const name = data.object.object_name;
      const score = data.energy?.energy_score ?? data.object.energy_data?.energy_score;
      toast.success('Análisis completado', {
        description: `${name} · Energy Score: ${score ?? '—'}/100`,
        duration: 5000,
      });
    },
    onError: (error: any) => {
      const detail = error?.response?.data?.detail || error.message || 'Error desconocido';
      toast.error('Error en el Scanner', {
        description: detail,
        duration: 6000,
      });
    },
  });

  const handleScanTrigger = () => {
    if (currentFile && !isPending) {
      scan(currentFile);
    }
  };

  const handleNewScan = () => {
    clearScan();
  };

  // Cleanup al desmontar
  useEffect(() => {
    return () => {};
  }, []);

  return (
    <div className="flex flex-col gap-8 min-h-full pb-10">

      {/* Hero Section */}
      <div className="animate-in stagger-1">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-primary/15 rounded-lg">
            <Leaf size={18} className="text-primary" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Detección Inteligente
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 leading-tight">
          Scanner{' '}
          <span className="text-gradient-brand">Multimodal</span>
        </h1>
        <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
          Diagnóstico LER automatizado. Nuestro pipeline clasifica material para extraer su
          máximo valor circular y calórico mediante IA multimodal.
        </p>

        {/* Quick stats strip */}
        <div className="flex items-center gap-4 mt-5 flex-wrap">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex items-center gap-2 text-xs">
                <div className={`p-1.5 rounded-md ${s.bg}`}>
                  <Icon size={13} className={s.color} />
                </div>
                <div>
                  <p className="text-muted-foreground">{s.label}</p>
                  <p className={`font-semibold ${s.color}`}>{s.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Separator className="opacity-30" />

      {/* Main Content: Uploader + Placeholder/Result */}
      {!lastResult ? (
        <div className="flex flex-col md:flex-row gap-6 w-full animate-in stagger-2">
          {/* Left: Uploader */}
          <div className="flex-1 shrink-0 flex flex-col gap-4">
            <ImageUploader />

            {currentFile && !isPending && (
              <div className="flex justify-end">
                <Button
                  id="btn-start-scan"
                  onClick={handleScanTrigger}
                  className="flex items-center gap-2 group bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg glow-green transition-all duration-300"
                >
                  <ScanSearch
                    size={18}
                    className="group-hover:rotate-12 transition-transform duration-200"
                  />
                  Iniciar Scanner Ecológico
                </Button>
              </div>
            )}

            {isPending && (
              <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm text-primary font-medium">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                Analizando con LangGraph pipeline...
              </div>
            )}
          </div>

          {/* Right: Empty state */}
          <div className="flex-1 hidden md:flex items-center justify-center p-8 rounded-2xl border border-border bg-card/40 animate-in stagger-3">
            <div className="text-center max-w-xs">
              <div className="w-16 h-16 bg-muted rounded-2xl mx-auto flex items-center justify-center mb-4 animate-float">
                <ScanSearch className="text-muted-foreground/50" size={28} />
              </div>
              <h3 className="font-semibold text-muted-foreground text-base mb-2">
                Ingresa tu muestra visual
              </h3>
              <p className="text-muted-foreground/60 text-xs leading-relaxed">
                La matriz de resultados desglosará métricas térmicas, códigos regulatorios LER
                e índice de confianza del LangGraph.
              </p>

              {/* Decorative dots */}
              <div className="flex justify-center gap-1.5 mt-6">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-primary/30 animate-pulse"
                    style={{ animationDelay: `${i * 200}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Results Panel */}
      {lastResult && (
        <div className="w-full animate-in stagger-1">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 flex-1">
              <Separator className="opacity-30" />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                Resultados del Análisis
              </span>
              <Separator className="opacity-30" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNewScan}
              className="ml-4 gap-2 text-xs text-muted-foreground hover:text-foreground shrink-0"
            >
              <RotateCcw size={13} />
              Nuevo scan
            </Button>
          </div>
          <ScanResultsPanel data={lastResult} />
        </div>
      )}
    </div>
  );
}
