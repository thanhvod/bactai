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
import '../orders/order_detail_page.dart' show webUrl;
import '../orders/order_list_page.dart' show OrderCard;

class CustomerDetailData {
  const CustomerDetailData(this.customer, this.recentOrders);
  final CustomerItem customer;
  final List<OrderItem> recentOrders;
}

/// MA-CUS-02 — công nợ, đơn gần đây, địa chỉ; tạo đơn nhanh.
class CustomerDetailPage extends StatelessWidget {
  const CustomerDetailPage({super.key, required this.customerId});
  final String customerId;

  @override
  Widget build(BuildContext context) {
    final scope = AppScope.of(context);
    return Scaffold(
      appBar: MobileHeader(title: 'Chi tiết khách', onBack: context.canPop() ? () => context.pop() : null),
      body: AsyncView<CustomerDetailData>(
        load: () async {
          final r = await Future.wait([scope.repository.customer(customerId), scope.repository.recentOrdersOfCustomer(customerId)]);
          return CustomerDetailData(r[0] as CustomerItem, r[1] as List<OrderItem>);
        },
        builder: (context, d, _) {
          final c = d.customer;
          return ListView(padding: const EdgeInsets.all(BtaSpace.s4), children: [
            Text(c.name, style: BtaText.headingLg),
            Text([c.code, c.phone].whereType<String>().join(' · '), style: BtaText.bodySm.copyWith(color: BtaColors.textMuted)),
            for (final w in c.warnings) WarningLine(w),
            const SizedBox(height: BtaSpace.s3),
            Row(children: [
              if (c.phone != null) Expanded(child: OutlinedButton.icon(onPressed: () => callPhone(context, c.phone), icon: const Icon(Icons.call_outlined), label: const Text('Gọi khách'))),
              if (c.phone != null && scope.auth.can(Perm.orderCreate)) const SizedBox(width: BtaSpace.s2),
              if (scope.auth.can(Perm.orderCreate))
                Expanded(child: FilledButton.icon(onPressed: () => context.go('${MerchantRoutes.pOrderNew}?customerId=${c.id}'), icon: const Icon(Icons.add), label: const Text('Tạo đơn'))),
            ]),
            const SizedBox(height: BtaSpace.s3),
            SectionCard(
              title: 'Công nợ',
              trailing: TextButton(onPressed: () => launchUrl(Uri.parse('$webUrl/customers/${c.id}?tab=debt'), mode: LaunchMode.externalApplication), child: const Text('Chi tiết trên web')),
              child: Column(children: [
                MoneyRow('Còn nợ', c.remaining, strong: true, tone: c.remaining > 0 ? BtaColors.warning : null),
                MoneyRow('Quá hạn', c.overdueAmount, tone: c.overdueAmount > 0 ? BtaColors.danger : null),
                if (c.maxOverdueDays > 0) InfoRow('Quá hạn lâu nhất', '${c.maxOverdueDays} ngày'),
                MoneyRow('Số dư chưa phân bổ', c.creditBalance),
                if (c.creditLimit != null) MoneyRow('Hạn mức nợ', c.creditLimit!),
                if (c.defaultDebtDays != null) InfoRow('Số ngày công nợ', '${c.defaultDebtDays} ngày'),
              ]),
            ),
            const SizedBox(height: BtaSpace.s3),
            const Text('Đơn gần đây', style: BtaText.headingSm),
            const SizedBox(height: BtaSpace.s2),
            if (d.recentOrders.isEmpty) const EmptyState(message: 'Chưa có đơn') else for (final o in d.recentOrders) Padding(padding: const EdgeInsets.only(bottom: BtaSpace.s2), child: OrderCard(order: o)),
            const SizedBox(height: BtaSpace.s3),
            SectionCard(
              title: 'Địa chỉ thường dùng (${c.locations.length})',
              child: c.locations.isEmpty
                  ? Text('Chưa có địa chỉ', style: BtaText.bodySm.copyWith(color: BtaColors.textMuted))
                  : Column(children: [
                      for (final l in c.locations)
                        ListTile(
                          contentPadding: EdgeInsets.zero,
                          title: Text(l.name + (l.isDefault ? ' (mặc định)' : '')),
                          subtitle: Text([l.address, [l.contactName, l.contactPhone].whereType<String>().join(' · ')].where((e) => e.isNotEmpty).join('\n')),
                          trailing: l.contactPhone == null ? null : IconButton(tooltip: 'Gọi', icon: const Icon(Icons.call_outlined), onPressed: () => callPhone(context, l.contactPhone)),
                        ),
                    ]),
            ),
          ]);
        },
      ),
    );
  }
}
