import 'package:flutter/material.dart';
import 'package:flutter_ui/flutter_ui.dart';

/// Top app bar for the home shell — shows merchant name, switcher, and notification bell.
class GFTopHeader extends StatelessWidget implements PreferredSizeWidget {
  const GFTopHeader({
    super.key,
    required this.merchantName,
    this.onSwitchMerchant,
    this.notificationCount = 0,
    this.onNotificationTap,
    this.avatarUrl,
    this.avatarInitials,
  });

  final String merchantName;
  final VoidCallback? onSwitchMerchant;
  final int notificationCount;
  final VoidCallback? onNotificationTap;
  final String? avatarUrl;
  final String? avatarInitials;

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: GFColors.surface,
      elevation: 0,
      scrolledUnderElevation: 0.5,
      titleSpacing: 0,
      title: GestureDetector(
        onTap: onSwitchMerchant,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(merchantName, style: GFTypography.h3),
              if (onSwitchMerchant != null) ...[
                const SizedBox(width: 4),
                const Icon(Icons.unfold_more, size: 18, color: GFColors.textSecondary),
              ],
            ],
          ),
        ),
      ),
      actions: [
        if (onNotificationTap != null)
          Stack(
            children: [
              GFIconButton(
                icon: const Icon(Icons.notifications_outlined),
                onPressed: onNotificationTap,
              ),
              if (notificationCount > 0)
                Positioned(
                  top: 6,
                  right: 6,
                  child: Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: GFColors.error,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
            ],
          ),
        GFAvatar(
          imageUrl: avatarUrl,
          initials: avatarInitials,
          size: 32,
        ),
        const SizedBox(width: 12),
      ],
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
