/**
 * DatePicker — Selector de fecha ligero y estilizado con los tokens de la app.
 *
 * Trabaja con strings ISO ("YYYY-MM-DD") para integrarse con los filtros.
 * No requiere dependencias externas: construye el calendario con Date nativo.
 */

import { useEffect, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

function parseISO(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function toISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplay(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

interface DatePickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  className?: string;
}

export default function DatePicker({
  id,
  value,
  onChange,
  placeholder = 'Seleccionar',
  min,
  max,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = parseISO(value);
  const [viewMonth, setViewMonth] = useState<Date>(() => {
    const base = selected ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleToggle = () => {
    if (!open) {
      const base = selected ?? new Date();
      setViewMonth(new Date(base.getFullYear(), base.getMonth(), 1));
    }
    setOpen((prev) => !prev);
  };

  const handleSelect = (day: Date) => {
    onChange(toISO(day));
    setOpen(false);
  };

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const offset = (firstDay.getDay() + 6) % 7; // lunes = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayISO = toISO(new Date());

  const cells: (Date | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        id={id}
        onClick={handleToggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          'flex h-9 w-full items-center gap-2 rounded-lg border border-border/60 bg-card/60 px-2.5 pr-8 text-left text-xs transition-colors outline-none hover:border-primary/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
          open && 'border-primary/50'
        )}
      >
        <CalendarDays size={13} className="text-muted-foreground shrink-0" />
        <span className={cn('flex-1 truncate', !selected && 'text-muted-foreground')}>
          {selected ? formatDisplay(selected) : placeholder}
        </span>
      </button>

      {selected && (
        <button
          type="button"
          aria-label="Limpiar fecha"
          onClick={() => onChange('')}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X size={12} />
        </button>
      )}

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-[280px] max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-3 text-slate-900 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => setViewMonth(new Date(year, month - 1, 1))}
              className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              aria-label="Mes anterior"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-semibold text-slate-900 capitalize">
              {MONTHS[month]} {year}
            </span>
            <button
              type="button"
              onClick={() => setViewMonth(new Date(year, month + 1, 1))}
              className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              aria-label="Mes siguiente"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {WEEKDAYS.map((label) => (
              <span
                key={label}
                className="h-6 flex items-center justify-center text-[10px] font-medium text-slate-400"
              >
                {label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((day, index) => {
              if (!day) return <span key={`empty-${index}`} />;

              const iso = toISO(day);
              const isSelected = iso === value;
              const isToday = iso === todayISO;
              const isDisabled = Boolean((min && iso < min) || (max && iso > max));

              return (
                <button
                  key={iso}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelect(day)}
                  className={cn(
                    'h-8 w-8 rounded-md text-xs transition-colors',
                    isSelected
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'text-slate-700 hover:bg-slate-100',
                    isToday && !isSelected && 'ring-1 ring-primary/40',
                    isDisabled && 'cursor-not-allowed text-slate-300 hover:bg-transparent'
                  )}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                const iso = toISO(today);
                if ((min && iso < min) || (max && iso > max)) return;
                onChange(iso);
                setOpen(false);
              }}
              className="text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
              className="text-[11px] text-slate-400 hover:text-slate-700 transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
