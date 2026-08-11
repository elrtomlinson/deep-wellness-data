import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PenLine, Stethoscope, FileText, Settings, Calendar, BookOpen, Dna, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBrainFog } from '@/contexts/BrainFogContext';
import { useHaptic } from '@/hooks/useHaptic';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState } from 'react';

/** Primary tabs — always visible in bottom nav */
const primaryNavItems = [
  { to: '/', label: 'Home', icon: LayoutDashboard },
  { to: '/track', label: 'Track', icon: PenLine },
  { to: '/timeline', label: 'Timeline', icon: Calendar },
  { to: '/report', label: 'Report', icon: FileText },
];

/** Secondary tabs — accessible via "More" overflow menu */
const secondaryNavItems = [
  { to: '/conditions', label: 'Conditions', icon: Stethoscope },
  { to: '/journal', label: 'Journal', icon: BookOpen },
  { to: '/dna', label: 'DNA Report', icon: Dna },
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
  const [moreOpen, setMoreOpen] = useState(false);
  const haptic = useHaptic();

  if (brainFogMode) {
    return (
      <div className="min-h-dvh flex flex-col brain-fog-mode">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <header className="border-b bg-card px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="container flex items-center gap-2">
            <Stethoscope className="h-8 w-8 text-primary" aria-hidden="true" />
            <h1 className="text-xl font-semibold tracking-tight">Chronicle</h1>
          </div>
        </header>
        <main id="main-content" className="flex-1 container py-4 sm:py-6 pb-20 animate-fade-in" tabIndex={-1}>{children}</main>
        <nav aria-label="Main navigation" className="border-t bg-card fixed bottom-0 left-0 right-0 z-40 safe-area-bottom">
          <ul className="container flex justify-around py-1" role="list">
            {brainFogNavItems.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <li key={to} className="flex-1">
                  <Link to={to} onClick={() => haptic.light()} className={cn('flex flex-col items-center gap-0.5 py-3 rounded-lg transition-colors hover:bg-accent', active ? 'text-primary font-medium' : 'text-muted-foreground')} aria-current={active ? 'page' : undefined}>
                    <Icon className="h-7 w-7" aria-hidden="true" />
                    <span className="text-sm font-medium">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    );
  }

  const isSecondaryActive = secondaryNavItems.some(item => item.to === location.pathname);

  return (
    <div className="min-h-dvh flex flex-col">
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <header className="border-b bg-card px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="container flex items-center gap-2">
          <Stethoscope className="h-5 w-5 sm:h-6 sm:w-6 text-primary" aria-hidden="true" />
          <h1 className="text-base sm:text-lg font-semibold tracking-tight">Chronicle</h1>
        </div>
      </header>

      <main id="main-content" className="flex-1 container py-4 sm:py-6 pb-20 animate-fade-in" tabIndex={-1}>
        {children}
      </main>

      <nav aria-label="Main navigation" className="border-t bg-card fixed bottom-0 left-0 right-0 z-40 safe-area-bottom">
        <ul className="container flex justify-around py-1" role="list">
          {primaryNavItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <li key={to} className="flex-1">
                <Link
                  to={to}
                  onClick={() => haptic.light()}
                  className={cn(
                    'flex flex-col items-center gap-0.5 py-1.5 sm:py-2 rounded-lg transition-colors',
                    'hover:bg-accent focus-visible:bg-accent active:scale-95 transition-transform',
                    active ? 'text-primary font-medium' : 'text-muted-foreground',
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span className={cn('text-[10px] sm:text-xs leading-tight', !active && 'hidden sm:block')}>{label}</span>
                </Link>
              </li>
            );
          })}

          {/* More menu */}
          <li className="flex-1">
            <Popover open={moreOpen} onOpenChange={setMoreOpen}>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    'flex flex-col items-center gap-0.5 py-1.5 sm:py-2 rounded-lg transition-colors w-full',
                    'hover:bg-accent focus-visible:bg-accent',
                    isSecondaryActive ? 'text-primary font-medium' : 'text-muted-foreground',
                  )}
                  aria-label="More pages"
                >
                  <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                  <span className={cn('text-[10px] sm:text-xs leading-tight', !isSecondaryActive && 'hidden sm:block')}>More</span>
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" side="top" className="w-48 p-1" sideOffset={8}>
                {secondaryNavItems.map(({ to, label, icon: Icon }) => {
                  const active = location.pathname === to;
                  return (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMoreOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors',
                        'hover:bg-accent',
                        active ? 'text-primary font-medium bg-accent/50' : 'text-foreground',
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {label}
                    </Link>
                  );
                })}
              </PopoverContent>
            </Popover>
          </li>
        </ul>
      </nav>
    </div>
  );
}
