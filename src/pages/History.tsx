/**
 * HistoryPage — Registro LER histórico de todos los objetos analizados.
 *
 * Refactorizado para:
 * - Usar hooks useObjects / useDeleteObject en lugar de useMutation inline
 * - Toasts de Sonner en lugar de console.error silencioso
 * - Query key 'objects' (consistente con useObjects hook)
 */

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useObjects, useDeleteObject } from '@/hooks/useObjects';
import type { DetectedObject } from '@/types/object.types';
import {
  DownloadCloud,
  Layers,
  FileJson,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import ObjectDetailModal from '@/components/history/ObjectDetailModal';
import { objectsService } from '@/services/objects.service';

const BACKEND_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') ||
  'http://localhost:8000';

/* ── helpers ────────────────────────────────────────────────── */
const categoryColors: Record<string, string> = {
  raee:      'bg-purple-500/15 text-purple-400 border-purple-500/30',
  metal:     'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  biomasa:   'bg-green-500/15 text-green-400 border-green-500/30',
  plástico:  'bg-blue-500/15 text-blue-400 border-blue-500/30',
  vidrio:    'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  papel:     'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
};

const getCategoryStyle = (cat = '') => {
  const key = Object.keys(categoryColors).find((k) => cat.toLowerCase().includes(k));
  return key ? categoryColors[key] : 'bg-muted text-muted-foreground border-border';
};

const getScoreColor = (s: number) =>
  s >= 70 ? 'text-emerald-400' : s >= 40 ? 'text-amber-400' : 'text-red-400';

const getScoreBarClass = (s: number) =>
  s >= 70 ? '[&>div]:bg-emerald-500' : s >= 40 ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500';

/* ── DeleteRowButton ────────────────────────────────────────── */
function DeleteRowButton({ id, name }: { id: number; name: string }) {
  const { mutate: deleteObj, isPending } = useDeleteObject();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteObj(id, {
      onSuccess: () => {
        toast.success('Registro eliminado', {
          description: `"${name}" fue eliminado del historial LER.`,
        });
      },
      onError: (err: any) => {
        toast.error('Error al eliminar', {
          description: err?.response?.data?.detail || err.message,
        });
      },
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        className="p-1.5 rounded-md text-muted-foreground/40 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
        onClick={(e) => e.stopPropagation()}
        title="Eliminar"
        aria-label="Eliminar registro"
      >
        {isPending
          ? <Loader2 size={14} className="animate-spin" />
          : <Trash2 size={14} />
        }
      </AlertDialogTrigger>
      <AlertDialogContent className="border-border/60 bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar este registro?</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará permanentemente{' '}
            <strong className="text-foreground capitalize">{name}</strong>{' '}
            del historial LER. Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
          >
            {isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Sí, eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ── HistoryPage ────────────────────────────────────────────── */
export default function HistoryPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selectedObj, setSelectedObj] = useState<DetectedObject | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];

  const handlePageSizeChange = (value: string | null) => {
    if (value == null) return;
    setPageSize(Number(value));
    setPage(1);
  };

  // Usa el hook centralizado — query key 'objects' compartida con useObjects
  const { data, isLoading } = useObjects({ page, page_size: pageSize });

  const handleRowClick = (obj: DetectedObject) => {
    setSelectedObj(obj);
    setDetailOpen(true);
  };

  const handleExport = async (format: 'json' | 'csv') => {
    const loadingToast = toast.loading(`Generando exportación ${format.toUpperCase()}...`);
    try {
      await objectsService.exportObjects(format);
      toast.dismiss(loadingToast);
      toast.success('Exportación lista', {
        description: `El archivo ${format.toUpperCase()} se descargó correctamente.`,
      });
    } catch (e: any) {
      toast.dismiss(loadingToast);
      toast.error('Error en exportación', {
        description: e?.response?.data?.detail || e.message || 'Inténtalo de nuevo.',
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-10 min-h-full">

      {/* Page header */}
      <div className="flex items-end justify-between animate-in stagger-1">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-primary/15 rounded-lg">
              <Layers size={16} className="text-primary" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Auditoría Material
            </span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Registro LER</h1>
          <p className="text-muted-foreground text-sm">
            {data?.total != null
              ? `${data.total} objeto${data.total !== 1 ? 's' : ''} en el historial · Click en una fila para detalles`
              : 'Click en cualquier fila para ver el detalle completo del análisis.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline" size="sm"
            onClick={() => handleExport('csv')}
            className="gap-2 text-xs border-border/60 hover:border-primary/40 hover:text-primary"
          >
            <DownloadCloud size={14} />CSV
          </Button>
          <Button
            variant="outline" size="sm"
            onClick={() => handleExport('json')}
            className="gap-2 text-xs border-border/60 hover:border-primary/40 hover:text-primary"
          >
            <FileJson size={14} />JSON
          </Button>
        </div>
      </div>

      <Separator className="opacity-30" />

      {/* Table */}
      <div className="rounded-xl border border-border/60 bg-card/50 overflow-hidden animate-in stagger-2">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider w-12">ID</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Objeto</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Fecha · IA</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Categoría LER</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider text-right w-36">Energy Score</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i} className="border-border/40">
                    <TableCell><Skeleton className="h-4 w-8 bg-muted/40" /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg bg-muted/40 shrink-0" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-3.5 w-28 bg-muted/40" />
                          <Skeleton className="h-2.5 w-20 bg-muted/30" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-3.5 w-24 bg-muted/40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 bg-muted/30 rounded-full" /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        <Skeleton className="h-5 w-10 bg-muted/40" />
                        <Skeleton className="h-1.5 w-20 bg-muted/30 rounded-full" />
                      </div>
                    </TableCell>
                    <TableCell />
                  </TableRow>
                ))
              ) : data?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-20 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-muted/30 flex items-center justify-center">
                        <Layers size={20} className="text-muted-foreground/40" />
                      </div>
                      <p className="text-sm">
                        No hay registros aún.{' '}
                        <span className="text-primary">Inicia escaneando un residuo.</span>
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((obj: DetectedObject) => {
                  const score = obj.energy_data?.energy_score ?? 0;
                  return (
                    <TableRow
                      key={obj.id}
                      onClick={() => handleRowClick(obj)}
                      className="border-border/40 cursor-pointer hover:bg-muted/20 transition-colors group"
                    >
                      {/* ID */}
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground/60">#{obj.id}</span>
                      </TableCell>

                      {/* Object */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted/30 overflow-hidden shrink-0">
                            <img
                              src={`${BACKEND_BASE}${obj.image_path}`}
                              alt={obj.object_name}
                              className="w-full h-full object-cover"
                              onError={(e) => (e.currentTarget.style.display = 'none')}
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-sm capitalize leading-tight">
                              {obj.object_name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Confiabilidad:{' '}
                              <span className="text-primary font-medium">
                                {((obj.confidence_score ?? 0) * 100).toFixed(0)}%
                              </span>
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Date + model */}
                      <TableCell>
                        <p className="text-sm text-foreground/70 font-medium">
                          {new Date(obj.created_at).toLocaleDateString('es-ES', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })}
                        </p>
                        <Badge className="mt-1.5 text-[10px] uppercase bg-primary/10 text-primary border-primary/25">
                          {obj.ai_model}
                        </Badge>
                      </TableCell>

                      {/* Category + LER */}
                      <TableCell>
                        <Badge className={`text-[10px] capitalize border ${getCategoryStyle(obj.object_category)}`}>
                          {obj.object_category}
                        </Badge>
                        {obj.energy_data?.ler_code && (
                          <code className="block font-mono text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded mt-1.5 w-fit">
                            {obj.energy_data.ler_code}
                          </code>
                        )}
                      </TableCell>

                      {/* Energy score */}
                      <TableCell className="text-right">
                        {obj.energy_data?.energy_score != null ? (
                          <div className="flex flex-col items-end gap-1.5">
                            <span className={`text-xl font-black leading-none ${getScoreColor(score)}`}>
                              {score}
                            </span>
                            <Progress
                              value={score}
                              className={`h-1.5 w-20 bg-muted/30 ${getScoreBarClass(score)}`}
                            />
                          </div>
                        ) : (
                          <span className="text-muted-foreground/40 text-sm">—</span>
                        )}
                      </TableCell>

                      {/* Delete button */}
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DeleteRowButton id={obj.id} name={obj.object_name} />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <Separator className="opacity-30" />
        <div className="p-4 flex flex-wrap justify-between items-center gap-3">
          {/* Page size selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Mostrar</span>
            <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
              <SelectTrigger
                id="page-size-select"
                className="h-7 w-[70px] text-xs border-border/60 bg-card/60 focus:ring-primary/40"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="min-w-[70px]">
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)} className="text-xs">
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">registros</span>
          </div>

          {/* Page info */}
          <span className="text-xs text-muted-foreground">
            {data ? (
              <>
                Página{' '}
                <span className="font-semibold text-foreground">{page}</span>
                {' '}de{' '}
                <span className="font-semibold text-foreground">{data.pages || 1}</span>
                {data.total != null && (
                  <span className="ml-2 text-muted-foreground/60">({data.total} total)</span>
                )}
              </>
            ) : null}
          </span>

          {/* Prev / Next */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline" size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="gap-1.5 text-xs border-border/60 disabled:opacity-30 h-7 px-2"
            >
              <ChevronLeft size={14} />Anterior
            </Button>
            <Button
              variant="outline" size="sm"
              disabled={!data || page >= (data.pages || 1)}
              onClick={() => setPage((p) => p + 1)}
              className="gap-1.5 text-xs border-border/60 disabled:opacity-30 h-7 px-2"
            >
              Siguiente<ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </div>

      {/* Detail modal */}
      <ObjectDetailModal
        object={selectedObj}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onDeleted={() => {
          setSelectedObj(null);
          toast.success('Registro eliminado del historial.');
        }}
      />
    </div>
  );
}
