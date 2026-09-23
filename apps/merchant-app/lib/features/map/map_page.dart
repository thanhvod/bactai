import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:go_router/go_router.dart';
import 'package:latlong2/latlong.dart';

import '../../core/app_scope.dart';
import '../../core/router/routes.dart';
import '../../models/models.dart';
import '../../shared/async_view.dart';
import '../../shared/ui_helpers.dart';

/// MA-MAP-01 — vị trí gần nhất của các chuyến đang chạy (OSM tiles).
class MapPage extends StatelessWidget {
  const MapPage({super.key});

  @override
  Widget build(BuildContext context) {
    final repo = AppScope.repo(context);
    return Scaffold(
      appBar: MobileHeader(title: 'Theo dõi xe', subtitle: 'Vị trí GPS gần nhất', onBack: context.canPop() ? () => context.pop() : null),
      body: AsyncView<List<LocationPin>>(
        load: repo.lastKnownLocations,
        isEmpty: (l) => l.isEmpty,
        emptyMessage: 'Chưa có xe nào đang chạy có vị trí GPS',
        emptyIcon: Icons.location_off_outlined,
        builder: (context, pins, reload) => Column(children: [
          SizedBox(
            height: 300,
            child: FlutterMap(
              options: MapOptions(initialCenter: LatLng(pins.first.lat, pins.first.lng), initialZoom: 9),
              children: [
                TileLayer(urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', userAgentPackageName: 'vn.bta.merchant_app'),
                MarkerLayer(markers: [
                  for (final p in pins)
                    Marker(
                      point: LatLng(p.lat, p.lng),
                      width: 44,
                      height: 44,
                      child: GestureDetector(
                        onTap: () => context.push(MerchantRoutes.tripDetailPath(p.tripId)),
                        child: Icon(Icons.local_shipping, color: p.isStale ? BtaColors.textSubtle : BtaColors.primary, size: 32),
                      ),
                    ),
                ]),
                const RichAttributionWidget(attributions: [TextSourceAttribution('OpenStreetMap contributors')]),
              ],
            ),
          ),
          Expanded(
            child: ListView.separated(
              itemCount: pins.length,
              separatorBuilder: (_, _) => const Divider(height: 1),
              itemBuilder: (context, i) {
                final p = pins[i];
                return ListTile(
                  onTap: () => context.push(MerchantRoutes.tripDetailPath(p.tripId)),
                  leading: Icon(Icons.local_shipping_outlined, color: p.isStale ? BtaColors.textSubtle : BtaColors.primary),
                  title: Text('${p.vehiclePlate ?? '—'} · ${p.tripCode}'),
                  subtitle: Text('${p.driverName ?? ''} · cập nhật ${BtaFormat.dateTime(p.capturedAt)}${p.isStale ? ' (cũ)' : ''}'),
                  trailing: tripBadge(p.tripStatus),
                );
              },
            ),
          ),
        ]),
      ),
    );
  }
}
