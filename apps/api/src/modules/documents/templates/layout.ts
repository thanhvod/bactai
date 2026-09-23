import { formatDate, formatDateTime, formatVnd } from '@bta/shared';

export const esc = (v: unknown): string =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const money = (v: number | bigint | null | undefined) => esc(formatVnd(v ?? 0));
export const date = (v: Date | string | null | undefined) => esc(v ? formatDate(v) : '');
export const dateTime = (v: Date | string | null | undefined) => esc(v ? formatDateTime(v) : '');

export interface MerchantHeader {
  name: string;
  legalName?: string | null;
  taxCode?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface Column<T> {
  label: string;
  value: (row: T, index: number) => string;
  align?: 'left' | 'right' | 'center';
  width?: string;
}

export function table<T>(rows: T[], cols: Column<T>[], footer?: string): string {
  return `<table class="grid"><thead><tr>${cols
    .map((c) => `<th style="text-align:${c.align ?? 'left'};${c.width ? `width:${c.width}` : ''}">${esc(c.label)}</th>`)
    .join('')}</tr></thead><tbody>${
    rows.length
      ? rows.map((r, i) => `<tr>${cols.map((c) => `<td style="text-align:${c.align ?? 'left'}">${c.value(r, i)}</td>`).join('')}</tr>`).join('')
      : `<tr><td colspan="${cols.length}" class="muted" style="text-align:center">Không có dữ liệu</td></tr>`
  }</tbody>${footer ?? ''}</table>`;
}

export function kv(items: [string, string][]): string {
  return `<table class="kv">${items.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${v}</td></tr>`).join('')}</table>`;
}

export function signatures(labels: string[]): string {
  return `<div class="sign">${labels.map((l) => `<div><b>${esc(l)}</b><br/><i>(Ký, ghi rõ họ tên)</i></div>`).join('')}</div>`;
}

/** Khung chung A4: header nhà xe (teal), tiêu đề, meta; tối giản đen trắng. */
export function layout(input: { merchant: MerchantHeader; title: string; code?: string | null; subtitle?: string; body: string; landscape?: boolean }): string {
  const m = input.merchant;
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"/><title>${esc(input.title)} ${esc(input.code ?? '')}</title>
<style>
  *{box-sizing:border-box} body{font-family:Inter,"Segoe UI",Roboto,Arial,sans-serif;font-size:11px;color:#17202A;margin:0}
  .head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0F766E;padding-bottom:8px;margin-bottom:12px}
  .brand{font-size:15px;font-weight:700;color:#0F766E}.muted{color:#5B6673}
  h1{font-size:18px;margin:6px 0 2px;text-align:center;letter-spacing:.3px}.sub{text-align:center;color:#5B6673;margin-bottom:12px}
  table{border-collapse:collapse;width:100%}
  table.grid th{background:#F1F4F7;border:1px solid #C3CCD6;padding:5px 6px;font-weight:600;font-size:10.5px}
  table.grid td{border:1px solid #DDE3EA;padding:4px 6px;vertical-align:top;font-variant-numeric:tabular-nums}
  table.grid tfoot td{font-weight:700;background:#F7F8FA;border:1px solid #C3CCD6}
  table.kv{margin-bottom:10px} table.kv th{text-align:left;font-weight:500;color:#5B6673;width:28%;padding:2px 0} table.kv td{padding:2px 0}
  .section{margin:12px 0 6px;font-weight:700;font-size:12px;color:#0F766E}
  .sign{display:flex;justify-content:space-around;margin-top:28px;text-align:center}.sign div{min-width:160px;height:90px}
  .num{text-align:right;font-variant-numeric:tabular-nums}.total{font-size:13px;font-weight:700}
  .note{margin-top:8px;font-size:10px;color:#5B6673}
</style></head><body>
<div class="head"><div><div class="brand">${esc(m.name)}</div>${m.legalName ? `<div>${esc(m.legalName)}</div>` : ''}${
    m.address ? `<div class="muted">${esc(m.address)}</div>` : ''
  }</div><div style="text-align:right" class="muted">${m.taxCode ? `MST: ${esc(m.taxCode)}<br/>` : ''}${m.phone ? `ĐT: ${esc(m.phone)}<br/>` : ''}${
    m.email ? esc(m.email) : ''
  }</div></div>
<h1>${esc(input.title)}</h1><div class="sub">${input.code ? `Số: <b>${esc(input.code)}</b>` : ''}${input.subtitle ? ` · ${esc(input.subtitle)}` : ''}</div>
${input.body}
<div class="note">In lúc ${dateTime(new Date())} từ hệ thống BTA.</div>
</body></html>`;
}
