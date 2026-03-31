import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PenLine, Stethoscope, FileText, Settings, Calendar, BookOpen, Dna } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBrainFog } from '@/contexts/BrainFogContext';

const navItems = [
  { to: '/', label: 'Home', icon: LayoutDashboard },
  { to: '/track', label: 'Track', icon: PenLine },
  { to: '/journal', label: 'Journal', icon: BookOpen },
  { to: '/timeline', label: 'Timeline', icon: Calendar },
  { to: '/conditions', label: 'Health', icon: Stethoscope },
  { to: '/report', label: 'Report', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const brainFogNavItems = [
  { to: '/track', label: 'Log', icon: PenLine },
  { to: '/', label: 'Home', icon: LayoutDashboard },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { brainFogMode } = useBrainFog();
  const items = brainFogMode ? brainFogNavItems : navItems;

  return (
    <div className={cn('min-h-screen flex flex-col', brainFogMode && 'brain-fog-mode')}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header className="border-b bg-card px-4 py-3">
        <div className="container flex items-center gap-3">
          <Stethoscope className={cn('text-primary', brainFogMode ? 'h-8 w-8' : 'h-6 w-6')} aria-hidden="true" />
          <h1 className={cn('font-semibold tracking-tight', brainFogMode ? 'text-xl' : 'text-lg')}>Chronicle</h1>
        </div>
      </header>

      <main id="main-content" className="flex-1 container py-6 px-4 animate-fade-in" tabIndex={-1}>
        {children}
      </main>

      <nav aria-label="Main navigation" className="border-t bg-card sticky bottom-0 z-40">
        <ul className="container flex justify-around py-1" role="list">
          {items.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={cn(
                    'flex flex-col items-center gap-0.5 px-3 py-2 touch-target rounded-lg transition-colors',
                    'hover:bg-accent focus-visible:bg-accent',
                    active ? 'text-primary font-medium' : 'text-muted-foreground',
                    brainFogMode && 'py-3 px-5'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className={cn(brainFogMode ? 'h-7 w-7' : 'h-5 w-5')} aria-hidden="true" />
                  <span className={cn(brainFogMode ? 'text-sm font-medium' : 'text-xs')}>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
