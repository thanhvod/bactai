import 'package:flutter/material.dart';
import 'package:flutter_ui/flutter_ui.dart';

/// Bell icon with unread count badge.
class NotificationBadge extends StatelessWidget {
  const NotificationBadge({
    super.key,
    this.count = 0,
    this.onTap,
  });

  final int count;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        GFIconButton(icon: const Icon(Icons.notifications_outlined), onPressed: onTap),
        if (count > 0)
          Positioned(
            top: 4,
            right: 4,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
              decoration: BoxDecoration(
                color: GFColors.error,
                borderRadius: GFRadius.full,
              ),
              child: Text(
                count > 99 ? '99+' : '$count',
                style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
              ),
            ),
          ),
      ],
    );
  }
}
