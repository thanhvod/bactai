import type { LucideIcon } from 'lucide-react';
import { BarChart3, Building2, ClipboardList, Landmark, LayoutDashboard, Route, Settings, Truck, UserRound, Users, Wallet } from 'lucide-react';
import { PATHS } from '../routes';

export interface NavChild {
  label: string;
  to: string;
  badgeKey?: string;
  permission?: string;
  /** khớp chính xác path (Dashboard "/" ) */
  exact?: boolean;
}
export interface NavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  to: string;
  children?: NavChild[];
  badgeKey?: string;
  permission?: string;
  exact?: boolean;
}

/** 11 nhóm sidebar theo design WM-SHELL-01. */
export const NAV_ITEMS: NavItem[] = [
  {
    key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, to: PATHS.dashboard, exact: true, permission: 'dashboard.view',
    children: [
      { label: 'Tổng quan', to: PATHS.dashboard, exact: true },
      { label: 'Vận hành', to: PATHS.dashboardOperations },
      { label: 'Tài chính', to: PATHS.dashboardFinance, permission: 'finance.view' },
    ],
  },
  {
    key: 'orders', label: 'Đơn hàng', icon: ClipboardList, to: PATHS.orders, permission: 'order.view', badgeKey: 'bookings',
    children: [
      { label: 'Danh sách đơn', to: PATHS.orders },
      { label: 'Yêu cầu từ khách', to: PATHS.bookings, badgeKey: 'bookings' },
    ],
  },
  {
    key: 'dispatch', label: 'Điều phối', icon: Route, to: PATHS.dispatch, badgeKey: 'dispatch', permission: 'order.view',
    children: [
      { label: 'Bảng điều phối', to: PATHS.dispatch, exact: true },
      { label: 'Lịch xe / tài xế', to: PATHS.dispatchCalendar },
      { label: 'Cảnh báo lịch', to: PATHS.dispatchConflicts, badgeKey: 'dispatch' },
      { label: 'Theo dõi vị trí', to: PATHS.dispatchMap },
      { label: 'Sự cố', to: PATHS.incidents, badgeKey: 'incidents' },
    ],
  },
  { key: 'customers', label: 'Khách hàng', icon: Users, to: PATHS.customers, permission: 'customer.view' },
  { key: 'drivers', label: 'Tài xế', icon: UserRound, to: PATHS.drivers, permission: 'driver.view' },
  { key: 'vehicles', label: 'Xe', icon: Truck, to: PATHS.vehicles, permission: 'vehicle.view' },
  { key: 'suppliers', label: 'Nhà cung cấp', icon: Building2, to: PATHS.suppliers, permission: 'supplier.view' },
  {
    key: 'finance', label: 'Thu chi & Công nợ', icon: Wallet, to: PATHS.finance, badgeKey: 'finance', permission: 'debt.view',
    children: [
      { label: 'Sổ thu chi', to: PATHS.finance, exact: true, permission: 'finance.view' },
      { label: 'Phiếu thu', to: PATHS.payments, permission: 'finance.view' },
      { label: 'Phiếu chi', to: PATHS.expenses, permission: 'finance.view' },
      { label: 'Công nợ khách', to: PATHS.customerDebt, badgeKey: 'finance', permission: 'debt.view' },
      { label: 'Công nợ NCC', to: PATHS.supplierDebt, permission: 'supplierDebt.view' },
      { label: 'Bảng kê công nợ', to: PATHS.debtStatements, permission: 'debt.view' },
      { label: 'COD tài xế', to: PATHS.cod, badgeKey: 'cod', permission: 'driverLedger.view' },
      { label: 'Tạm ứng chuyến', to: PATHS.tripAdvances, permission: 'driverLedger.view' },
    ],
  },
  { key: 'payroll', label: 'Lương', icon: Landmark, to: PATHS.payroll, badgeKey: 'payroll', permission: 'payroll.view' },
  { key: 'reports', label: 'Báo cáo', icon: BarChart3, to: PATHS.reports, permission: 'report.view' },
  {
    key: 'settings', label: 'Cài đặt', icon: Settings, to: PATHS.settingsCompany, permission: 'settings.manage',
    children: [
      { label: 'Hồ sơ nhà xe', to: PATHS.settingsCompany, permission: 'settings.manage' },
      { label: 'Nhân viên', to: PATHS.settingsUsers, permission: 'users.manage' },
      { label: 'Vai trò & quyền', to: PATHS.settingsRoles, permission: 'users.manage' },
      { label: 'Cài đặt vận hành', to: PATHS.settingsOperations, permission: 'settings.manage' },
      { label: 'Mã tự động', to: PATHS.settingsNumbering, permission: 'settings.manage' },
      { label: 'Danh mục', to: PATHS.settingsCatalogs },
    ],
  },
];

export type NavBadges = Partial<Record<'dispatch' | 'incidents' | 'finance' | 'cod' | 'payroll' | 'bookings', number>>;
