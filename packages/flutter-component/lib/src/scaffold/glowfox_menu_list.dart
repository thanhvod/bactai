import 'package:flutter/material.dart';
import 'package:flutter_ui/flutter_ui.dart';

class GFMenuGroup {
  const GFMenuGroup({required this.title, required this.items});

  final String title;
  final List<GFMenuItem> items;
}

class GFMenuItem {
  const GFMenuItem({
    required this.label,
    required this.icon,
    this.badge,
    this.onTap,
    this.isDestructive = false,
    this.children,
  });

  final String label;
  final Widget icon;
  final String? badge;
  final VoidCallback? onTap;
  final bool isDestructive;
  final List<GFMenuItem>? children;
}

/// Full-screen menu list with grouped items, similar to Shopify mobile admin.
class GFMenuList extends StatelessWidget {
  const GFMenuList({super.key, required this.groups});

  final List<GFMenuGroup> groups;

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: groups.length,
      itemBuilder: (context, i) => _GroupSection(group: groups[i]),
    );
  }
}

class _GroupSection extends StatelessWidget {
  const _GroupSection({required this.group});

  final GFMenuGroup group;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 8),
          child: Text(group.title.toUpperCase(), style: GFTypography.labelSm),
        ),
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            color: GFColors.surface,
            borderRadius: GFRadius.lg,
            border: Border.all(color: GFColors.border),
          ),
          child: Column(
            children: group.items
                .map((item) => _MenuItem(item: item, isLast: item == group.items.last))
                .toList(),
          ),
        ),
      ],
    );
  }
}

class _MenuItem extends StatelessWidget {
  const _MenuItem({required this.item, required this.isLast});

  final GFMenuItem item;
  final bool isLast;

  @override
  Widget build(BuildContext context) {
    final fg = item.isDestructive ? GFColors.error : GFColors.textPrimary;
    final iconColor = item.isDestructive ? GFColors.error : GFColors.textSecondary;

    return Column(
      children: [
        InkWell(
          onTap: item.onTap,
          borderRadius: isLast ? const BorderRadius.only(
            bottomLeft: Radius.circular(GFRadius.lgValue),
            bottomRight: Radius.circular(GFRadius.lgValue),
          ) : BorderRadius.zero,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                IconTheme(
                  data: IconThemeData(color: iconColor, size: 20),
                  child: item.icon,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(item.label, style: GFTypography.body.copyWith(color: fg)),
                ),
                if (item.badge != null)
                  GFBadge(label: item.badge!, variant: GFBadgeVariant.primary),
                if (item.badge == null)
                  const Icon(Icons.chevron_right, size: 18, color: GFColors.textTertiary),
              ],
            ),
          ),
        ),
        if (!isLast)
          const Divider(height: 1, indent: 48, color: GFColors.border),
      ],
    );
  }
}
