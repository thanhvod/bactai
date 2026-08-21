import 'package:flutter/material.dart';
import 'package:flutter_ui/flutter_ui.dart';

class MerchantSwitcherOption {
  const MerchantSwitcherOption({
    required this.id,
    required this.name,
    this.address,
    this.logoUrl,
  });

  final String id;
  final String name;
  final String? address;
  final String? logoUrl;
}

/// Bottom sheet to switch between merchants the logged-in user has access to.
class MerchantSwitcher extends StatelessWidget {
  const MerchantSwitcher({
    super.key,
    required this.merchants,
    required this.selectedId,
    required this.onSelect,
  });

  final List<MerchantSwitcherOption> merchants;
  final String selectedId;
  final ValueChanged<MerchantSwitcherOption> onSelect;

  @override
  Widget build(BuildContext context) {
    return GFSheet(
      title: 'Chọn cửa hàng',
      initialChildSize: 0.5,
      child: Column(
        children: merchants.map((m) => _MerchantTile(
          merchant: m,
          isSelected: m.id == selectedId,
          onTap: () {
            Navigator.of(context).pop();
            onSelect(m);
          },
        )).toList(),
      ),
    );
  }

  static Future<void> show({
    required BuildContext context,
    required List<MerchantSwitcherOption> merchants,
    required String selectedId,
    required ValueChanged<MerchantSwitcherOption> onSelect,
  }) {
    return GFSheet.show(
      context: context,
      title: 'Chọn cửa hàng',
      initialChildSize: 0.5,
      child: Column(
        children: merchants.map((m) => _MerchantTile(
          merchant: m,
          isSelected: m.id == selectedId,
          onTap: () {
            Navigator.of(context).pop();
            onSelect(m);
          },
        )).toList(),
      ),
    );
  }
}

class _MerchantTile extends StatelessWidget {
  const _MerchantTile({required this.merchant, required this.isSelected, required this.onTap});

  final MerchantSwitcherOption merchant;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: onTap,
      leading: GFAvatar(
        imageUrl: merchant.logoUrl,
        initials: merchant.name.isNotEmpty ? merchant.name[0] : '?',
        size: 40,
      ),
      title: Text(merchant.name, style: GFTypography.label),
      subtitle: merchant.address != null
          ? Text(merchant.address!, style: GFTypography.bodySm)
          : null,
      trailing: isSelected
          ? const Icon(Icons.check_circle, color: GFColors.primary)
          : null,
    );
  }
}
