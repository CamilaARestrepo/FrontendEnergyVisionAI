/**
 * ResidueGuide — Píldoras educativas sobre clasificación y gestión de residuos.
 * Se muestra en la vista inicial del scanner.
 */

import { BookOpen, Layers, ShieldAlert } from 'lucide-react';

const guides = [
  {
    icon: BookOpen,
    title: 'Código LER',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    text: 'El Catálogo Europeo de Residuos identifica cada residuo con un código de seis dígitos. La IA lo asigna automáticamente según su composición.',
  },
  {
    icon: Layers,
    title: 'Jerarquía de residuos',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    text: 'Prevención, reutilización, reciclaje, valorización energética y eliminación. El análisis prioriza siempre las opciones más circulares.',
  },
  {
    icon: ShieldAlert,
    title: 'Residuos peligrosos',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    text: 'Los residuos peligrosos requieren un gestor autorizado y trazabilidad documental. El scanner te avisa en cuanto detecta uno.',
  },
];

export default function ResidueGuide() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/30 p-4 sm:p-5 animate-in stagger-3">
      <div className="mb-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
          Aprende
        </p>
        <h3 className="text-sm font-bold text-foreground">Entiende tus residuos</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {guides.map((g) => {
          const Icon = g.icon;
          return (
            <div
              key={g.title}
              className="rounded-xl border border-border/50 bg-muted/15 p-3.5"
            >
              <div className={`p-1.5 rounded-lg w-fit mb-2 ${g.bg}`}>
                <Icon size={14} className={g.color} />
              </div>
              <h4 className="text-xs font-semibold text-foreground mb-1">{g.title}</h4>
              <p className="text-[11px] leading-relaxed text-muted-foreground">{g.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
