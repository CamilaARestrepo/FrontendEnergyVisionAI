/**
 * Dashboard — Página principal del Scanner Multimodal.
 *
 * Flujo:
 * 1. Usuario sube imagen o captura con cámara
 * 2. Botón "Iniciar Profiling" envía al pipeline LangGraph
 * 3. Los resultados se muestran inline via ScanResultsPanel
 * 4. Notificaciones vía Sonner (sin alert() ni console.error())
 */

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useScanStore } from '@/store/scan.store';
import { useScan } from '@/hooks/useScan';
import { OBJECTS_QUERY_KEY } from '@/hooks/useObjects';
import AnalyzeResidueModal from '@/components/dashboard/AnalyzeResidueModal';
import ScanResultsPanel from '@/components/dashboard/ScanResultsPanel';
import ResidueGuide from '@/components/dashboard/ResidueGuide';
import {
  BatteryCharging,
  Recycle,
  RotateCcw,
  ScanSearch,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { currentFile, lastResult, clearScan } = useScanStore();
  const queryClient = useQueryClient();
  const [analyzeOpen, setAnalyzeOpen] = useState(false);

  const { scan: scanImage, isPending } = useScan({
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [OBJECTS_QUERY_KEY] });
      setAnalyzeOpen(false);

      if (data.cached) {
        toast.info('Resultado desde la base de datos', {
          description: 'Esta imagen ya fue analizada. Se reutilizó el resultado guardado para ahorrar análisis IA.',
          duration: 5000,
        });
        return;
      }
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
      scanImage(currentFile);
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
    <div className="flex flex-col gap-5 pb-2">

      {/* Main Content: CTA informativa */}
      {!lastResult ? (
        <>
          <div className="w-full animate-in stagger-1">
            <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-5 sm:p-7">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-amber-500/10" />

              <div className="relative flex flex-col gap-5">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-primary/15 rounded-xl shrink-0">
                    <ScanSearch size={22} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-foreground">
                      Analiza tu residuo en segundos
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      Adjunta una foto clara y obtén su clasificación LER, el potencial
                      energético y cómo gestionarlo correctamente.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      icon: Recycle,
                      title: 'Código LER',
                      text: 'Catálogo europeo de residuos',
                      color: 'text-emerald-400',
                    },
                    {
                      icon: BatteryCharging,
                      title: 'Potencial energético',
                      text: 'kWh por unidad y por kg',
                      color: 'text-amber-400',
                    },
                    {
                      icon: ShieldAlert,
                      title: 'Gestión del residuo',
                      text: 'Reutilización, reciclaje y peligrosidad',
                      color: 'text-red-400',
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.title}
                        className="rounded-xl border border-border/50 bg-muted/15 p-3"
                      >
                        <div className="p-1.5 rounded-lg bg-muted/40 w-fit mb-1.5">
                          <Icon size={13} className={item.color} />
                        </div>
                        <p className="text-xs font-semibold text-foreground">{item.title}</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                          {item.text}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <Button
                    id="btn-start-scan"
                    onClick={() => setAnalyzeOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 group bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg glow-green transition-all duration-300"
                  >
                    <ScanSearch
                      size={18}
                      className="group-hover:rotate-12 transition-transform duration-200"
                    />
                    Analizar residuo
                  </Button>
                  <span className="text-[11px] text-muted-foreground text-center sm:text-left">
                    JPG, PNG o WEBP · Máx. 10 MB
                  </span>
                </div>

                {currentFile && !isPending && (
                  <p className="text-[11px] text-primary">
                    Archivo listo:{' '}
                    <span className="font-medium">{currentFile.name}</span>
                  </p>
                )}

                {isPending && !analyzeOpen && (
                  <div className="flex items-center gap-2 text-xs text-primary font-medium">
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                    Analizando residuo...
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}

      {/* Guía educativa sobre residuos — solo en vista inicial */}
      {!lastResult && <ResidueGuide />}

      {/* Results Panel */}
      {lastResult && (
        <div className="w-full animate-in stagger-1">
          <div className="flex justify-end mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNewScan}
              className="gap-2 text-xs text-muted-foreground hover:text-foreground shrink-0 border border-border/60 hover:border-primary/40"
            >
              <RotateCcw size={13} />
              Nuevo scan
            </Button>
          </div>
          <ScanResultsPanel data={lastResult} />
        </div>
      )}

      <AnalyzeResidueModal
        open={analyzeOpen}
        onOpenChange={setAnalyzeOpen}
        onAnalyze={handleScanTrigger}
        isPending={isPending}
      />
    </div>
  );
}
