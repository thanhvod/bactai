import { Truck } from 'lucide-react';
import { cn } from '../lib/utils';

/** Logo tạm: xe tải trắng trên ô primary. */
export function Logo({ withText = true, size = 28, className }: { withText?: boolean; size?: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground" style={{ width: size, height: size }}>
        <Truck style={{ width: size * 0.6, height: size * 0.6 }} />
      </span>
      {withText ? <span className="text-[17px] font-bold leading-none text-text">BTA</span> : null}
    </span>
  );
}
