import * as React from 'react';
import { FileText, Image as ImageIcon, Paperclip, X } from 'lucide-react';
import { Button, cn, toast } from '@bta/shadcn';
import { uploadAttachment, type UploadTarget } from '@/lib/upload';

export interface PendingFile {
  id: string;
  file: File;
  progress: number;
  status: 'queued' | 'uploading' | 'done' | 'error';
  error?: string;
}

const MAX_MB = 20;

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Chọn chứng từ ngay trong form tạo (chưa có id thực thể): file giữ trong state, tải lên sau khi lưu phiếu
 * bằng `uploadPendingFiles`. Kéo thả hoặc chọn file; xem trước tên/kích thước; xóa được trước khi lưu.
 */
export function PendingAttachments({
  files,
  onChange,
  disabled,
  accept = 'image/*,application/pdf',
  label = 'Kéo thả hoặc chọn ảnh/PDF chứng từ',
}: {
  files: PendingFile[];
  onChange: (next: PendingFile[]) => void;
  disabled?: boolean;
  accept?: string;
  label?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [drag, setDrag] = React.useState(false);

  const add = (list: FileList | File[]) => {
    const next: PendingFile[] = [];
    for (const f of Array.from(list)) {
      if (f.size > MAX_MB * 1024 * 1024) {
        toast.error(`"${f.name}" vượt ${MAX_MB} MB`);
        continue;
      }
      next.push({ id: `${f.name}-${f.size}-${Math.random().toString(36).slice(2, 8)}`, file: f, progress: 0, status: 'queued' });
    }
    if (next.length) onChange([...files, ...next]);
  };

  return (
    <div className="col-span-full flex flex-col gap-2">
      <div
        role="button"
        tabIndex={0}
        aria-label={label}
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (!disabled) add(e.dataTransfer.files);
        }}
        className={cn(
          'flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong px-4 py-4 text-body-sm text-text-muted',
          drag && 'border-primary bg-primary-soft',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      >
        <Paperclip className="size-4" />
        {label}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          data-testid="pending-attachments-input"
          onChange={(e) => {
            if (e.target.files) add(e.target.files);
            e.target.value = '';
          }}
        />
      </div>
      {files.length ? (
        <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {files.map((f) => (
            <li key={f.id} className="flex items-center gap-3 px-3 py-2 text-body-sm">
              {f.file.type.startsWith('image/') ? <ImageIcon className="size-4 text-text-muted" /> : <FileText className="size-4 text-text-muted" />}
              <span className="min-w-0 flex-1 truncate">{f.file.name}</span>
              <span className="text-caption text-text-subtle tabular-nums">{formatSize(f.file.size)}</span>
              {f.status === 'uploading' ? <span className="text-caption text-info tabular-nums">{f.progress}%</span> : null}
              {f.status === 'done' ? <span className="text-caption text-success">Đã tải</span> : null}
              {f.status === 'error' ? <span className="text-caption text-danger" title={f.error}>Lỗi</span> : null}
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Bỏ ${f.file.name}`}
                disabled={disabled || f.status === 'uploading'}
                onClick={() => onChange(files.filter((x) => x.id !== f.id))}
              >
                <X className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/**
 * Tải tuần tự các file chờ lên thực thể vừa tạo. Lỗi từng file không ném ra — trả số file lỗi để form báo cảnh báo.
 */
export async function uploadPendingFiles(
  files: PendingFile[],
  target: UploadTarget,
  onUpdate: (next: PendingFile[]) => void,
): Promise<{ failed: number }> {
  let state = files.map((f) => ({ ...f }));
  const set = (id: string, patch: Partial<PendingFile>) => {
    state = state.map((f) => (f.id === id ? { ...f, ...patch } : f));
    onUpdate(state);
  };
  let failed = 0;
  for (const f of files) {
    if (f.status === 'done') continue;
    set(f.id, { status: 'uploading', progress: 0, error: undefined });
    try {
      await uploadAttachment(f.file, target, (p) => set(f.id, { progress: p }));
      set(f.id, { status: 'done', progress: 100 });
    } catch (e) {
      failed++;
      set(f.id, { status: 'error', error: e instanceof Error ? e.message : 'Tải lên thất bại' });
    }
  }
  return { failed };
}

export function warnUploadFailures(failed: number) {
  if (failed > 0) toast.warning(`Tạo phiếu xong nhưng ${failed} file tải lên lỗi — thử lại ở tab Chứng từ`);
}
