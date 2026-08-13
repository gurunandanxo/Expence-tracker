import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'cyan' | 'pink' | 'violet';
}

export default function GlassCard({ children, className, hover = true, glow }: GlassCardProps) {
  return (
    <div
      className={cn(
        'glass-panel p-5',
        hover && 'glass-panel-hover',
        glow === 'cyan' && 'glow-cyan',
        glow === 'pink' && 'glow-pink',
        glow === 'violet' && 'glow-violet',
        className
      )}
    >
      {children}
    </div>
  );
}
