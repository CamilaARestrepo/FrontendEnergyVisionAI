/**
 * ObjectDetailModal — Layout vertical uniforme, max-w-2xl.
 *
 * Estructura:
 *  ┌─────────────────────────────────────────────────────┐
 *  │  [IMG 80x80]  Nombre objeto                         │
 *  │               Descripción...                         │
 *  │               [badge AI]  [fecha]  [ID]             │
 *  ├─────────────────────────────────────────────────────┤
 *  │  Materia Base                                        │
 *  │  [Objeto] [Material] [Marca] [Condición]            │
 *  │  Confianza IA ████████████████ 99%                  │
 *  ├──────────────────────┬──────────────────────────────┤
 *  │  Protocolo LER       │  Potencial Energético         │
 *  │  Categoría · Nivel   │  95 / 100                    │
 *  │  Código LER 150104   │  kWh/u 0.21 · kWh/kg 14.00  │
 *  │  Notas...            │  Métodos de valorización      │
 *  ├──────────────────────┴──────────────────────────────┤
 *  │  Sugerencias de reutilización                        │
 *  ├─────────────────────────────────────────────────────┤
 *  │  [!! Peligroso] (si aplica)                         │
 *  ├─────────────────────────────────────────────────────┤
 *  │  [🗑 Eliminar]   ⚡ EnergyVision...    [Cerrar]     │
 *  └─────────────────────────────────────────────────────┘
 */

import type { DetectedObject } from '../../types/object.types';
import { toast } from 'sonner';
import { useDeleteObject } from '@/hooks/useObjects';
import {
  AlertTriangle,
  BatteryCharging,
  Box,
  CheckCircle2,
  Cpu,
  Hash,
  Calendar,
  Layers,
  Lightbulb,
  Recycle,
  ShieldAlert,
  Trash2,
  Loader2,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const BACKEND_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') ||
  'http://localhost:8000';

interface Props {
  object: DetectedObject | null;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

/* ── helpers ──────────────────────────────────────────────── */
const hierarchyColor: Record<string, string> = {
  reutilización: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  reparación:   'bg-blue-500/15 text-blue-400 border-blue-500/30',
  reciclaje:    'bg-sky-500/15 text-sky-400 border-sky-500/30',
  valorización: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  disposición:  'bg-red-500/15 text-red-400 border-red-500/30',
};

const getHierarchyStyle = (level = '') => {
  const key = Object.keys(hierarchyColor).find((k) => level.toLowerCase().includes(k));
  return key ? hierarchyColor[key] : 'bg-muted text-muted-foreground border-border';
};

const getScoreColor = (s: number) =>
  s >= 70 ? 'text-emerald-400' : s >= 40 ? 'text-amber-400' : 'text-red-400';

const getScoreBar = (s: number) =>
  s >= 70 ? '[&>div]:bg-emerald-500' : s >= 40 ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500';

const getConfidence = (pct: number) =>
  pct >= 80
    ? { label: 'text-emerald-400', bar: '[&>div]:bg-emerald-500' }
    : pct >= 50
      ? { label: 'text-blue-400',    bar: '[&>div]:bg-blue-500' }
      : { label: 'text-amber-400',   bar: '[&>div]:bg-amber-500' };

function parseList(val?: string | string[]): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return [val]; }
}

/** Etiqueta de campo */
function FL({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
      {children}
    </p>
  );
}

