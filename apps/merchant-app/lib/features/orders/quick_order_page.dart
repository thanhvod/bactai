import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/merchant_graphql_client.dart';
import '../../core/app_scope.dart';
import '../../core/permissions.dart';
import '../../core/router/routes.dart';
import '../../data/merchant_repository.dart';
import '../../models/models.dart';
import '../../shared/money_field.dart';
import '../../shared/ui_helpers.dart';

/// Kiểm tra form tạo nhanh (tách để unit test).
String? validateQuickOrder({String? customerId, CustomerLocationItem? pickup, CustomerLocationItem? dropoff, int? freight}) {
  if (customerId == null) return 'Chọn khách hàng';
  if (pickup == null) return 'Chọn điểm lấy hàng';
  if (dropoff == null) return 'Chọn điểm trả hàng';
  if (freight == null || freight <= 0) return 'Nhập giá cước (số nguyên VND > 0)';
  return null;
}

String isoDay(DateTime d) => '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

/// MA-ORD-03 — tạo nhanh đơn 1 điểm lấy / 1 điểm trả; phần chi tiết chỉnh trên web.
class QuickOrderPage extends StatefulWidget {
  const QuickOrderPage({super.key, this.customerId});
  final String? customerId;
  @override
  State<QuickOrderPage> createState() => _QuickOrderPageState();
}

class _QuickOrderPageState extends State<QuickOrderPage> {
  CustomerItem? _customer;
  List<CustomerLocationItem> _locations = const [];
  CustomerLocationItem? _pickup, _dropoff;
  int? _freight;
  final _cargo = TextEditingController();
  DateTime? _due;
  bool _confirmed = false;
  bool _saving = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    if (widget.customerId != null) WidgetsBinding.instance.addPostFrameCallback((_) => _loadCustomer(widget.customerId!));
  }

  @override
  void dispose() {
    _cargo.dispose();
    super.dispose();
  }

  Future<void> _loadCustomer(String id) async {
    final repo = AppScope.repo(context);
    try {
      final c = await repo.customer(id);
      final locs = await repo.customerLocations(id);
      if (!mounted) return;
      setState(() {
        _customer = c;
        _locations = locs;
        _pickup = locs.where((l) => l.canPickup).firstOrNull;
        _dropoff = locs.where((l) => l.canDrop && l.id != _pickup?.id).firstOrNull;
        final days = c.defaultDebtDays;
        _due = days == null ? null : DateTime.now().add(Duration(days: days));
      });
    } catch (e) {
      if (mounted) setState(() => _error = errorMessage(e));
    }
  }

  Future<void> _pickCustomer() async {
    final c = await showModalBottomSheet<CustomerItem>(context: context, isScrollControlled: true, builder: (_) => const _CustomerSearchSheet());
    if (c != null) await _loadCustomer(c.id);
  }

  Future<void> _submit() async {
    final err = validateQuickOrder(customerId: _customer?.id, pickup: _pickup, dropoff: _dropoff, freight: _freight);
    if (err != null) {
      setState(() => _error = err);
      return;
    }
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      final r = await AppScope.repo(context).createQuickOrder(QuickOrderInput(
        customerId: _customer!.id,
        pickupLocationId: _pickup!.id,
        pickupAddress: _pickup!.address,
        pickupName: _pickup!.name,
        dropoffLocationId: _dropoff!.id,
        dropoffAddress: _dropoff!.address,
        dropoffName: _dropoff!.name,
        freightAmount: _freight!,
        cargoNote: _cargo.text,
        dueDate: _due == null ? null : isoDay(_due!),
        confirmed: _confirmed,
      ));
      if (!mounted) return;
      showSnack(context, 'Đã tạo đơn ${r.code}${r.warnings.isNotEmpty ? ' — ${r.warnings.first}' : ''}');
      context.pushReplacement(MerchantRoutes.orderDetailPath(r.orderId));
    } catch (e) {
      if (mounted) setState(() => _error = errorMessage(e));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = AppScope.of(context).auth;
    if (!auth.can(Perm.orderCreate)) {
      return Scaffold(
        appBar: MobileHeader(title: 'Tạo nhanh đơn', onBack: () => context.pop()),
        body: const EmptyState(icon: Icons.lock_outline, message: 'Bạn chưa được cấp quyền tạo đơn'),
      );
    }
    final c = _customer;
    return Scaffold(
      appBar: MobileHeader(title: 'Tạo nhanh đơn', subtitle: 'Chi tiết khác chỉnh trên web', onBack: context.canPop() ? () => context.pop() : null),
      bottomNavigationBar: PrimaryBottomAction(label: _saving ? 'Đang lưu...' : 'Tạo đơn', icon: Icons.check, onPressed: _saving ? null : _submit),
      body: ListView(padding: const EdgeInsets.all(BtaSpace.s4), children: [
        if (_error != null) ...[BtaBanner(tone: BtaTone.danger, message: _error!), const SizedBox(height: BtaSpace.s3)],
        ListRow(
          icon: Icons.person_outline,
          label: c?.name ?? 'Chọn khách hàng *',
          value: c == null ? null : '${c.code}${c.remaining > 0 ? ' · còn nợ ${BtaFormat.vnd(c.remaining)}' : ''}',
          onTap: _pickCustomer,
          trailing: const Icon(Icons.chevron_right),
        ),
        if (c != null && c.warnings.isNotEmpty) BtaBanner(tone: BtaTone.warning, message: c.warnings.join('\n'), dense: true),
        const SizedBox(height: BtaSpace.s3),
        _LocationDropdown(label: 'Điểm lấy hàng *', items: _locations.where((l) => l.canPickup).toList(), value: _pickup, onChanged: (v) => setState(() => _pickup = v)),
        const SizedBox(height: BtaSpace.s3),
        _LocationDropdown(label: 'Điểm trả hàng *', items: _locations.where((l) => l.canDrop).toList(), value: _dropoff, onChanged: (v) => setState(() => _dropoff = v)),
        if (c != null && _locations.isEmpty)
          const Padding(padding: EdgeInsets.only(top: 8), child: BtaBanner(tone: BtaTone.info, message: 'Khách chưa có sổ địa chỉ — thêm trên Web Merchant.', dense: true)),
        const SizedBox(height: BtaSpace.s3),
        MoneyField(label: 'Giá cước *', fieldKey: const Key('freight'), onChanged: (v) => _freight = v),
        const SizedBox(height: BtaSpace.s3),
        TextField(controller: _cargo, decoration: const InputDecoration(labelText: 'Ghi chú hàng hóa (vd: 10 tấn gạo)', border: OutlineInputBorder())),
        const SizedBox(height: BtaSpace.s3),
        ListRow(
          icon: Icons.event_outlined,
          label: 'Hạn thanh toán',
          value: _due == null ? 'Chưa chọn' : BtaFormat.date(_due),
          trailing: const Icon(Icons.edit_calendar_outlined),
          onTap: () async {
            final d = await showDatePicker(context: context, firstDate: DateTime.now().subtract(const Duration(days: 30)), lastDate: DateTime.now().add(const Duration(days: 365)), initialDate: _due ?? DateTime.now());
            if (d != null) setState(() => _due = d);
          },
        ),
        const SizedBox(height: BtaSpace.s3),
        SegmentedButton<bool>(
          segments: const [ButtonSegment(value: false, label: Text('Lưu nháp')), ButtonSegment(value: true, label: Text('Đã xác nhận'))],
          selected: {_confirmed},
          onSelectionChanged: (s) => setState(() => _confirmed = s.first),
        ),
      ]),
    );
  }
}

