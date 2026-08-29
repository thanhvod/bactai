import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Building2,
  CalendarClock,
  HandCoins,
  IdCard,
  LayoutDashboard,
  Package,
  Settings,
  Truck,
  Users,
  Wallet,
} from 'lucide-react';

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

/** Menu theo domain nghiệp vụ phase 1 (docs/06-scope-phase-1.md) */
export const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { title: 'Tổng quan', url: '/', icon: LayoutDashboard },
      { title: 'Đơn hàng', url: '/orders', icon: Package },
      { title: 'Điều phối', url: '/dispatch', icon: CalendarClock },
    ],
  },
  {
    label: 'Danh mục',
    items: [
      { title: 'Khách hàng', url: '/customers', icon: Users },
      { title: 'Xe', url: '/vehicles', icon: Truck },
      { title: 'Tài xế', url: '/drivers', icon: IdCard },
      { title: 'Nhà cung cấp', url: '/suppliers', icon: Building2 },
    ],
  },
  {
    label: 'Tài chính',
    items: [
      { title: 'Thu chi & công nợ', url: '/finance', icon: Wallet },
      { title: 'Lương tài xế', url: '/payroll', icon: HandCoins },
    ],
  },
  {
    label: 'Khác',
    items: [
      { title: 'Báo cáo', url: '/reports', icon: BarChart3 },
      { title: 'Cài đặt', url: '/settings', icon: Settings },
    ],
  },
];