/** Cabecera de sección */
function SH({
  icon: Icon,
  label,
  ibg,
  ic,
  aside,
}: {
  icon: React.ElementType;
  label: string;
  ibg: string;
  ic: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 ${ibg} ${ic} rounded-lg shrink-0`}>
          <Icon size={13} />
        </div>
        <span className="font-semibold text-foreground text-sm">{label}</span>
      </div>
      {aside}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
export default function ObjectDetailModal({ object: obj, open, onClose, onDeleted }: Props) {
  const { mutate: deleteObj, isPending: isDeleting } = useDeleteObject();

  if (!obj) return null;

  const energy      = obj.energy_data;
  const score       = energy?.energy_score ?? 0;
  const confPct     = Math.round((obj.confidence_score ?? 0) * 100);
  const methods     = parseList(energy?.valorization_methods);
  const suggestions = parseList(obj.reuse_suggestions);
  const conf        = getConfidence(confPct);

  const handleDelete = () => {
    deleteObj(obj.id, {
      onSuccess: () => {
        toast.success('Registro eliminado', {
          description: `"${obj.object_name}" fue eliminado del historial LER.`,
        });
        onDeleted();
        onClose();
      },
      onError: (err: any) => {
        toast.error('Error al eliminar', {
          description: err?.response?.data?.detail || err.message,
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      {/* max-w-2xl = 672px — ancho suficiente sin exceder viewports medianos */}
      <DialogContent className="w-full max-w-2xl border-border/60 bg-card shadow-2xl p-0 overflow-hidden gap-0">

        {/* ══════════════════════════════════════════════
            HEADER — Imagen + Nombre + Meta
        ══════════════════════════════════════════════ */}
        <div className="p-5 border-b border-border/40">
          <div className="flex gap-4">
            {/* Thumbnail cuadrado */}
            <div className="w-20 h-20 rounded-xl overflow-hidden border border-border/60 shrink-0 bg-muted/30">
              <img
                src={`${BACKEND_BASE}${obj.image_path}`}
                alt={obj.object_name}
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-1.5 mb-1">
                <CheckCircle2 size={14} className="text-primary shrink-0 mt-[2px]" />
                <DialogTitle className="text-base font-bold text-foreground capitalize leading-tight break-words">
                  {obj.object_name}
                </DialogTitle>
              </div>

              {obj.description && (
                <DialogDescription className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-2">
                  {obj.description}
                </DialogDescription>
              )}

              {/* Meta — cada item en su propia línea para que no desborde */}
              <div className="flex flex-col gap-1 mt-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge
                    variant="outline"
                    className="gap-1 text-primary border-primary/30 bg-primary/10 text-[10px] px-1.5 py-0.5 shrink-0 max-w-full"
                  >
                    <Cpu size={9} className="shrink-0" />
                    <span className="truncate">{obj.ai_provider} · {obj.ai_model}</span>
                  </Badge>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                    <Calendar size={9} />
                    {new Date(obj.created_at).toLocaleDateString('es-ES', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
                    <Hash size={9} />
                    ID {obj.id}
                  </span>
                  {energy?.energy_score != null && (
                    <span className={`text-[10px] font-bold ${getScoreColor(score)}`}>
                      E.Score {score}/100
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            BODY — Scroll sólo en el cuerpo
        ══════════════════════════════════════════════ */}
        <div className="overflow-y-auto max-h-[60vh]">

          {/* ── Materia Base ─────────────────────────── */}
          <div className="p-5 border-b border-border/30">
            <SH icon={Box} label="Materia Base" ibg="bg-blue-500/15" ic="text-blue-400" />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 mb-4">
              <div>
                <FL>Objeto</FL>
                <p className="text-sm text-foreground/85 capitalize font-medium leading-tight">
                  {obj.object_name}
                </p>
              </div>
              <div>
                <FL>Material</FL>
                <p className="text-sm text-foreground/85 capitalize">{obj.object_material || '—'}</p>
              </div>
              <div>
                <FL>Marca</FL>
                <p className="text-sm text-foreground/85 capitalize">{obj.object_brand || '—'}</p>
              </div>
              <div>
                <FL>Condición</FL>
                <p className="text-sm text-foreground/85 capitalize">{obj.object_condition || '—'}</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <FL>Confianza IA</FL>
                <span className={`text-xs font-bold ${conf.label}`}>{confPct}%</span>
              </div>
              <Progress value={confPct} className={`h-1.5 bg-muted ${conf.bar}`} />
            </div>
          </div>

          {/* ── LER + Energía en 2 columnas ─────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border/30 border-b border-border/30">

            {/* Protocolo LER */}
            <div className="p-5">
              <SH
                icon={Recycle}
                label="Protocolo LER"
                ibg="bg-emerald-500/15"
                ic="text-emerald-400"
                aside={
                  energy?.is_hazardous ? (
                    <Badge className="gap-1 bg-red-500/15 text-red-400 border-red-500/30 text-[10px] shrink-0">
                      <ShieldAlert size={9} />
                      Peligroso
                    </Badge>
                  ) : undefined
                }
              />

              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <FL>Categoría</FL>
                    <p className="text-sm text-foreground/85 capitalize">{obj.object_category || '—'}</p>
                  </div>
                  <div>
                    <FL>Nivel jerárquico</FL>
                    <Badge
                      className={`capitalize text-[10px] border mt-0.5 ${getHierarchyStyle(
                        energy?.waste_hierarchy_level,
                      )}`}
                    >
                      <Layers size={9} className="mr-1" />
                      {energy?.waste_hierarchy_level || 'N/D'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <FL>Código LER Europeo</FL>
                  {energy?.ler_code ? (
                    <code className="text-sm font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-md inline-block tracking-widest mt-0.5">
                      {energy.ler_code}
                    </code>
                  ) : (
                    <span className="text-sm text-muted-foreground/50">—</span>
                  )}
                </div>

                {energy?.processing_notes && (
                  <div>
                    <FL>Notas de tratamiento</FL>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {energy.processing_notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Potencial Energético */}
            <div className="p-5">
              <SH icon={BatteryCharging} label="Potencial Energético" ibg="bg-amber-500/15" ic="text-amber-400" />

              <div className="flex items-end gap-2 mb-2">
                <span className={`text-4xl font-black leading-none ${getScoreColor(score)}`}>
                  {score}
                </span>
                <div className="pb-0.5">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    / 100
                  </span>
                  <p className="text-[10px] text-muted-foreground">Energy Score</p>
                </div>
              </div>
              <Progress value={score} className={`h-1.5 bg-muted/50 mb-4 ${getScoreBar(score)}`} />

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="stat-card">
                  <FL>kWh / Unidad</FL>
                  <p className="text-lg font-bold text-foreground">
                    {energy?.kwh_per_unit?.toFixed(2) ?? '0.00'}
                  </p>
                </div>
                <div className="stat-card">
                  <FL>kWh / Kg</FL>
                  <p className="text-lg font-bold text-foreground">
                    {energy?.kwh_per_kg?.toFixed(2) ?? '0.00'}
                  </p>
                </div>
              </div>

              {methods.length > 0 && (
                <div>
                  <FL>Métodos de valorización</FL>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {methods.map((v, i) => (
                      <Badge
                        key={i}
                        className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/25 py-0.5 px-2 h-auto leading-tight"
                      >
                        {v}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Sugerencias de reutilización ─────────── */}
          {suggestions.length > 0 && (
            <div className="p-5 border-b border-border/30">
              <SH
                icon={Lightbulb}
                label="Sugerencias de reutilización"
                ibg="bg-primary/15"
                ic="text-primary"
              />
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── Aviso peligroso ───────────────────────── */}
          {energy?.is_hazardous && (
            <div className="p-5">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25">
                <AlertTriangle size={15} className="text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-400">Residuo Peligroso</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Requiere gestión especializada conforme a normativa LER. Contacta con gestor autorizado.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════════ */}
        <Separator className="opacity-40" />
        <div className="flex items-center justify-between px-5 py-3 bg-card/80">
          <AlertDialog>
            <AlertDialogTrigger
              disabled={isDeleting}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
              Eliminar
            </AlertDialogTrigger>
            <AlertDialogContent className="border-border/60 bg-card">
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar este registro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Se eliminará{' '}
                  <strong className="text-foreground capitalize">{obj.object_name}</strong>{' '}
                  permanentemente del historial LER.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                >
                  {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  Sí, eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground/50">
            <Zap size={11} className="text-primary" />
            EnergyVision · Pipeline LangGraph
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground text-xs hover:text-foreground"
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
