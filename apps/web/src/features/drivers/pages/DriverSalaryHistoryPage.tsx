import DriverDetailPage from './DriverDetailPage';

/** WM-DRV-04 — Lịch sử lương cố định: route riêng `/drivers/:driverId/salary-history`, hiển thị như tab "Lương / ứng" của chi tiết tài xế. */
export default function DriverSalaryHistoryPage() {
  return <DriverDetailPage forceTab="salary" />;
}
