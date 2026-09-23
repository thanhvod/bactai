import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/app_scope.dart';
import '../../core/permissions.dart';
import '../../core/router/routes.dart';
import '../../models/models.dart';
import '../../shared/async_view.dart';
import '../../shared/ui_helpers.dart';
import '../../shared/warning_line.dart';

/// URL Web Merchant để mở sửa chi tiết (`--dart-define=WEB_URL=...`).
const webUrl = String.fromEnvironment('WEB_URL', defaultValue: 'http://localhost:2002');

/// MA-ORD-02 — xem đơn, xác nhận đơn, phần chỉnh chi tiết làm trên web.
class OrderDetailPage extends StatefulWidget {
  const OrderDetailPage({super.key, required this.orderId});
  final String orderId;
  @override
  State<OrderDetailPage> createState() => _OrderDetailPageState();
}

class _OrderDetailPageState extends State<OrderDetailPage> {
  final _key = GlobalKey<AsyncViewState<OrderItem>>();

  @override
  Widget build(BuildContext context) {
    final scope = AppScope.of(context);
    return Scaffold(
      appBar: MobileHeader(title: 'Chi tiết đơn', onBack: context.canPop() ? () => context.pop() : null, actions: [
        IconButton(
          tooltip: 'Mở trên web để chỉnh',
          icon: const Icon(Icons.open_in_browser),
          onPressed: () => launchUrl(Uri.parse('$webUrl/orders/${widget.orderId}'), mode: LaunchMode.externalApplication),
        ),
      ]),
      body: AsyncView<OrderItem>(
        key: _key,
        load: () => scope.repository.order(widget.orderId),
        builder: (context, o, reload) => _Body(order: o, onChanged: reload),
      ),
    );
  }
}

class _Body extends StatelessWidget {
  const _Body({required this.order, required this.onChanged});
  final OrderItem order;
  final Future<void> Function() onChanged;

  @override
  Widget build(BuildContext context) {
    final o = order;
    final scope = AppScope.of(context);
    final canConfirm = scope.auth.can(Perm.orderUpdate) && (o.status == 'PENDING_CONFIRMATION' || o.status == 'DRAFT');
    final f = o.finance;
    return ListView(padding: const EdgeInsets.all(BtaSpace.s4), children: [
      Row(children: [Expanded(child: Text(o.code, style: BtaText.headingLg)), orderBadge(o.status, compact: false)]),
      const SizedBox(height: 4),
      Text('Ngày đơn ${BtaFormat.date(o.orderDate)}', style: BtaText.bodySm.copyWith(color: BtaColors.textMuted)),
      for (final w in o.warnings) WarningLine(w),
      if (canConfirm) ...[
        const SizedBox(height: BtaSpace.s3),
        SizedBox(
          height: BtaSize.tapTarget,
          child: FilledButton.icon(
            icon: const Icon(Icons.check),
            label: const Text('Xác nhận đơn'),
            onPressed: () async {
              final ok = await showConfirmBottomSheet(context, title: 'Xác nhận đơn ${o.code}?', message: 'Khách đã đồng ý giá. Sau khi xác nhận, sửa giá cước cần quyền và lý do.');
              if (!ok || !context.mounted) return;
              if (await runAction(context, () => scope.repository.updateOrderStatus(o.id, 'CONFIRMED'), success: 'Đã xác nhận đơn')) await onChanged();
            },
          ),
        ),
      ],
      const SizedBox(height: BtaSpace.s4),
      SectionCard(
        title: 'Khách hàng',
        trailing: o.customerPhone == null ? null : IconButton(tooltip: 'Gọi khách', icon: const Icon(Icons.call_outlined), onPressed: () => callPhone(context, o.customerPhone)),
        onTap: () => context.push(MerchantRoutes.customerDetailPath(o.customerId)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(o.customerName, style: BtaText.bodyStrong),
          if (o.customerPhone != null) Text(o.customerPhone!, style: BtaText.bodySm),
        ]),
      ),
      const SizedBox(height: BtaSpace.s3),
      SectionCard(
        title: 'Điểm lấy/trả (${o.stops.length})',
        child: Column(children: [
          for (final s in o.stops)
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: Icon(s.type == 'PICKUP' ? Icons.upload_outlined : Icons.download_outlined, color: s.type == 'PICKUP' ? BtaColors.info : BtaColors.primary),
              title: Text('${s.sequence}. ${s.locationName ?? s.address}'),
              subtitle: Text([s.address, if (s.codExpected != null) 'COD dự kiến ${BtaFormat.vnd(s.codExpected)}', if (s.podCount > 0) '${s.podCount} ảnh POD'].join('\n')),
              trailing: stopBadge(s.status),
            ),
        ]),
      ),
      if (o.cargo.isNotEmpty) ...[
        const SizedBox(height: BtaSpace.s3),
        SectionCard(title: 'Hàng hóa', child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [for (final c in o.cargo) Text(c, style: BtaText.body)])),
      ],
      const SizedBox(height: BtaSpace.s3),
      SectionCard(
        title: 'Chuyến (${o.trips.length})',
        child: o.trips.isEmpty
            ? Text('Chưa có chuyến — tạo và xếp xe trên Web Merchant.', style: BtaText.bodySm.copyWith(color: BtaColors.textMuted))
            : Column(children: [
                for (final t in o.trips)
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    onTap: () => context.push(MerchantRoutes.tripDetailPath(t.id)),
                    title: Text(t.code, style: BtaText.bodyStrong),
                    subtitle: Text([t.vehiclePlate, t.driverName].whereType<String>().join(' · ')),
                    trailing: tripBadge(t.status),
                  ),
              ]),
      ),
      if (f != null) ...[
        const SizedBox(height: BtaSpace.s3),
        SectionCard(
          title: 'Tài chính',
          child: Column(children: [
            MoneyRow('Tổng thu khách (cước + dịch vụ)', f.totalAmount, strong: true),
            MoneyRow('Đã thu (phân bổ)', f.paidAmount, tone: BtaColors.success),
            MoneyRow('Còn nợ', f.remainingAmount, tone: f.remainingAmount > 0 ? BtaColors.warning : null),
            if (o.dueDate != null) InfoRow('Hạn thanh toán', '${BtaFormat.date(o.dueDate)}${f.overdueDays > 0 ? ' · quá hạn ${f.overdueDays} ngày' : ''}'),
            const Divider(),
            MoneyRow('Chi phí', f.expenseTotal),
            MoneyRow(f.provisional ? 'Lãi/lỗ tạm tính' : 'Lãi/lỗ', f.profit, tone: f.profit < 0 ? BtaColors.danger : BtaColors.success, strong: true),
          ]),
        ),
      ],
      if (o.attachmentCount > 0) ...[
        const SizedBox(height: BtaSpace.s3),
        ListRow(icon: Icons.attach_file, label: 'Chứng từ', value: '${o.attachmentCount} tệp — xem ảnh POD trong chi tiết chuyến'),
      ],
      const SizedBox(height: BtaSpace.s6),
    ]);
  }
}
