// Modern Animated Card Component
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
  gradient?: boolean;
}

export function AnimatedCard({ 
  children, 
  className, 
  delay = 0,
  hover = true,
  gradient = false 
}: AnimatedCardProps) {
  return (
    <div
      className={cn(
        'card-modern p-6',
        'animate-fade-in-up',
        hover && 'hover-lift',
        gradient && 'card-gradient',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

