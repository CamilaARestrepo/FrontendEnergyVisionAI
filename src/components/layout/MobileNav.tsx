import { NavLink } from 'react-router-dom';
import { Camera, History, Settings } from 'lucide-react';

const navLinks = [
  {
    to: '/',
    icon: Camera,
    label: 'Scanner',
    end: true,
  },
  {
    to: '/history',
    icon: History,
    label: 'Registro',
    end: false,
  },
  {
    to: '/settings',
    icon: Settings,
    label: 'Config',
    end: false,
  },
];

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 md:hidden border-t border-border bg-card/80 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-3">
        {navLinks.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold transition-all duration-200 ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`p-1.5 rounded-xl transition-all duration-200 ${
                      isActive ? 'bg-primary/15 text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    <Icon size={20} />
                  </div>
                  <span>{link.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}