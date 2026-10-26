/**
 * ScanResultsPanel — Muestra los resultados completos de un análisis.
 *
 * Layout compacto y amigable:
 *  1. Hero: imagen + nombre + categoría + descripción + anillo de energía
 *  2. Tres tarjetas densas: materia base, protocolo LER, potencial energético
 *  3. Fila inferior: sugerencias de reutilización y alerta de peligrosidad
 */

import { useState } from 'react';
import type { ScanResponse } from '../../types/scan.types';
import {
  AlertTriangle,
  BatteryCharging,
  Box,
  ChevronDown,
  ClipboardList,
  Cpu,
  Database,
  Recycle,
  ShieldAlert,
  Layers,
  Timer,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

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

const getScoreStroke = (score: number) => {
  if (score >= 70) return 'oklch(0.68 0.20 158)';
  if (score >= 40) return 'oklch(0.83 0.16 78)';
  return 'oklch(0.63 0.22 27)';
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

/** Anillo de progreso para el Energy Score */
function ScoreRing({ value, size = 86 }: { value: number; size?: number }) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference;
  const color = getScoreStroke(value);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted/50"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-black leading-none ${getScoreColor(value)}`}>
          {value}
        </span>
        <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
          / 100
        </span>
      </div>
    </div>
  );
}

/** Fila etiqueta / valor reutilizable dentro de las tarjetas */
function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground/90 capitalize text-right break-words">
        {value || 'N/A'}
      </span>
    </div>
  );
}

