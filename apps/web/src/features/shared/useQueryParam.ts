import * as React from 'react';
import { useSearchParams } from 'react-router';

/** Đọc/ghi 1 query param (tab, drawer ?timeline=1, ?attachment=:id) — giữ nguyên các param khác. */
export function useQueryParam(key: string): [string | null, (value: string | null) => void] {
  const [params, setParams] = useSearchParams();
  const value = params.get(key);
  const set = React.useCallback(
    (v: string | null) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (v === null || v === '') next.delete(key);
          else next.set(key, v);
          return next;
        },
        { replace: false },
      );
    },
    [key, setParams],
  );
  return [value, set];
}
