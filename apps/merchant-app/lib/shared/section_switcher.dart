import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../core/router/routes.dart';

/// Tab "Đơn/Chuyến": chuyển nhanh giữa Đơn hàng · Chuyến · Khách hàng.
class OpsSectionSwitcher extends StatelessWidget {
  const OpsSectionSwitcher({super.key, required this.current});
  final String current; // orders | trips | customers

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
        child: SegmentedButton<String>(
          showSelectedIcon: false,
          segments: const [
            ButtonSegment(value: 'orders', label: Text('Đơn hàng')),
            ButtonSegment(value: 'trips', label: Text('Chuyến')),
            ButtonSegment(value: 'customers', label: Text('Khách hàng')),
          ],
          selected: {current},
          onSelectionChanged: (s) {
            final v = s.first;
            if (v == current) return;
            context.go(v == 'orders' ? MerchantRoutes.pOrders : v == 'trips' ? MerchantRoutes.pTrips : MerchantRoutes.pCustomers);
          },
        ),
      );
}
