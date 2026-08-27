import { useLocation } from 'react-router-dom';
import { useSettingsStore } from '../../store/settings.store';
import { useQuery } from '@tanstack/react-query';
import { settingsService } from '../../services/settings.service';
import { Circle, Cpu, Settings2, Zap, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTheme } from '@/hooks/useTheme';

const routeLabels: Record<string, string> = {
  '/': 'Scanner AI',
  '/history': 'Registro LER',
};

export default function Header() {
  const { openSettingsModal } = useSettingsStore();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsService.getSettings,
  });

  const activeProvider = settings?.active_provider;
  const pageLabel = routeLabels[location.pathname] ?? 'EnergyVision';

  return (
    <header className="h-14 flex items-center justify-between px-6 bg-card/60 border-b border-border backdrop-blur-md sticky top-0 z-20">
      
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Zap size={13} className="text-primary" />
          <span className="hidden sm:inline">EnergyVision</span>
        </div>
        <span className="text-muted-foreground/40">/</span>
        <span className="font-semibold text-foreground">{pageLabel}</span>
      </div>

      {/* Right: Status + Actions */}
      <div className="flex items-center gap-3">
        {/* AI Provider Status */}
        {activeProvider ? (
          <Tooltip>
            <TooltipTrigger render={
              <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full cursor-default">
                <Circle size={7} className="fill-primary text-primary animate-pulse" />
                <Cpu size={12} />
                <span className="capitalize">{activeProvider}</span>
              </div>
            } />
            <TooltipContent>
              Motor de IA activo
            </TooltipContent>
          </Tooltip>
        ) : (
          <div
            className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 bg-muted text-muted-foreground border border-border rounded-full cursor-pointer hover:border-primary/30 transition-colors"
            onClick={openSettingsModal}
          >
            <Circle size={7} className="text-muted-foreground/50" />
            <span>Sin IA — Configurar</span>
          </div>
        )}

        <Separator orientation="vertical" className="h-5 opacity-40" />

        {/* Theme toggle */}
        <Tooltip>
          <TooltipTrigger render={
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
              onClick={toggleTheme}
              aria-label="Alternar tema"
            >
              {theme === 'dark'
                ? <Sun size={15} className="text-amber-400" />
                : <Moon size={15} className="text-primary" />}
            </Button>
          } />
          <TooltipContent>
            {theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger render={
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50"
              onClick={openSettingsModal}
            >
              <Settings2 size={16} />
            </Button>
          } />
          <TooltipContent>Configuración IA</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
