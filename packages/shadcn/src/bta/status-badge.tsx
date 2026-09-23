import * as React from 'react';
import { Lock } from 'lucide-react';
import { labelOf, toneOf, type EnumMeta, type Tone } from '@bta/shared';
import { Badge } from '../ui/badge';

export interface StatusBadgeProps {
  /** Bảng meta từ @bta/shared (ORDER_STATUS, TRIP_STATUS...) */
  meta?: Record<string, EnumMeta>;
  status?: string | null;
  /** Hoặc truyền thẳng label/tone */
  label?: React.ReactNode;
  tone?: Tone;
  icon?: React.ReactNode;
  outline?: boolean;
  className?: string;
}

/** Badge trạng thái — luôn có chữ, không dùng màu làm tín hiệu duy nhất. "Đã chốt" thêm icon khóa. */
export function StatusBadge({ meta, status, label, tone, icon, outline, className }: StatusBadgeProps) {
  const text = label ?? (meta ? labelOf(meta, status) : status ?? '');
  const t = tone ?? (meta ? toneOf(meta, status) : 'neutral');
  const autoIcon = icon ?? (status === 'FINALIZED' ? <Lock /> : null);
  return (
    <Badge tone={t} outline={outline || undefined} className={className}>
      {autoIcon}
      {text}
    </Badge>
  );
}
