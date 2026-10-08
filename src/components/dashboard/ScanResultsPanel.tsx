/**
 * ScanResultsPanel — Muestra los resultados completos de un análisis.
 *
 * Acepta datos del tipo ScanResponse (POST /scan) o DetectedObject (GET /objects/:id).
 * Los campos están adaptados al schema canónico que devuelve el backend:
 *   object.object_name, object.object_category, etc.
 */

import type { ScanResponse } from '../../types/scan.types';
import {
  AlertTriangle,
  BatteryCharging,
  Box,
  Cpu,
  Database,
  Recycle,
  CheckCircle2,
  ShieldAlert,
  Layers,
  Timer,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

interface ResultProps {
  data: ScanResponse;
}

const hierarchyColor: Record<string, string> = {
  reutilización: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  reparación:    'bg-blue-500/15 text-blue-400 border-blue-500/30',
  reciclaje:     'bg-sky-500/15 text-sky-400 border-sky-500/30',
  valorización:  'bg-amber-500/15 text-amber-400 border-amber-500/30',
  disposición:   'bg-red-500/15 text-red-400 border-red-500/30',
};

const getHierarchyStyle = (level: string = '') => {
  const key = Object.keys(hierarchyColor).find((k) => level.toLowerCase().includes(k));
  return key ? hierarchyColor[key] : 'bg-muted text-muted-foreground border-border';
};

const getScoreColor = (score: number) => {
  if (score >= 70) return 'text-emerald-400';
  if (score >= 40) return 'text-amber-400';
  return 'text-red-400';
};

const getScoreBarColor = (score: number) => {
  if (score >= 70) return '[&>div]:bg-emerald-500';
  if (score >= 40) return '[&>div]:bg-amber-500';
  return '[&>div]:bg-red-500';
};

/** Parsea los valorization_methods que pueden llegar como string JSON o array */
function parseListField(value: string | string[] | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [value];
  }
}

