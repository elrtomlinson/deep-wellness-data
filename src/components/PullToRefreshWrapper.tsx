import { ReactNode } from 'react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { Loader2, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshWrapperProps {
  onRefresh: () => void | Promise<void>;
  children: ReactNode;
  className?: string;
}

export function PullToRefreshWrapper({ onRefresh, children, className }: PullToRefreshWrapperProps) {
  const { containerRef, pulling, pullDistance, refreshing, isTriggered } = usePullToRefresh({
    onRefresh,
    threshold: 70,
    maxPull: 110,
  });

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-y-auto', className)}
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {/* Pull indicator */}
      <div
        className={cn(
          'absolute left-0 right-0 top-0 flex items-center justify-center z-20 pointer-events-none transition-opacity',
          (pulling || refreshing) ? 'opacity-100' : 'opacity-0',
        )}
        style={{ height: `${Math.max(pullDistance, refreshing ? 48 : 0)}px` }}
      >
        <div className={cn(
          'w-9 h-9 rounded-full bg-card border border-border shadow-md flex items-center justify-center transition-transform',
          isTriggered && 'scale-110',
        )}>
          {refreshing ? (
            <Loader2 className="h-4 w-4 text-primary animate-spin" />
          ) : (
            <ArrowDown className={cn(
              'h-4 w-4 text-muted-foreground transition-transform duration-200',
              isTriggered && 'text-primary rotate-180',
            )} />
          )}
        </div>
      </div>

      {/* Content with transform */}
      <div
        style={{
          transform: pulling || refreshing
            ? `translateY(${refreshing ? 48 : pullDistance}px)`
            : 'translateY(0)',
          transition: pulling ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
}
