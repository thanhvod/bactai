import * as React from 'react';

/** Phân trang cursor đơn giản: giữ stack cursor để quay lại trang trước. */
export function useCursorPage(pageSize = 20, resetKey = '') {
  const [stack, setStack] = React.useState<(string | null)[]>([null]);
  React.useEffect(() => setStack([null]), [resetKey]);
  const after = stack[stack.length - 1];
  return {
    variables: { first: pageSize, after },
    hasPrev: stack.length > 1,
    next: (endCursor: string | null | undefined) => endCursor && setStack((s) => [...s, endCursor]),
    prev: () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
    pageSize,
  };
}
