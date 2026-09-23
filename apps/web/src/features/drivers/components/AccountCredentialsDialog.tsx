import * as React from 'react';
import { Copy, KeyRound } from 'lucide-react';
import { Banner, Button, DescriptionList, Dialog, toast } from '@bta/shadcn';

export interface Credentials {
  phone: string;
  tempPassword: string;
}

/** Hiển thị mật khẩu tạm của tài khoản app tài xế — CHỈ MỘT LẦN (API không lưu bản rõ). */
export function AccountCredentialsDialog({ credentials, driverName, onClose }: { credentials: Credentials | null; driverName?: string; onClose: () => void }) {
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => setCopied(false), [credentials]);
  const text = credentials ? `Tài khoản app BTA tài xế\nSĐT: ${credentials.phone}\nMật khẩu tạm: ${credentials.tempPassword}\n(Đăng nhập lần đầu sẽ được yêu cầu đổi mật khẩu)` : '';
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Đã sao chép thông tin đăng nhập');
    } catch {
      toast.error('Không sao chép được', 'Hãy chép tay mật khẩu bên dưới');
    }
  };
  return (
    <Dialog
      open={!!credentials}
      onOpenChange={(o) => !o && onClose()}
      title={
        <span className="flex items-center gap-2">
          <KeyRound className="size-4" /> Tài khoản app tài xế
        </span>
      }
      description={driverName}
      modalStrict
      footer={
        <>
          <Button variant="secondary" onClick={copy}>
            <Copy /> {copied ? 'Đã sao chép' : 'Sao chép'}
          </Button>
          <Button onClick={onClose}>Tôi đã lưu mật khẩu</Button>
        </>
      }
    >
      {credentials ? (
        <div className="flex flex-col gap-4">
          <Banner tone="warning" message="Mật khẩu tạm chỉ hiển thị một lần. Gửi cho tài xế qua kênh riêng (Zalo/điện thoại); nếu quên phải đặt lại." />
          <DescriptionList
            columns={2}
            items={[
              { label: 'Số điện thoại đăng nhập', value: <span className="font-mono text-heading-sm">{credentials.phone}</span> },
              { label: 'Mật khẩu tạm', value: <span className="select-all font-mono text-heading-sm tracking-wider">{credentials.tempPassword}</span> },
            ]}
          />
          <p className="text-body-sm text-text-muted">Tài xế đăng nhập app bằng số điện thoại và mật khẩu tạm, sau đó đổi mật khẩu mới. Không có OTP (D-009).</p>
        </div>
      ) : null}
    </Dialog>
  );
}