export default function ScanResultsPanel({ data }: ResultProps) {
  const { object, energy, ai_provider, ai_model, processing_time_ms } = data;
  const [descExpanded, setDescExpanded] = useState(false);

  const objectName = object.object_name;
  const objectCategory = object.object_category;
  const objectMaterial = object.object_material;
  const objectBrand = object.object_brand;
  const objectCondition = object.object_condition;
  const objectDescription = object.description;
  const confidencePct = Math.round((object.confidence_score ?? 0) * 100);
  const objectImagePath = object.image_path;

  const apiBaseUrl =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') ||
    'http://localhost:8000';
  const objectImageUrl = objectImagePath ? `${apiBaseUrl}${objectImagePath}` : null;

  const descriptionText = objectDescription || 'Objeto procesado sin metadata enriquecida.';
  const hasLongDescription = (objectDescription?.length ?? 0) > 140;

  const energyData = energy ?? object.energy_data;
  const score = energyData?.energy_score ?? 0;
  const valorizationMethods = parseListField(energyData?.valorization_methods as any);
  const reuseSuggestions = parseListField(object.reuse_suggestions as any);
  const provider = ai_provider ?? object.ai_provider;
  const model = ai_model ?? object.ai_model;

  return (
    <div className="flex flex-col gap-4 animate-in">

      {/* ── Hero: imagen a la izquierda + resumen + energía ──────── */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/70">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-amber-500/10" />

        <div className="relative flex items-start gap-3 sm:gap-5 p-4 sm:p-5">
          {objectImageUrl && (
            <img
              src={objectImageUrl}
              alt={objectName}
              className="w-16 h-16 sm:w-28 sm:h-28 shrink-0 object-cover rounded-xl border border-border/50 shadow-md"
              loading="lazy"
            />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-lg sm:text-xl font-bold text-foreground break-words line-clamp-2 max-w-full">
                {objectName}
              </h2>
              {objectCategory && (
                <Badge className="text-[10px] max-w-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 capitalize">
                  {objectCategory}
                </Badge>
              )}
              {energyData?.is_hazardous && (
                <Badge className="gap-1 text-[10px] max-w-full bg-red-500/15 text-red-400 border-red-500/30">
                  <ShieldAlert size={10} />
                  Peligroso
                </Badge>
              )}
            </div>

            <p className={`text-muted-foreground text-[13px] leading-relaxed max-w-[52ch] ${descExpanded ? '' : 'line-clamp-2'}`}>
              {descriptionText}
            </p>
            {hasLongDescription && (
              <button
                type="button"
                onClick={() => setDescExpanded((v) => !v)}
                className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <ChevronDown
                  size={12}
                  className={`transition-transform ${descExpanded ? 'rotate-180' : ''}`}
                />
                {descExpanded ? 'Ver menos' : 'Ver más'}
              </button>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1 min-w-0">
                <Cpu size={11} className="text-primary shrink-0" />
                <span className="truncate">{provider} · {model}</span>
              </span>
              {processing_time_ms != null && (
                <span className="inline-flex items-center gap-1">
                  <Timer size={11} />
                  {processing_time_ms}ms
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                Confianza {confidencePct}%
              </span>
              <span className="sm:hidden inline-flex items-center gap-1 font-semibold text-amber-400">
                <BatteryCharging size={11} />
                {score}/100
              </span>
            </div>
          </div>

          {/* Energy score ring (desktop) */}
          <div className="hidden sm:flex flex-col items-center gap-1 shrink-0 self-center">
            <ScoreRing value={score} />
            <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
              Energy Score
            </span>
          </div>
        </div>
      </div>

      {/* ── Caché RAG ─────────────────────────────────────────────── */}
      {data.cached && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/25">
          <Database size={15} className="text-primary shrink-0" />
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-primary">Resultado desde la base de datos.</span>{' '}
            Esta imagen ya había sido analizada; se reutilizó el resultado guardado.
          </p>
        </div>
      )}

      {/* ── Tarjetas de detalle ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Card 1: Materia Base */}
        <Card className="bg-card/60 border-border/60 card-hover h-full">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-500/15 text-blue-400 rounded-lg">
                <Box size={15} />
              </div>
              <h3 className="font-semibold text-foreground text-sm">Materia Base</h3>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 flex flex-col gap-2.5">
            <InfoRow label="Material" value={objectMaterial} />
            <InfoRow label="Condición" value={objectCondition} />
            {objectBrand && <InfoRow label="Marca" value={objectBrand} />}

            <div className="mt-auto pt-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] text-muted-foreground">Confianza IA</span>
                <span className="text-xs font-bold text-blue-400">{confidencePct}%</span>
              </div>
              <Progress value={confidencePct} className="h-1.5 bg-muted [&>div]:bg-blue-500" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Protocolo LER */}
        <Card className="bg-card/60 border-border/60 card-hover h-full">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/15 text-emerald-400 rounded-lg">
                  <Recycle size={15} />
                </div>
                <h3 className="font-semibold text-foreground text-sm">Protocolo LER</h3>
              </div>
              {energyData?.ler_code && (
                <code className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-md tracking-wider">
                  {energyData.ler_code}
                </code>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 flex flex-col gap-2.5">
            <InfoRow label="Categoría" value={objectCategory} />

            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] text-muted-foreground">Jerarquía</span>
              <Badge
                className={`capitalize text-[10px] border ${getHierarchyStyle(
                  energyData?.waste_hierarchy_level,
                )}`}
              >
                <Layers size={9} className="mr-1" />
                {energyData?.waste_hierarchy_level || 'No determinado'}
              </Badge>
            </div>

            <div className="flex items-center justify-between gap-3 mt-auto pt-1">
              <span className="text-[11px] text-muted-foreground">Residuo</span>
              <span
                className={`text-xs font-semibold ${
                  energyData?.is_hazardous ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {energyData?.is_hazardous ? 'Peligroso' : 'No peligroso'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Potencial Energético */}
        <Card className="bg-card/60 border-amber-500/20 card-hover h-full">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500/15 text-amber-400 rounded-lg">
                <BatteryCharging size={15} />
              </div>
              <h3 className="font-semibold text-foreground text-sm">Potencial Energético</h3>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 flex flex-col gap-3">
            <Progress value={score} className={`h-1.5 bg-muted/50 ${getScoreBarColor(score)}`} />

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-border/50 bg-muted/20 px-2.5 py-2">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                  kWh / Unidad
                </p>
                <p className="text-base font-bold text-foreground leading-tight">
                  {energyData?.kwh_per_unit?.toFixed(2) ?? '0.00'}
                </p>
              </div>
              <div className="rounded-lg border border-border/50 bg-muted/20 px-2.5 py-2">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                  kWh / Kg
                </p>
                <p className="text-base font-bold text-foreground leading-tight">
                  {energyData?.kwh_per_kg?.toFixed(2) ?? '0.00'}
                </p>
              </div>
            </div>

            {valorizationMethods.length > 0 && (
              <div className="mt-auto">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Métodos viables
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

      {/* ── Gestión del residuo ───────────────────────────────────── */}
      {(energyData?.processing_notes || energyData?.waste_hierarchy_level) && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList size={14} className="text-emerald-400 shrink-0" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
              Gestión del residuo
            </p>
          </div>
          <p className="text-[13px] leading-relaxed text-foreground/80">
            {energyData?.processing_notes ||
              `Clasificado en la jerarquía como ${energyData?.waste_hierarchy_level}. Prioriza la prevención y la reutilización antes del reciclaje o la valorización energética.`}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {energyData?.ler_code && (
              <Badge className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                LER {energyData.ler_code}
              </Badge>
            )}
            {energyData?.waste_hierarchy_level && (
              <Badge className={`text-[10px] capitalize border ${getHierarchyStyle(energyData.waste_hierarchy_level)}`}>
                <Layers size={9} className="mr-1" />
                {energyData.waste_hierarchy_level}
              </Badge>
            )}
            {energyData?.is_hazardous && (
              <Badge className="gap-1 text-[10px] bg-red-500/15 text-red-400 border-red-500/30">
                <ShieldAlert size={9} />
                Requiere gestor autorizado
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* ── Fila inferior: reutilización + alerta ─────────────────── */}
      {(reuseSuggestions.length > 0 || energyData?.is_hazardous) && (
        <div className={`grid grid-cols-1 gap-4 ${reuseSuggestions.length > 0 && energyData?.is_hazardous ? 'lg:grid-cols-2' : ''}`}>
          {reuseSuggestions.length > 0 && (
            <div className="rounded-xl border border-border/60 bg-card/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-primary" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Sugerencias de Reutilización
                </p>
              </div>
              <ul className="flex flex-col gap-1.5">
                {reuseSuggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-foreground/80 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {energyData?.is_hazardous && (
            <div className="flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-4">
              <AlertTriangle size={17} className="text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-400">Residuo Peligroso Detectado</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  Requiere gestión especializada conforme a normativa LER. Contacta con un gestor autorizado.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
