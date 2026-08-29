import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { Card, CardContent, CardHeader, CardTitle, Input } from '@bta/shadcn';
import { useState } from 'react';
import { formatMoney } from '../../lib/format';
import { Field, PageHeader } from '../components/page-shell';

const PNL = gql`
  query Pnl($from: DateTime!, $to: DateTime!) {
    pnl(from: $from, to: $to) {
      revenue collected expense profit orderCount tripCount
    }
  }
`;

function firstOfMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ReportsPage() {
  const [from, setFrom] = useState(firstOfMonth());
  const [to, setTo] = useState(today());
  const { data, loading } = useQuery<any>(PNL, {
    variables: {
      from: new Date(from).toISOString(),
      to: new Date(to + 'T23:59:59').toISOString(),
    },
  });

  const p = data?.pnl;
  const cards: [string, string, string?][] = p
    ? [
        ['Doanh thu (giá cước + dịch vụ)', formatMoney(p.revenue)],
        ['Thực thu từ khách', formatMoney(p.collected), 'không gồm tiền tài xế nộp COD'],
        ['Tổng chi phí', formatMoney(p.expense), 'không gồm ứng lương'],
        ['Lãi / lỗ', formatMoney(p.profit)],
        ['Số đơn', String(p.orderCount)],
        ['Số chuyến', String(p.tripCount)],
      ]
    : [];

  return (
    <div>
      <PageHeader title="Báo cáo kinh doanh" />
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Field label="Từ ngày"><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
        <Field label="Đến ngày"><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
      </div>
      {loading && !p ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {cards.map(([label, value, hint]) => (
            <Card key={label}>
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-normal text-muted-foreground">{label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-semibold">{value}</div>
                {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <p className="mt-4 text-xs text-muted-foreground">
        Doanh thu tính theo đơn tạo trong kỳ (trừ đơn hủy). Phiếu thu loại "tài xế nộp COD" là thu hồi
        phải thu — không được cộng vào doanh thu (docs/04 mục 3.2).
      </p>
    </div>
  );
}
