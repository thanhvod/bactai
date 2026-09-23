import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MoneyInput, SensitiveActionModal, StatusBadge, TooltipProvider } from '@bta/shadcn';
import { ORDER_STATUS } from '@bta/shared';

describe('StatusBadge', () => {
  it('hiển thị label tiếng Việt từ meta', () => {
    render(<StatusBadge meta={ORDER_STATUS} status="IN_PROGRESS" />);
    expect(screen.getByText('Đang thực hiện')).toBeInTheDocument();
  });
  it('fallback key khi không có meta', () => {
    render(<StatusBadge status="UNKNOWN" />);
    expect(screen.getByText('UNKNOWN')).toBeInTheDocument();
  });
});

describe('MoneyInput', () => {
  it('format dấu chấm nghìn và trả về số nguyên', () => {
    const onChange = vi.fn();
    render(<MoneyInput value={null} onChange={onChange} aria-label="tiền" />);
    const input = screen.getByLabelText('tiền') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1250000' } });
    expect(onChange).toHaveBeenLastCalledWith(1250000);
    expect(input.value).toBe('1.250.000');
  });
  it('rỗng → null', () => {
    const onChange = vi.fn();
    render(<MoneyInput value={5000} onChange={onChange} aria-label="tiền" />);
    fireEvent.change(screen.getByLabelText('tiền'), { target: { value: '' } });
    expect(onChange).toHaveBeenLastCalledWith(null);
  });
});

describe('SensitiveActionModal', () => {
  it('chặn xác nhận khi lý do quá ngắn, cho qua khi đủ', async () => {
    const onConfirm = vi.fn();
    render(
      <TooltipProvider>
        <SensitiveActionModal open onOpenChange={() => undefined} action="Hủy đơn" onConfirm={onConfirm} confirmLabel="Xác nhận" />
      </TooltipProvider>,
    );
    const btn = screen.getByRole('button', { name: 'Xác nhận' });
    fireEvent.click(btn);
    expect(onConfirm).not.toHaveBeenCalled();
    expect(await screen.findByText(/Lý do tối thiểu/)).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/Ví dụ/), { target: { value: 'Khách đổi lịch sản xuất' } });
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận' }));
    expect(onConfirm).toHaveBeenCalledWith('Khách đổi lịch sản xuất');
  });
});
