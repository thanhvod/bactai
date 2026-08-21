import 'package:flutter/material.dart';

/// Conditionally renders [child] based on a permission flag.
///
/// When [hasPermission] is false, renders [fallback] (default: empty).
/// The backend always re-enforces permissions; this only controls UX visibility.
class PermissionGate extends StatelessWidget {
  const PermissionGate({
    super.key,
    required this.hasPermission,
    required this.child,
    this.fallback,
  });

  final bool hasPermission;
  final Widget child;
  final Widget? fallback;

  @override
  Widget build(BuildContext context) {
    if (hasPermission) return child;
    return fallback ?? const SizedBox.shrink();
  }
}
