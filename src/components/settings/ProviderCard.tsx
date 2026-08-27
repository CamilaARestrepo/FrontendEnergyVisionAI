import type { LucideIcon } from 'lucide-react';
import type { ProviderSettings } from '../../types/settings.types';
import { CheckCircle2 } from 'lucide-react';

interface ProviderCardProps {
  provider: ProviderSettings;
  icon: LucideIcon;
  onClick: () => void;
  isActive: boolean;
}

const providerStyles: Record<
  string,
  { gradient: string; iconBg: string; iconColor: string; border: string; glow: string }
> = {
  openai: {
    gradient: 'from-emerald-500/10 to-transparent',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
    border: 'border-emerald-500/40',
    glow: 'shadow-emerald-500/20',
  },
  anthropic: {
    gradient: 'from-orange-500/10 to-transparent',
    iconBg: 'bg-orange-500/20',
    iconColor: 'text-orange-400',
    border: 'border-orange-500/40',
    glow: 'shadow-orange-500/20',
  },
  gemini: {
    gradient: 'from-blue-500/10 to-transparent',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
    border: 'border-blue-500/40',
    glow: 'shadow-blue-500/20',
  },
  ollama: {
    gradient: 'from-zinc-500/10 to-transparent',
    iconBg: 'bg-zinc-500/20',
    iconColor: 'text-zinc-400',
    border: 'border-zinc-500/30',
    glow: 'shadow-zinc-500/10',
  },
};

const defaultStyle = providerStyles.ollama;

export default function ProviderCard({
  provider,
  icon: Icon,
  onClick,
  isActive,
}: ProviderCardProps) {
  const style = providerStyles[provider.name] ?? defaultStyle;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative overflow-hidden text-left rounded-xl border transition-all duration-200 p-5 flex flex-col gap-4 w-full group
        ${
          isActive
            ? `${style.border} shadow-lg ${style.glow} bg-gradient-to-br ${style.gradient}`
            : 'border-border/60 bg-card/40 hover:border-border hover:bg-card/70'
        }`}
    >
      {/* Active indicator top-right */}
      {isActive && (
        <div className="absolute top-3 right-3">
          <CheckCircle2 size={16} className={style.iconColor} />
        </div>
      )}

      {/* Icon */}
      <div
        className={`p-2.5 rounded-xl w-fit transition-all duration-200 ${
          isActive ? style.iconBg : 'bg-muted/50 group-hover:bg-muted'
        }`}
      >
        <Icon
          size={22}
          className={isActive ? style.iconColor : 'text-muted-foreground'}
        />
      </div>

      {/* Info */}
      <div>
        <h3 className="font-semibold text-foreground text-base leading-tight">
          {provider.display_name}
        </h3>
        <p className="text-xs mt-1.5">
          {provider.has_api_key && provider.is_configured ? (
            <span className={`flex items-center gap-1.5 font-medium ${style.iconColor}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'animate-pulse' : ''} ${isActive ? style.iconBg.replace('/20', '') : 'bg-current opacity-70'}`} />
              Configurado
            </span>
          ) : (
            <span className="text-muted-foreground">Requiere API Key</span>
          )}
        </p>
      </div>

      {/* Click hint */}
      <div className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">
        {isActive ? 'Motor activo' : 'Click para configurar'}
      </div>
    </button>
  );
}
