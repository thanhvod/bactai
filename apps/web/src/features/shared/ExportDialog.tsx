import * as React from 'react';
import { useMutation } from '@apollo/client/react';
import { Download, FileSpreadsheet, FileText, Printer } from 'lucide-react';
import { Banner, Button, Dialog, EmptyState, SegmentedControl, Skeleton, toast } from '@bta/shadcn';
import { apolloErrorMessage } from '@/lib/apollo';
import { IoExportFileMutation, IoRenderDocumentMutation } from './graphql-io';

/** Mẫu xuất Excel hỗ trợ bởi API (exports.service EXPORT_TEMPLATES). */
export type ExportTemplate =
  | 'ORDERS'
  | 'CUSTOMER_DEBT'
  | 'PAYROLL'
  | 'COD_HELD'
  | 'EXPENSES'
  | 'PAYMENTS'
  | 'CUSTOMERS'
  | 'VEHICLES'
  | 'DRIVERS'
  | 'SUPPLIERS'
  | 'REPORT_PROFIT';

/** Mẫu in PDF (documents.service DOCUMENT_TEMPLATES). */
export type DocumentTemplate = 'DELIVERY_NOTE' | 'DISPATCH_NOTE' | 'TRIP_COST_SHEET' | 'DRIVER_RECONCILIATION' | 'PAYROLL' | 'PAYSLIP' | 'DEBT_STATEMENT';

export const DOCUMENT_TEMPLATE_LABEL: Record<DocumentTemplate, string> = {
  DELIVERY_NOTE: 'Phiếu giao hàng',
  DISPATCH_NOTE: 'Phiếu điều xe',
  TRIP_COST_SHEET: 'Bảng chi phí chuyến',
  DRIVER_RECONCILIATION: 'Bảng đối soát tài xế',
  PAYROLL: 'Bảng lương',
  PAYSLIP: 'Phiếu lương',
  DEBT_STATEMENT: 'Bảng kê công nợ',
};

function openUrl(url: string) {
  window.open(url, '_blank', 'noopener');
}

/** Xuất Excel 1 chạm: gọi exportFile rồi mở link tải (signed URL ngắn hạn). */
export function useExportFile() {
  const [run, { loading }] = useMutation(IoExportFileMutation);
  const exportFile = React.useCallback(
    async (template: ExportTemplate, filter?: Record<string, unknown>) => {
      try {
        const res = await run({ variables: { input: { template, filter: filter ?? {} } } });
        const f = res.data?.exportFile;
        if (!f) return;
        toast.success(`Đã xuất ${f.rowCount} dòng · ${f.fileName}`);
        openUrl(f.url);
      } catch (e) {
        toast.error(apolloErrorMessage(e));
      }
    },
    [run],
  );
  return { exportFile, exporting: loading };
}

/** Nút "Xuất Excel" dùng chung cho list/report. */
export function ExportButton({ template, filter, label = 'Xuất Excel', size, variant = 'secondary' }: { template: ExportTemplate; filter?: Record<string, unknown>; label?: string; size?: 'sm' | 'md'; variant?: 'secondary' | 'ghost' }) {
  const { exportFile, exporting } = useExportFile();
  return (
    <Button variant={variant} size={size} disabled={exporting} onClick={() => void exportFile(template, filter)}>
      <FileSpreadsheet /> {exporting ? 'Đang xuất…' : label}
    </Button>
  );
}

export interface PrintOption {
  template: DocumentTemplate;
  entityId: string;
  label?: string;
  from?: string;
  to?: string;
}

/**
 * WM-SHELL-05 — Xem trước bản in (HTML) và tải PDF. Có thể kèm tùy chọn xuất Excel.
 * PDF được API lưu thành chứng từ PRINT_DOCUMENT/ DEBT_STATEMENT_PDF và trả link tải ngắn hạn.
 */
export function ExportDialog({
  open,
  onOpenChange,
  title = 'Xuất / in',
  documents = [],
  excel,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title?: React.ReactNode;
  documents?: PrintOption[];
  excel?: { template: ExportTemplate; filter?: Record<string, unknown>; label?: string };
}) {
  const [index, setIndex] = React.useState(0);
  const [html, setHtml] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [render, { loading }] = useMutation(IoRenderDocumentMutation);
  const [pdfLoading, setPdfLoading] = React.useState(false);
  const { exportFile, exporting } = useExportFile();
  const frame = React.useRef<HTMLIFrameElement>(null);
  const doc = documents[index];

  React.useEffect(() => {
    if (!open || !doc) return;
    let alive = true;
    setHtml(null);
    setError(null);
    render({ variables: { input: { template: doc.template, entityId: doc.entityId, from: doc.from, to: doc.to, format: 'HTML' } } })
      .then((r) => alive && setHtml(r.data?.renderDocument.html ?? ''))
      .catch((e) => alive && setError(apolloErrorMessage(e)));
    return () => {
      alive = false;
    };
  }, [open, doc?.template, doc?.entityId, doc?.from, doc?.to]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (!open) setIndex(0);
  }, [open]);

  const downloadPdf = async () => {
    if (!doc) return;
    setPdfLoading(true);
    try {
      const r = await render({ variables: { input: { template: doc.template, entityId: doc.entityId, from: doc.from, to: doc.to, format: 'PDF' } } });
      const url = r.data?.renderDocument.url;
      if (url) openUrl(url);
      toast.success(`Đã tạo PDF · ${r.data?.renderDocument.fileName ?? ''}`);
    } catch (e) {
      toast.error(apolloErrorMessage(e));
    } finally {
      setPdfLoading(false);
    }
  };

  const printHtml = () => frame.current?.contentWindow?.print();

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      size="lg"
      footer={
        <>
          {excel ? (
            <Button variant="secondary" disabled={exporting} onClick={() => void exportFile(excel.template, excel.filter)}>
              <FileSpreadsheet /> {excel.label ?? 'Tải Excel'}
            </Button>
          ) : null}
          {doc ? (
            <>
              <Button variant="secondary" disabled={!html} onClick={printHtml}>
                <Printer /> In
              </Button>
              <Button disabled={pdfLoading} onClick={() => void downloadPdf()}>
                <Download /> {pdfLoading ? 'Đang tạo PDF…' : 'Tải PDF'}
              </Button>
            </>
          ) : null}
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {documents.length > 1 ? (
          <SegmentedControl value={String(index)} onChange={(v) => setIndex(Number(v))} items={documents.map((d, i) => ({ value: String(i), label: d.label ?? DOCUMENT_TEMPLATE_LABEL[d.template] }))} />
        ) : null}
        {!doc ? (
          <EmptyState compact icon={<FileText strokeWidth={1.5} />} message="Chọn định dạng xuất ở dưới" />
        ) : error ? (
          <Banner tone="danger" message={error} />
        ) : loading && !html ? (
          <div className="flex flex-col gap-2">
            <Skeleton h={24} w="40%" />
            <Skeleton h={320} />
          </div>
        ) : (
          <iframe ref={frame} title="Xem trước bản in" srcDoc={html ?? ''} className="h-[60vh] w-full rounded-md border border-border bg-white" />
        )}
      </div>
    </Dialog>
  );
}
