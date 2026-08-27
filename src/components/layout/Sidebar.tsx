import { NavLink } from 'react-router-dom';
import { Camera, History, Settings, Zap, ChevronRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navLinks = [
  {
    to: '/',
    icon: Camera,
    label: 'Scanner AI',
    description: 'Analizar nueva imagen',
    end: true,
  },
  {
    to: '/history',
    icon: History,
    label: 'Registro LER',
    description: 'Historial de escaneos',
    end: false,
  },
  {
    to: '/settings',
    icon: Settings,
    label: 'Configuración IA',
    description: 'Gestionar proveedores de IA',
    end: false,
  },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col sticky top-0 hidden md:flex overflow-hidden">

      {/* Top glow accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      {/* Logo */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="gradient-brand text-white p-2 rounded-xl shadow-lg glow-green-sm flex items-center justify-center">
              <Zap size={20} fill="currentColor" />
            </div>
            <div className="absolute inset-0 gradient-brand rounded-xl blur-md opacity-40 -z-10" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-none text-foreground tracking-tight">
              EnergyVision
            </span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">
              AI Platform
            </span>
          </div>
        </div>
      </div>

      <Separator className="opacity-50" />

      {/* Navigation */}
      <nav className="flex-1 p-4 flex flex-col gap-1 mt-2">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-2 mb-2">
          Módulos
        </p>
        {navLinks.map((link) => {
          const Icon = link.icon;

          return (
            <Tooltip key={link.to}>
              <TooltipTrigger render={
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive: navActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm group relative
                    ${navActive ? 'nav-active' : 'nav-inactive'}`
                  }
                >
                  {({ isActive: navActive }) => (
                    <>
                      <div
                        className={`p-1.5 rounded-lg transition-all duration-200 ${
                          navActive
                            ? 'bg-primary/20 text-primary'
                            : 'text-muted-foreground group-hover:text-foreground'
                        }`}
                      >
                        <Icon size={16} />
                      </div>
                      <span>{link.label}</span>
                      {navActive && (
                        <ChevronRight
                          size={14}
                          className="ml-auto text-primary opacity-60"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              } />
              <TooltipContent side="right" className="text-xs">
                {link.description}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      <Separator className="opacity-50" />

      {/* Footer */}
      <div className="p-4">
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-[10px] text-muted-foreground">v1.0.0 · LangGraph</span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        </div>
      </div>
    </aside>
  );
}
