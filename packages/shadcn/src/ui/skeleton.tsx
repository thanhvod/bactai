import { cn } from '../lib/utils';

export function Skeleton({ className, w, h, style }: { className?: string; w?: number | string; h?: number | string; style?: React.CSSProperties }) {
  return <div className={cn('animate-pulse rounded-sm bg-neutral-soft', className)} style={{ width: w, height: h ?? 12, ...style }} aria-hidden />;
}

/** Skeleton cho detail page: header + 2 khối */
export function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy>
      <Skeleton w={260} h={22} />
      <Skeleton w={380} />
      <div className="grid grid-cols-3 gap-3">
        <Skeleton h={64} /> <Skeleton h={64} /> <Skeleton h={64} />
      </div>
      <Skeleton h={200} />
    </div>
  );
}
