/**
 * AnalyzeResidueModal — Modal para adjuntar la imagen del residuo y lanzar el análisis.
 */

import { AlertTriangle, BatteryCharging, Loader2, Recycle, ScanSearch } from 'lucide-react';
import { useScanStore } from '@/store/scan.store';
import ImageUploader from './ImageUploader';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AnalyzeResidueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAnalyze: () => void;
  isPending: boolean;
}

const hints = [
  { icon: Recycle, label: 'Código LER', color: 'text-emerald-400' },
  { icon: BatteryCharging, label: 'Potencial energético', color: 'text-amber-400' },
  { icon: AlertTriangle, label: 'Gestión y peligrosidad', color: 'text-red-400' },
];

export default function AnalyzeResidueModal({
  open,
  onOpenChange,
  onAnalyze,
  isPending,
}: AnalyzeResidueModalProps) {
  const { currentFile } = useScanStore();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl border-border/60 bg-card shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/15 rounded-xl shrink-0">
              <Recycle size={18} className="text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Analizar residuo
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Adjunta una foto clara del residuo. La IA detectará el material, su código
                LER y el potencial energético.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {hints.map((hint) => {
            const Icon = hint.icon;
            return (
              <span
                key={hint.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/20 px-2.5 py-1 text-[11px] text-muted-foreground"
              >
                <Icon size={11} className={hint.color} />
                {hint.label}
              </span>
            );
          })}
        </div>

        <ImageUploader />

        <Button
          onClick={onAnalyze}
          disabled={!currentFile || isPending}
          className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg glow-green"
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Analizando residuo...
            </>
          ) : (
            <>
              <ScanSearch size={16} />
              Analizar residuo
            </>
          )}
        </Button>

        <p className="text-[11px] text-center text-muted-foreground">
          Formatos admitidos: JPG, PNG y WEBP · Máximo 10 MB
        </p>
      </DialogContent>
    </Dialog>
  );
}
