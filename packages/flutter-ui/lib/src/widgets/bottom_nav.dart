import 'package:flutter/material.dart';
import '../tokens/bta_tokens.dart';

class BottomNavTab {
  const BottomNavTab({required this.icon, required this.label, this.selectedIcon});
  final IconData icon;
  final IconData? selectedIcon;
  final String label;
}

/// Bottom navigation dùng chung: tài xế 4 tab, merchant 5 tab. Badge số đếm theo index.
class BtaBottomNav extends StatelessWidget {
  const BtaBottomNav({super.key, required this.tabs, required this.index, required this.onSelect, this.badges = const {}});
  final List<BottomNavTab> tabs;
  final int index;
  final ValueChanged<int> onSelect;
  final Map<int, int> badges;

  @override
  Widget build(BuildContext context) {
    return NavigationBar(
      selectedIndex: index,
      onDestinationSelected: onSelect,
      labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
      destinations: [
        for (var i = 0; i < tabs.length; i++)
          NavigationDestination(
            icon: _badged(Icon(tabs[i].icon, color: BtaColors.textMuted), badges[i]),
            selectedIcon: _badged(Icon(tabs[i].selectedIcon ?? tabs[i].icon, color: BtaColors.primary), badges[i]),
            label: tabs[i].label,
          ),
      ],
    );
  }

  Widget _badged(Widget icon, int? count) {
    if (count == null || count <= 0) return icon;
    return Badge.count(count: count, backgroundColor: BtaColors.danger, child: icon);
  }
}
