import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PenLine, Stethoscope, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/track', label: 'Track', icon: PenLine },
  { to: '/conditions', label: 'Conditions', icon: Stethoscope },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header className="border-b bg-card px-4 py-3">
        <div className="container flex items-center gap-3">
          <Stethoscope className="h-6 w-6 text-primary" aria-hidden="true" />
          <h1 className="text-lg font-semibold tracking-tight">Chronicle</h1>
        </div>
      </header>

      <main id="main-content" className="flex-1 container py-6 px-4 animate-fade-in" tabIndex={-1}>
        {children}
      </main>

      <nav aria-label="Main navigation" className="border-t bg-card sticky bottom-0 z-40">
        <ul className="container flex justify-around py-1" role="list">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={cn(
                    'flex flex-col items-center gap-0.5 px-3 py-2 touch-target rounded-lg transition-colors',
                    'hover:bg-accent focus-visible:bg-accent',
                    active ? 'text-primary font-medium' : 'text-muted-foreground'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span className="text-xs">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