class _LocationDropdown extends StatelessWidget {
  const _LocationDropdown({required this.label, required this.items, required this.value, required this.onChanged});
  final String label;
  final List<CustomerLocationItem> items;
  final CustomerLocationItem? value;
  final ValueChanged<CustomerLocationItem?> onChanged;
  @override
  Widget build(BuildContext context) => DropdownButtonFormField<String>(
        initialValue: items.any((l) => l.id == value?.id) ? value?.id : null,
        isExpanded: true,
        decoration: InputDecoration(labelText: label, border: const OutlineInputBorder()),
        items: [for (final l in items) DropdownMenuItem(value: l.id, child: Text('${l.name} — ${l.address}', overflow: TextOverflow.ellipsis))],
        onChanged: (id) => onChanged(items.where((l) => l.id == id).firstOrNull),
      );
}

class _CustomerSearchSheet extends StatefulWidget {
  const _CustomerSearchSheet();
  @override
  State<_CustomerSearchSheet> createState() => _CustomerSearchSheetState();
}

class _CustomerSearchSheetState extends State<_CustomerSearchSheet> {
  List<CustomerItem> _items = const [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _search(''));
  }

  Future<void> _search(String q) async {
    setState(() => _loading = true);
    try {
      final p = await AppScope.repo(context).customers(search: q);
      if (mounted) setState(() => _items = p.items);
    } catch (e) {
      if (mounted) setState(() => _error = errorMessage(e));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) => SafeArea(
        child: SizedBox(
          height: MediaQuery.of(context).size.height * 0.8,
          child: Column(children: [
            Padding(
              padding: const EdgeInsets.all(BtaSpace.s4),
              child: TextField(
                autofocus: true,
                decoration: const InputDecoration(prefixIcon: Icon(Icons.search), hintText: 'Tên, SĐT, mã khách', border: OutlineInputBorder()),
                onSubmitted: _search,
              ),
            ),
            Expanded(
              child: _loading
                  ? const Center(child: CircularProgressIndicator())
                  : _error != null
                      ? ErrorState(message: _error!, onRetry: () => _search(''))
                      : _items.isEmpty
                          ? const EmptyState(message: 'Không tìm thấy khách hàng')
                          : ListView(children: [
                              for (final c in _items)
                                ListRow(icon: Icons.business_outlined, label: c.name, value: [c.code, c.phone].whereType<String>().join(' · '), onTap: () => Navigator.of(context).pop(c)),
                            ]),
            ),
          ]),
        ),
      );
}
