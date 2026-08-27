import { useSettingsStore } from '../../store/settings.store';
import { useQuery } from '@tanstack/react-query';
import { settingsService } from '../../services/settings.service';
import ProviderCard from './ProviderCard';
import ProviderForm from './ProviderForm';
import { Server, BrainCircuit, GlobeLock, Cpu, Zap } from 'lucide-react';
import type { ProviderSettings } from '../../types/settings.types';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const iconMap: Record<string, any> = {
  openai: GlobeLock,
  anthropic: BrainCircuit,
  gemini: Cpu,
  ollama: Server,
};

export default function SettingsModal() {
  const { isSettingsModalOpen, closeSettingsModal, selectedProviderForm, selectForm } =
    useSettingsStore();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsService.getSettings,
    enabled: isSettingsModalOpen,
  });

  const currentProviderData = settings?.providers.find(
    (p) => p.name === selectedProviderForm
  );

  return (
    <Dialog
      open={isSettingsModalOpen}
      onOpenChange={(open) => !open && closeSettingsModal()}
    >
      <DialogContent className="max-w-2xl border-border/60 bg-card shadow-2xl">
        {/* Header */}
        <DialogHeader className="pb-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-primary/15 rounded-xl">
              <Zap size={18} className="text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">
                {selectedProviderForm && currentProviderData
                  ? `Configurar ${currentProviderData.display_name}`
                  : 'Motor de Inteligencia'}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm mt-0.5">
                {selectedProviderForm
                  ? 'Ingresa las credenciales para habilitar este motor en el hub.'
                  : 'Selecciona el proveedor de IA a orquestar por LangGraph.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator className="opacity-40" />

        {/* Content */}
        <div className="overflow-y-auto max-h-[65vh] w-full py-2">
          {isLoading ? (
            /* Skeleton grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-5 rounded-xl border border-border/40 flex flex-col gap-4">
                  <Skeleton className="h-10 w-10 rounded-xl bg-muted/40" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-muted/40" />
                    <Skeleton className="h-3 w-16 bg-muted/30" />
                  </div>
                  <Skeleton className="h-3 w-28 bg-muted/20" />
                </div>
              ))}
            </div>
          ) : currentProviderData ? (
            <ProviderForm
              provider={currentProviderData}
              onSuccess={closeSettingsModal}
              onCancel={() => selectForm(null)}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {settings?.providers.map((p: ProviderSettings) => (
                <ProviderCard
                  key={p.name}
                  provider={p}
                  icon={iconMap[p.name] || Cpu}
                  onClick={() => selectForm(p.name)}
                  isActive={settings.active_provider === p.name}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
