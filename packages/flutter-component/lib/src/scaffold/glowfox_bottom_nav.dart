import 'package:flutter/material.dart';
import 'package:flutter_ui/flutter_ui.dart';

class GFBottomNavItem {
  const GFBottomNavItem({
    required this.label,
    required this.icon,
    required this.activeIcon,
  });

  final String label;
  final Widget icon;
  final Widget activeIcon;
}

class GFBottomNav extends StatelessWidget {
  const GFBottomNav({
    super.key,
    required this.items,
    required this.currentIndex,
    required this.onTap,
  });

  final List<GFBottomNavItem> items;
  final int currentIndex;
  final ValueChanged<int> onTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: GFColors.surface,
        border: Border(top: BorderSide(color: GFColors.border)),
      ),
      child: SafeArea(
        top: false,
        child: BottomNavigationBar(
          currentIndex: currentIndex,
          onTap: onTap,
          backgroundColor: GFColors.surface,
          selectedItemColor: GFColors.primary,
          unselectedItemColor: GFColors.textSecondary,
          type: BottomNavigationBarType.fixed,
          elevation: 0,
          selectedLabelStyle: GFTypography.caption.copyWith(color: GFColors.primary, fontWeight: FontWeight.w600),
          unselectedLabelStyle: GFTypography.caption.copyWith(color: GFColors.textSecondary),
          items: items
              .map(
                (item) => BottomNavigationBarItem(
                  icon: item.icon,
                  activeIcon: item.activeIcon,
                  label: item.label,
                ),
              )
              .toList(),
        ),
      ),
    );
  }
}
