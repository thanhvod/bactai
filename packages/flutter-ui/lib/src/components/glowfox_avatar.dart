import 'package:flutter/material.dart';
import '../theme/glowfox_colors.dart';
import '../theme/glowfox_typography.dart';

class GFAvatar extends StatelessWidget {
  const GFAvatar({
    super.key,
    this.imageUrl,
    this.initials,
    this.size = 40.0,
    this.backgroundColor,
  });

  final String? imageUrl;
  final String? initials;
  final double size;
  final Color? backgroundColor;

  @override
  Widget build(BuildContext context) {
    return ClipOval(
      child: SizedBox(
        width: size,
        height: size,
        child: imageUrl != null
            ? Image.network(imageUrl!, fit: BoxFit.cover, errorBuilder: (_, __, ___) => _fallback())
            : _fallback(),
      ),
    );
  }

  Widget _fallback() {
    return ColoredBox(
      color: backgroundColor ?? GFColors.primaryLight,
      child: Center(
        child: Text(
          _initials(),
          style: GFTypography.label.copyWith(
            color: GFColors.primary,
            fontSize: size * 0.35,
          ),
        ),
      ),
    );
  }

  String _initials() {
    if (initials != null) return initials!.toUpperCase();
    return '?';
  }
}
