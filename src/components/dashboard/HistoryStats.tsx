/**
 * HistoryStats — Resumen de actividad del Registro LER.
 *
 * KPIs ambientales/energéticos del historial más las categorías más
 * escaneadas. Se alimenta de GET /objects/stats.
 */

import { BatteryCharging, Recycle, ScanLine, Zap } from 'lucide-react';
import { useObjectStats } from '@/hooks/useObjects';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const formatKwh = (value: number) =>
  value.toLocaleString('es-ES', { maximumFractionDigits: 2 });

export default function HistoryStats() {
  const { data, isLoading } = useObjectStats();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[82px] rounded-xl bg-muted/30" />
          ))}
        </div>
        <Skeleton className="h-6 w-64 bg-muted/20" />
      </div>
    );
  }

  const items = [
    {
      label: 'Residuos escaneados',
      value: String(data?.total_scans ?? 0),
      suffix: '',
      icon: ScanLine,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Energy Score medio',
      value: String(Math.round(data?.avg_energy_score ?? 0)),
      suffix: '/100',
      icon: Zap,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'kWh potenciales',
      value: formatKwh(data?.total_kwh ?? 0),
      suffix: ' kWh',
      icon: BatteryCharging,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-xl border border-border/60 bg-card/40 p-3 sm:p-4 flex items-center gap-3"
            >
              <div className={`p-2.5 rounded-lg shrink-0 ${item.bg}`}>
                <Icon size={16} className={item.color} />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-xl font-bold text-foreground leading-none">
                  {item.value}
                  {item.suffix && (
                    <span className="text-[11px] font-medium text-muted-foreground ml-0.5">
                      {item.suffix}
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1 truncate">
                  {item.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {data && data.top_categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Recycle size={11} className="text-primary" />
            Categorías más escaneadas
          </span>
          {data.top_categories.map((c) => (
            <Badge
              key={c.category}
              className="text-[10px] capitalize bg-primary/10 text-primary border border-primary/20"
            >
              {c.category}
              <span className="ml-1 text-primary/60">{c.count}</span>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