export default function ScanResultsPanel({ data }: ResultProps) {
  const { object, energy, ai_provider, ai_model, processing_time_ms } = data;

  // Normalizar campos — el backend usa object_name, object_category, etc.
  const objectName = object.object_name;
  const objectCategory = object.object_category;
  const objectMaterial = object.object_material;
  const objectCondition = object.object_condition;
  const objectDescription = object.description;
  const confidencePct = Math.round((object.confidence_score ?? 0) * 100);

  // energy puede venir de ScanResponse.energy o de object.energy_data (historial)
  const energyData = energy ?? object.energy_data;
  const score = energyData?.energy_score ?? 0;
  const valorizationMethods = parseListField(energyData?.valorization_methods as any);

  return (
    <div className="flex flex-col gap-6 animate-in">

      {/* Header banner */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={16} className="text-primary shrink-0" />
            <h2 className="text-xl font-bold text-foreground truncate">
              {objectName}
            </h2>
          </div>
          <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
            {objectDescription || 'Objeto procesado sin metadata enriquecida.'}
          </p>
        </div>

        <div className="shrink-0 text-right flex flex-col items-end gap-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Engine</p>
          <Badge
            variant="outline"
            className="gap-1.5 text-primary border-primary/30 bg-primary/10"
          >
            <Cpu size={12} />
            {ai_provider ?? object.ai_provider} · {ai_model ?? object.ai_model}
          </Badge>
          {processing_time_ms != null && (
            <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
              <Timer size={10} />
              {processing_time_ms}ms
            </p>
          )}
        </div>
      </div>

      <Separator className="opacity-30" />

      {/* Caché RAG: resultado recuperado de la BD sin nuevo análisis */}
      {data.cached && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/10 border border-primary/25 animate-in">
          <Database size={18} className="text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-primary">Resultado desde la base de datos</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Esta imagen ya había sido analizada. Se reutilizó el resultado guardado sin ejecutar el análisis de IA.
            </p>
          </div>
        </div>
      )}

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* ── Card 1: Materia Base ──────────────────────────────────── */}
        <Card className="bg-card/60 border-border/60 card-hover">
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-500/15 text-blue-400 rounded-lg">
                <Box size={16} />
              </div>
              <h3 className="font-semibold text-foreground text-sm">Materia Base</h3>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 flex flex-col gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Objeto Capturado
              </p>
              <p className="text-base font-semibold text-foreground capitalize leading-tight">
                {objectName}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Material
                </p>
                <p className="text-sm font-medium text-foreground/80 capitalize">
                  {objectMaterial || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Condición
                </p>
                <p className="text-sm font-medium text-foreground/80 capitalize">
                  {objectCondition || 'N/A'}
                </p>
              </div>
            </div>

            {/* Confidence */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Confianza IA
                </p>
                <span className="text-xs font-bold text-blue-400">{confidencePct}%</span>
              </div>
              <Progress value={confidencePct} className="h-1.5 bg-muted [&>div]:bg-blue-500" />
            </div>
          </CardContent>
        </Card>

        {/* ── Card 2: Protocolo LER ─────────────────────────────────── */}
        <Card className="bg-card/60 border-border/60 card-hover">
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/15 text-emerald-400 rounded-lg">
                  <Recycle size={16} />
                </div>
                <h3 className="font-semibold text-foreground text-sm">Protocolo LER</h3>
              </div>
              {energyData?.is_hazardous && (
                <Badge className="gap-1 bg-red-500/15 text-red-400 border-red-500/30 text-[10px]">
                  <ShieldAlert size={10} />
                  Peligroso
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 flex flex-col gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Categoría
              </p>
              <p className="text-sm font-semibold text-foreground/90 capitalize">
                {objectCategory}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Código LER Europeo
              </p>
              <code className="text-sm font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-md inline-block tracking-wider">
                {energyData?.ler_code || '—'}
              </code>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Nivel Jerárquico
              </p>
              <Badge
                className={`capitalize text-xs border ${getHierarchyStyle(
                  energyData?.waste_hierarchy_level,
                )}`}
              >
                <Layers size={10} className="mr-1" />
                {energyData?.waste_hierarchy_level || 'No determinado'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* ── Card 3: Potencial Energético ──────────────────────────── */}
        <Card className="bg-card/60 border-amber-500/20 card-hover md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/15 text-amber-400 rounded-lg">
                <BatteryCharging size={16} />
              </div>
              <h3 className="font-semibold text-foreground text-sm">Potencial Energético</h3>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 flex flex-col gap-4">
            {/* Score big number */}
            <div className="flex items-end gap-2">
              <span className={`text-5xl font-black leading-none ${getScoreColor(score)}`}>
                {score}
              </span>
              <div className="mb-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  / 100
                </span>
                <p className="text-[10px] text-muted-foreground">Energy Score</p>
              </div>
            </div>

            <Progress value={score} className={`h-2 bg-muted/50 ${getScoreBarColor(score)}`} />

            <Separator className="opacity-20" />

            {/* kWh metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="stat-card">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  kWh / Unidad
                </p>
                <p className="text-lg font-bold text-foreground">
                  {energyData?.kwh_per_unit?.toFixed(2) ?? '0.00'}
                </p>
              </div>
              <div className="stat-card">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  kWh / Kg
                </p>
                <p className="text-lg font-bold text-foreground">
                  {energyData?.kwh_per_kg?.toFixed(2) ?? '0.00'}
                </p>
              </div>
            </div>

            {/* Valorization methods */}
            {valorizationMethods.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Métodos Viables
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {valorizationMethods.map((v, i) => (
                    <Badge
                      key={i}
                      className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/25 hover:bg-amber-500/20 transition-colors"
                    >
                      {v}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reuse suggestions */}
      {object.reuse_suggestions && parseListField(object.reuse_suggestions as any).length > 0 && (
        <div className="p-5 rounded-xl bg-card/40 border border-border/50">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Sugerencias de Reutilización
          </p>
          <ul className="flex flex-col gap-1.5">
            {parseListField(object.reuse_suggestions as any).map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5 shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Hazardous warning full-width */}
      {energyData?.is_hazardous && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/25 animate-in">
          <AlertTriangle size={18} className="text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-400">Residuo Peligroso Detectado</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Este material requiere gestión especializada conforme a normativa LER. Contacta con un gestor autorizado.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
