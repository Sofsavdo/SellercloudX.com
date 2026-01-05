// Skeleton Loader Component
import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  className?: string;
  lines?: number;
  rounded?: boolean;
}

export function SkeletonLoader({ className, lines = 1, rounded = false }: SkeletonLoaderProps) {
  if (lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'skeleton h-4 w-full',
              rounded && 'rounded-full'
            )}
            style={{ width: i === lines - 1 ? '75%' : '100%' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'skeleton h-4 w-full',
        rounded && 'rounded-full',
        className
      )}
    />
  );
}

