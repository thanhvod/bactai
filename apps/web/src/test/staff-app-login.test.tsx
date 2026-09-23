import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing/react';
import { TooltipProvider } from '@bta/shadcn';
import { StaffAppLoginSection, normalizeVnMobile } from '@/features/settings/components/StaffAppLoginSection';

const base: { phone: string | null; hasPassword: boolean; mustChangePassword: boolean; lastLoginAt: string | null; sharedWithOtherMerchants: boolean } = { phone: '0911000002', hasPassword: true, mustChangePassword: false, lastLoginAt: null, sharedWithOtherMerchants: false };

function renderSection(appLogin = base) {
  return render(
    <MockedProvider mocks={[]}>
      <TooltipProvider>
        <StaffAppLoginSection userId="u1" userName="Điều phối Demo" appLogin={appLogin} onChanged={() => undefined} />
      </TooltipProvider>
    </MockedProvider>,
  );
}

describe('Đăng nhập App Merchant (D-014)', () => {
  it('chuẩn hóa SĐT di động VN', () => {
    expect(normalizeVnMobile('+84 911 000 002')).toBe('0911000002');
    expect(normalizeVnMobile('84911000002')).toBe('0911000002');
    expect(normalizeVnMobile('0211000002')).toBeNull();
    expect(normalizeVnMobile('123')).toBeNull();
  });

  it('đã có mật khẩu: hiện SĐT, nút đặt lại + tắt đăng nhập', () => {
    renderSection();
    expect(screen.getByText('0911000002')).toBeInTheDocument();
    expect(screen.getByText('Đang dùng app')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Đặt lại mật khẩu app/ })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Tắt đăng nhập app/ })).toBeEnabled();
  });

  it('tài khoản thuộc nhà xe khác: khóa thao tác, hướng dẫn tự đặt', () => {
    renderSection({ ...base, sharedWithOtherMerchants: true });
    expect(screen.getByText(/nhân viên tự đặt mật khẩu app trong menu tài khoản/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Đặt lại mật khẩu app/ })).toBeDisabled();
  });

  it('chưa có mật khẩu: nút "Cấp mật khẩu app", không có nút tắt', () => {
    renderSection({ ...base, phone: null, hasPassword: false });
    expect(screen.getByText('Chưa có mật khẩu app')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cấp mật khẩu app/ })).toBeEnabled();
    expect(screen.queryByRole('button', { name: /Tắt đăng nhập app/ })).toBeNull();
  });
});
