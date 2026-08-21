import 'package:flutter/material.dart';
import '../theme/glowfox_colors.dart';
import '../theme/glowfox_radius.dart';
import '../theme/glowfox_typography.dart';

class GFTab {
  const GFTab({required this.label, this.icon});
  final String label;
  final Widget? icon;
}

class GFTabs extends StatelessWidget {
  const GFTabs({
    super.key,
    required this.tabs,
    required this.children,
    this.controller,
  });

  final List<GFTab> tabs;
  final List<Widget> children;
  final TabController? controller;

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: tabs.length,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TabBar(
            controller: controller,
            isScrollable: tabs.length > 4,
            labelStyle: GFTypography.label.copyWith(color: GFColors.primary),
            unselectedLabelStyle: GFTypography.label.copyWith(color: GFColors.textSecondary),
            indicatorColor: GFColors.primary,
            indicatorSize: TabBarIndicatorSize.label,
            tabs: tabs.map((t) => Tab(text: t.label, icon: t.icon)).toList(),
          ),
          Expanded(
            child: TabBarView(
              controller: controller,
              children: children,
            ),
          ),
        ],
      ),
    );
  }
}
