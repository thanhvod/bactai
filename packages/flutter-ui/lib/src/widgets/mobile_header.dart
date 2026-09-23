import 'package:flutter/material.dart';
import '../tokens/bta_tokens.dart';

/// Header mỗi màn: cao ≥60dp, nút back 44dp, title + subtitle, actions.
class MobileHeader extends StatelessWidget implements PreferredSizeWidget {
  const MobileHeader({super.key, required this.title, this.subtitle, this.onBack, this.actions, this.bottom});

  final String title;
  final String? subtitle;
  final VoidCallback? onBack;
  final List<Widget>? actions;
  final PreferredSizeWidget? bottom;

  @override
  Size get preferredSize => Size.fromHeight(64 + (bottom?.preferredSize.height ?? 0));

  @override
  Widget build(BuildContext context) {
    return AppBar(
      toolbarHeight: 64,
      leadingWidth: onBack == null ? 0 : 56,
      automaticallyImplyLeading: false,
      leading: onBack == null
          ? null
          : IconButton(onPressed: onBack, icon: const Icon(Icons.arrow_back), iconSize: 24, constraints: const BoxConstraints.tightFor(width: 44, height: 44), tooltip: 'Quay lại'),
      titleSpacing: onBack == null ? BtaSpace.s4 : 0,
      title: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(title, style: BtaText.headingMd, maxLines: 1, overflow: TextOverflow.ellipsis),
          if (subtitle != null) Text(subtitle!, style: BtaText.bodySm.copyWith(color: BtaColors.textMuted), maxLines: 1, overflow: TextOverflow.ellipsis),
        ],
      ),
      actions: actions,
      bottom: bottom,
      shape: const Border(bottom: BorderSide(color: BtaColors.border)),
    );
  }
}
